import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import PortfolioChart from "@/components/PortfolioChart";
import { formatDate } from "@/lib/dateUtils";
import { fetchAPI } from "@/lib/fetch";
import { Asset, AssetValueHistoryDataType } from "@/types/type";

type Range = "1M" | "6M" | "1Y" | "All";

const ranges: Range[] = ["1M", "6M", "1Y", "All"];
const months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const dateOptionStyle = {
  selected: {
    backgroundColor: "#449445",
    borderColor: "#449445",
  },
  default: {
    backgroundColor: "#FFFFFF",
    borderColor: "#D9D9D9",
  },
};

const dateOptionTextStyle = {
  selected: { color: "#FFFFFF" },
  default: { color: "#666666" },
};

const parseAssets = (value: unknown): Asset[] => {
  try {
    if (typeof value === "string") return JSON.parse(value) as Asset[];
    if (Array.isArray(value) && typeof value[0] === "string") {
      return JSON.parse(value[0]) as Asset[];
    }
    return Array.isArray(value) ? (value as Asset[]) : [];
  } catch {
    return [];
  }
};

const formatCurrency = (value: number) =>
  value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const parseHistoryDate = (date: string) => {
  const [year, month, day] = date.split("/").map(Number);
  return new Date(year, month - 1, day);
};

function ItemDetail() {
  const params = useLocalSearchParams();
  const { user } = useUser();
  const assets = useMemo(() => parseAssets(params.assets), [params.assets]);
  const assetId = Number(
    Array.isArray(params.assetId) ? params.assetId[0] : params.assetId,
  );
  const asset = assets.find((item) => item.asset_id === assetId);

  const [assetName, setAssetName] = useState(asset?.asset_name ?? "");
  const [valueHistory, setValueHistory] = useState<AssetValueHistoryDataType[]>(
    asset?.value_history ?? [],
  );
  const [range, setRange] = useState<Range>("1Y");
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [newAssetValue, setNewAssetValue] = useState("");
  const hasPendingChanges = useRef(false);

  useEffect(() => {
    if (!asset || !user || !hasPendingChanges.current) return;
    hasPendingChanges.current = false;

    const saveData = async () => {
      const updatedAssets = assets.map((item) =>
        item.asset_id === assetId
          ? { ...item, asset_name: assetName, value_history: valueHistory }
          : item,
      );

      try {
        await fetchAPI("/(api)/user", {
          method: "PUT",
          body: JSON.stringify({ clerkId: user.id, assets: updatedAssets }),
        });
      } catch {
        Alert.alert("Save failed", "Your changes could not be saved.");
      }
    };

    void saveData();
  }, [asset, assetId, assetName, assets, user, valueHistory]);

  const visibleHistory = useMemo(() => {
    if (range === "All") return valueHistory;

    const latest = valueHistory.at(-1);
    if (!latest) return [];

    const monthsToShow = range === "1M" ? 1 : range === "6M" ? 6 : 12;
    const cutoff = parseHistoryDate(latest.date);
    cutoff.setMonth(cutoff.getMonth() - monthsToShow);

    return valueHistory.filter((item) => parseHistoryDate(item.date) >= cutoff);
  }, [range, valueHistory]);

  const currentValue = valueHistory.at(-1)?.value ?? 0;
  const firstValue = visibleHistory[0]?.value ?? currentValue;
  const change = currentValue - firstValue;
  const changePercent = firstValue ? (change / firstValue) * 100 : 0;
  const isPositive = change >= 0;

  const updateValue = (index: number, value: string) => {
    const numericValue = value === "" ? 0 : Number(value);
    if (Number.isNaN(numericValue)) return;
    hasPendingChanges.current = true;
    setValueHistory((history) =>
      history.map((item, itemIndex) =>
        itemIndex === index ? { ...item, value: numericValue } : item,
      ),
    );
  };

  const removeValue = (index: number) => {
    if (valueHistory.length <= 1) return;
    hasPendingChanges.current = true;
    hasPendingChanges.current = true;
    setValueHistory((history) =>
      history
        .filter((_, itemIndex) => itemIndex !== index)
        .map((item, month) => ({ ...item, month })),
    );
  };

  const addValue = () => {
    const date = formatDate(new Date(selectedYear, selectedMonth - 1, 1));

    if (valueHistory.some((item) => item.date === date)) {
      Alert.alert("Date already added", `A value for ${date} already exists.`);
      return;
    }

    const value = Number(newAssetValue);
    if (!newAssetValue || Number.isNaN(value)) {
      Alert.alert("Enter a value", "Add a valid asset value to continue.");
      return;
    }

    setValueHistory((history) =>
      [...history, { date, value, month: 0 }]
        .sort((a, b) => a.date.localeCompare(b.date))
        .map((item, month) => ({ ...item, month })),
    );
    setNewAssetValue("");
    setShowDatePicker(false);
  };

  const deleteAsset = () => {
    Alert.alert(
      "Delete asset",
      "This asset and its value history will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            if (!user) return;
            try {
              await fetchAPI("/(api)/user", {
                method: "PUT",
                body: JSON.stringify({
                  clerkId: user.id,
                  assets: assets.filter((item) => item.asset_id !== assetId),
                }),
              });
              router.back();
            } catch {
              Alert.alert("Delete failed", "The asset could not be deleted.");
            }
          },
        },
      ],
    );
  };

  if (!asset) {
    return (
      <SafeAreaView className="flex-1 items-center justify-center bg-secondary-100 px-6">
        <Ionicons name="alert-circle-outline" size={32} color="#858585" />
        <Text className="mt-4 text-lg font-semibold text-secondary-900">
          Asset not found
        </Text>
        <TouchableOpacity className="mt-6" onPress={() => router.back()}>
          <Text className="font-semibold text-primary-600">
            Return to portfolio
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-secondary-100"
      edges={["top", "left", "right"]}
    >
      <FlatList
        className="px-6"
        contentContainerStyle={{ paddingBottom: 36 }}
        data={[...valueHistory].reverse()}
        keyExtractor={(item) => item.date}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const originalIndex = valueHistory.length - 1 - index;
          return (
            <View className="flex-row items-center border-b border-secondary-300 py-4">
              <View className="flex-1">
                <Text className="text-sm text-secondary-600">{item.date}</Text>
                <View className="mt-1 flex-row items-center">
                  <Text className="text-base font-semibold text-secondary-900">
                    $
                  </Text>
                  <TextInput
                    className="ml-0.5 min-w-24 py-0 text-base font-semibold text-secondary-900"
                    keyboardType="decimal-pad"
                    onChangeText={(text) => updateValue(originalIndex, text)}
                    selectTextOnFocus
                    value={item.value.toString()}
                  />
                </View>
              </View>
              <TouchableOpacity
                accessibilityLabel={`Remove value from ${item.date}`}
                className="h-10 w-10 items-center justify-center"
                disabled={valueHistory.length <= 1}
                onPress={() => removeValue(originalIndex)}
              >
                <Ionicons
                  color={valueHistory.length <= 1 ? "#C2C2C2" : "#C53030"}
                  name="trash-outline"
                  size={19}
                />
              </TouchableOpacity>
            </View>
          );
        }}
        ListHeaderComponent={
          <View>
            <View className="mt-2 flex-row items-center justify-between py-2">
              <TouchableOpacity
                accessibilityLabel="Back"
                className="h-11 w-11 items-center justify-center rounded-full border border-secondary-300"
                onPress={() => router.back()}
              >
                <Ionicons name="chevron-back" size={23} color="#333333" />
              </TouchableOpacity>
              <TouchableOpacity
                accessibilityLabel="Delete asset"
                className="h-11 w-11 items-center justify-center"
                onPress={deleteAsset}
              >
                <Ionicons name="trash-outline" size={21} color="#C53030" />
              </TouchableOpacity>
            </View>

            <View className="mt-5 flex-row items-center">
              <TextInput
                className="h-10 flex-1 py-0 text-[30px] font-bold leading-[36px] tracking-[-0.8px] text-secondary-900"
                onChangeText={(text) => {
                  hasPendingChanges.current = true;
                  setAssetName(text);
                }}
                placeholder="Asset name"
                placeholderTextColor="#999999"
                textAlignVertical="center"
                value={assetName}
              />
              <Ionicons color="#858585" name="pencil-outline" size={20} />
            </View>

            <View className="mt-8">
              <Text className="text-[40px] font-bold leading-[46px] tracking-[-1.2px] text-secondary-900">
                ${formatCurrency(currentValue)}
              </Text>
              <Text
                className={`mt-2 text-base font-semibold ${isPositive ? "text-primary-600" : "text-danger-600"}`}
              >
                {isPositive ? "+" : "-"}${formatCurrency(Math.abs(change))} (
                {isPositive ? "+" : ""}
                {changePercent.toFixed(1)}%)
              </Text>
            </View>

            <View className="mt-5">
              <PortfolioChart data={visibleHistory} />
            </View>

            <View className="mt-4 flex-row border-b border-secondary-300 pb-5">
              {ranges.map((item) => {
                const selected = item === range;
                return (
                  <TouchableOpacity
                    accessibilityRole="button"
                    accessibilityLabel={`Show ${item} asset history`}
                    accessibilityState={{ selected }}
                    activeOpacity={1}
                    className="min-h-11 flex-1 items-center justify-center"
                    key={item}
                    onPress={() => setRange(item)}
                  >
                    <View
                      className={`h-11 w-16 items-center justify-center rounded-full ${
                        selected ? "bg-[#EAF5EA]" : "bg-transparent"
                      }`}
                    >
                      <Text
                        className={`text-base font-medium ${
                          selected ? "text-primary-600" : "text-secondary-700"
                        }`}
                      >
                        {item}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            <View className="mt-6 flex-row items-center justify-between">
              <View>
                <Text className="text-2xl font-bold tracking-[-0.4px] text-secondary-900">
                  Value history
                </Text>
                <Text className="mt-1 text-sm text-secondary-600">
                  {valueHistory.length}{" "}
                  {valueHistory.length === 1 ? "entry" : "entries"}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                <Text className="text-base font-semibold text-primary-600">
                  + Add
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View className="items-center py-12">
            <ActivityIndicator color="#449445" size="small" />
          </View>
        }
      />

      <Modal
        animationType="slide"
        onRequestClose={() => setShowDatePicker(false)}
        transparent
        visible={showDatePicker}
      >
        <View className="flex-1 justify-end bg-black/40">
          <View className="rounded-t-[28px] bg-secondary-100 px-6 pb-10 pt-6">
            <View className="mb-7 flex-row items-center justify-between">
              <Text className="text-2xl font-bold tracking-[-0.4px] text-secondary-900">
                Add value
              </Text>
              <TouchableOpacity
                className="h-10 w-10 items-center justify-center rounded-full border border-secondary-300"
                onPress={() => setShowDatePicker(false)}
              >
                <Ionicons name="close" size={22} color="#666666" />
              </TouchableOpacity>
            </View>

            <Text className="mb-2 text-sm font-medium text-secondary-700">
              Year
            </Text>
            <View className="mb-6 flex-row">
              {Array.from(
                { length: 5 },
                (_, index) => new Date().getFullYear() - 2 + index,
              ).map((year) => (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedYear === year }}
                  activeOpacity={1}
                  className="w-1/5 pr-2"
                  key={year}
                  onPress={() => setSelectedYear(year)}
                >
                  <View
                    className="items-center rounded-full border py-2.5"
                    style={
                      selectedYear === year
                        ? dateOptionStyle.selected
                        : dateOptionStyle.default
                    }
                  >
                    <Text
                      className="font-semibold"
                      style={
                        selectedYear === year
                          ? dateOptionTextStyle.selected
                          : dateOptionTextStyle.default
                      }
                    >
                      {year}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-2 text-sm font-medium text-secondary-700">
              Month
            </Text>
            <View className="mb-6 flex-row flex-wrap">
              {months.map((month, index) => (
                <TouchableOpacity
                  accessibilityRole="radio"
                  accessibilityState={{ selected: selectedMonth === index + 1 }}
                  activeOpacity={1}
                  className="mb-2 w-1/4 pr-2"
                  key={month}
                  onPress={() => setSelectedMonth(index + 1)}
                >
                  <View
                    className="items-center rounded-lg border py-2.5"
                    style={
                      selectedMonth === index + 1
                        ? dateOptionStyle.selected
                        : dateOptionStyle.default
                    }
                  >
                    <Text
                      className="font-medium"
                      style={
                        selectedMonth === index + 1
                          ? dateOptionTextStyle.selected
                          : dateOptionTextStyle.default
                      }
                    >
                      {month}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            <Text className="mb-2 text-sm font-medium text-secondary-700">
              Value
            </Text>
            <View className="mb-7 min-h-14 flex-row items-center rounded-xl border border-secondary-300 bg-white px-4">
              <Text className="text-base text-secondary-600">$</Text>
              <TextInput
                className="ml-2 flex-1 py-4 text-base font-semibold text-secondary-900"
                keyboardType="decimal-pad"
                onChangeText={setNewAssetValue}
                placeholder="0.00"
                placeholderTextColor="#999999"
                value={newAssetValue}
              />
            </View>

            <TouchableOpacity
              className="min-h-14 items-center justify-center rounded-full bg-primary-600 px-6"
              onPress={addValue}
            >
              <Text className="text-base font-semibold text-white">
                Add value
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

ItemDetail.displayName = "ItemDetail";

export default ItemDetail;
