import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import FinanceChart from "@/components/FinanceChart";
import { router, useLocalSearchParams } from "expo-router";
import { Asset } from "@/types/type";
import { icons } from "@/constants";
import { useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import { formatDate } from "@/lib/dateUtils";

function ItemDetail() {
  const params = useLocalSearchParams();

  // Defensive parsing of params.assets and params.assetId to avoid runtime
  // errors if the route was triggered incorrectly or params are malformed.
  let assets: Asset[] = [];
  let assetId: number | null = null;

  try {
    if (!params?.assets) {
      return (
        <SafeAreaView className="bg-white mb-10">
          <Text>Missing assets parameter</Text>
        </SafeAreaView>
      );
    }

    // params.assets can arrive as a JSON string, an array with a JSON string,
    // or already as a parsed object depending on navigation method.
    if (typeof params.assets === "string") {
      assets = JSON.parse(params.assets) as Asset[];
    } else if (Array.isArray(params.assets) && typeof params.assets[0] === "string") {
      assets = JSON.parse(params.assets[0] as string) as Asset[];
    } else {
      // Fallback: attempt to use it directly (any) then coerce
      assets = (params.assets as any) as Asset[];
    }

    // Parse the assetId safely
    const rawId = params?.assetId;
    if (!rawId) {
      return (
        <SafeAreaView className="bg-white mb-10">
          <Text>Missing assetId parameter</Text>
        </SafeAreaView>
      );
    }

    assetId = parseInt(Array.isArray(rawId) ? rawId[0] : (rawId as string), 10);
    if (Number.isNaN(assetId)) {
      return (
        <SafeAreaView className="bg-white mb-10">
          <Text>Invalid assetId parameter</Text>
        </SafeAreaView>
      );
    }
  } catch (err) {
    return (
      <SafeAreaView className="bg-white mb-10">
        <Text>Error parsing route parameters</Text>
      </SafeAreaView>
    );
  }

  // Find the asset by ID
  const asset: Asset | undefined = assets.find(
    (asset) => asset.asset_id === assetId,
  );

  // Handle the case where the asset is not found
  if (!asset) {
    return (
      <SafeAreaView className="bg-white mb-10">
        <Text>Asset not found</Text>
      </SafeAreaView>
    );
  }

  const [assetName, setAssetName] = useState(asset.asset_name);
  const [valueHistory, setValueHistory] = useState(asset.value_history);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [newAssetValue, setNewAssetValue] = useState("");
  const { user } = useUser();

  // Reset state when assetId changes
  useEffect(() => {
    setAssetName(asset.asset_name);
    setValueHistory(asset.value_history);
  }, [assetId]);

  // Navigate back to the home page
  const handleReturn = () => {
    router.back();
  };

  const handleNameChange = (text: string) => {
    setAssetName(text);
    asset.asset_name = text;
  };

  useEffect(() => {
    const saveData = async () => {
      const assetIndex = assets.findIndex(
        (index) => index.asset_id === assetId,
      );

      const updatedAsset = {
        ...assets[assetIndex],
        asset_name: assetName,
        value_history: valueHistory,
      };

      const updatedAssets = [...assets];
      updatedAssets[assetIndex] = updatedAsset;

      try {
        if (user) {
          await fetchAPI("/(api)/user", {
            method: "PUT",
            body: JSON.stringify({
              clerkId: user.id,
              assets: updatedAssets,
            }),
          });
        } else {
          console.error("User not found or user ID is missing");
        }
      } catch (error) {
        console.error("Error saving data:", error);
      }
    };

    if (valueHistory !== asset.value_history) {
      saveData();
    }
  }, [assetName, valueHistory]);

  const handleAddRow = () => {
    setShowDatePicker(true);
  };

  const handleDateSelection = () => {
    // Create the date in YYYY/MM/DD format
    const formattedDate = formatDate(
      new Date(selectedYear, selectedMonth - 1, 1),
    );

    // Check if this date already exists
    const dateExists = valueHistory.some(
      (entry) => entry.date === formattedDate,
    );

    if (dateExists) {
      alert(`Data for ${formattedDate} already exists!`);
      setShowDatePicker(false);
      return;
    }

    // Use the entered value or default to 0
    const value = newAssetValue === "" ? 0 : parseFloat(newAssetValue);

    const newRow = {
      date: formattedDate,
      value: value,
      month: 0, // Will be reindexed below
    };

    // Add the new row and sort by date to maintain chronological order
    const updatedHistory = [...valueHistory, newRow].sort((a, b) =>
      a.date.localeCompare(b.date),
    );

    // Update month indices to maintain proper order and ensure consistency
    const reindexedHistory = updatedHistory.map((entry, index) => ({
      date: entry.date,
      value: Number(entry.value), // Ensure value is a number
      month: index, // Consistent month indexing
    }));

    setValueHistory(reindexedHistory);
    setShowDatePicker(false);
    setNewAssetValue(""); // Reset the value input
  };

  // Remove a row from the value history
  const handleRemoveRow = () => {
    if (valueHistory.length > 1) {
      setValueHistory(valueHistory.slice(0, -1));
    }
  };

  const handleUpdate = (index: number, value: string) => {
    const updatedHistory = [...valueHistory];

    const numericValue = value === "" ? 0 : parseFloat(value);

    updatedHistory[index] = {
      date: updatedHistory[index].date,
      value: numericValue,
      month: updatedHistory[index].month || index, // Ensure month exists
    };

    setValueHistory(updatedHistory);
  };

  const handleDeleteAsset = async () => {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete this asset?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          onPress: async () => {
            const updatedAssets = assets.filter(
              (asset) => asset.asset_id !== assetId,
            );

            try {
                if (user) {
                try {
                  await fetchAPI("/(api)/user", {
                  method: "PUT",
                  body: JSON.stringify({
                    clerkId: user.id,
                    assets: updatedAssets,
                  }),
                  });
                  handleReturn();
                } catch (error) {
                  Alert.alert("Error", "Failed to delete the asset. Please try again.");
                }
                } else {
                  Alert.alert("Error", "User not found.");
                }
            } catch (error) {
            }
          },
        },
      ],
    );
  };

  return (
    <SafeAreaView className="bg-gray-50 flex-1">
      {/* Modern Header */}
      <View className="bg-white border-b border-gray-100 px-6 py-4 shadow-sm">
        <View className="flex-row items-center justify-between">
          <TouchableOpacity
            onPress={handleReturn}
            className="flex-row items-center bg-gray-100 px-4 py-2 rounded-full"
          >
            <Text className="text-gray-700 font-InterSemiBold">← Back</Text>
          </TouchableOpacity>
          <Text className="text-lg font-InterBold text-gray-900">
            Asset Details
          </Text>
          {/* Spacer for center alignment */}
          <View className="w-20" />
        </View>
      </View>

      <FlatList
        data={[...valueHistory].reverse()}
        renderItem={({ item, index }) => {
          // Map reversed index back to original for updates/deletes
          const originalIndex = valueHistory.length - 1 - index;
          
          return (
            <View className="bg-white mx-4 mb-3 rounded-2xl border border-gray-100 shadow-sm">
              <View className="flex-row items-center p-4">
                {/* Date Column */}
                <View className="flex-1">
                  <Text className="text-sm font-InterMedium text-gray-500 mb-1">
                    Date
                  </Text>
                  <Text className="text-base font-InterSemiBold text-gray-900">
                    {item.date}
                  </Text>
                </View>

                {/* Value Input Column */}
                <View className="flex-1">
                  <Text className="text-sm font-InterMedium text-gray-500 mb-1">
                    Value
                  </Text>
                  <View className="flex-row items-center bg-gray-50 rounded-xl px-3 py-2">
                    <Text className="font-InterMedium text-gray-600 mr-1">$</Text>
                    <TextInput
                      value={item.value.toString()}
                      onChangeText={(text) => handleUpdate(originalIndex, text)}
                      className="flex-1 font-InterSemiBold text-base text-gray-900"
                      keyboardType="numeric"
                      placeholder="0.00"
                      placeholderTextColor="#9CA3AF"
                    />
                  </View>
                </View>

                {/* Minimal Delete Button */}
                <TouchableOpacity
                  onPress={() => {
                    if (valueHistory.length > 1) {
                      const updatedHistory = valueHistory
                        .filter((_, i) => i !== originalIndex)
                        .map((entry, index) => ({
                          date: entry.date,
                          value: Number(entry.value),
                          month: index, // Reindex after deletion
                        }));
                      setValueHistory(updatedHistory);
                    }
                  }}
                  className="ml-3 w-8 h-8 bg-red-100 rounded-full items-center justify-center"
                >
                  <Text className="text-red-500 font-InterBold text-sm">×</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={() => (
          <View className="flex-1 items-center justify-center py-20">
            {valueHistory.length === 0 ? (
              <View className="items-center px-8">
                <View className="w-16 h-16 bg-gray-100 rounded-full items-center justify-center mb-4">
                  <Text className="text-2xl">📊</Text>
                </View>
                <Text className="text-lg font-InterBold text-gray-900 mb-2 text-center">
                  No Data Points
                </Text>
                <Text className="text-gray-600 font-InterMedium text-center">
                  Add your first data point to start tracking this asset.
                </Text>
              </View>
            ) : (
              <ActivityIndicator size="small" color="#4ca44d" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            {/* Asset Name Section */}
            <View className="bg-white mx-4 my-4 rounded-3xl border border-gray-100 shadow-sm p-6">
              <View className="mb-4">
                <Text className="text-sm font-InterMedium text-gray-500 mb-2">
                  Asset Name
                </Text>
                <View className="flex-row items-center bg-gray-50 rounded-2xl border-2 border-gray-100 px-4 py-3">
                  <Image
                    source={icons.edit}
                    className="w-5 h-5 mr-3"
                    style={{ tintColor: "#6B7280" }}
                    resizeMode="contain"
                  />
                  <TextInput
                    value={assetName}
                    onChangeText={handleNameChange}
                    className="flex-1 text-xl font-InterExtraBold text-gray-900"
                    placeholder="Enter asset name"
                    placeholderTextColor="#9CA3AF"
                  />
                </View>
              </View>
            </View>

            {/* Chart Section */}
            <View className="bg-white mx-4 mb-6 rounded-3xl border border-gray-100 shadow-sm p-6">
              <FinanceChart
                data={valueHistory}
                showCurrentStatusTitle={true}
                height={320}
                showInteractiveFeatures={true}
              />
            </View>

            {/* Data Points Header with Add button */}
            <View className="flex-row items-center justify-between mx-4 mb-4">
              <Text className="text-xl font-InterBold text-gray-900">
                Data Points
              </Text>
              <View className="flex-row items-center">
                <View className="bg-primary-100 px-3 py-1 rounded-full">
                  <Text className="text-primary-700 font-InterSemiBold text-sm">
                    {valueHistory.length} entries
                  </Text>
                </View>
                
                {/* Minimal Add button */}
                <TouchableOpacity
                  onPress={handleAddRow}
                  className="ml-3 w-8 h-8 bg-primary-500 rounded-full items-center justify-center"
                >
                  <Text className="text-white font-InterBold text-sm">+</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        }

        ListFooterComponent={
          <View className="mx-4 mt-6">
            {/* Danger Zone */}
            <View className="h-px bg-gray-200 mx-6 mb-6" />
            <View className="bg-red-50 border border-red-200 rounded-3xl p-6">
              <Text className="text-lg font-InterBold text-red-800 mb-2">
                Danger Zone
              </Text>
              <Text className="text-red-600 font-InterMedium text-sm mb-4">
                This action cannot be undone. All data will be permanently
                deleted.
              </Text>

              <TouchableOpacity
                onPress={handleDeleteAsset}
                className="bg-white py-3 px-6 rounded-2xl shadow-sm"
              >
                <Text className="text-red-500 text-center font-InterBold">
                  Delete Asset
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
      />

      {/* Modern Date Picker Modal */}
      <Modal
        visible={showDatePicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowDatePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl p-6 max-h-4/5">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-2xl font-InterExtraBold text-gray-900">
                Select Date
              </Text>
              <TouchableOpacity
                onPress={() => setShowDatePicker(false)}
                className="w-8 h-8 bg-gray-100 rounded-full items-center justify-center"
              >
                <Text className="text-gray-600 font-InterBold">✕</Text>
              </TouchableOpacity>
            </View>

            {/* Year Selection */}
            <View className="mb-6">
              <Text className="text-lg font-InterBold mb-3 text-gray-900">
                Year
              </Text>
              <ScrollView className="max-h-32 bg-gray-50 rounded-2xl border border-gray-200">
                {Array.from(
                  { length: 10 },
                  (_, i) => new Date().getFullYear() - 5 + i,
                ).map((year) => (
                  <TouchableOpacity
                    key={year}
                    className={`p-4 border-b border-gray-200 ${selectedYear === year ? "bg-primary-100" : ""}`}
                    onPress={() => setSelectedYear(year)}
                  >
                    <Text
                      className={`text-center ${selectedYear === year ? "font-InterBold text-primary-600" : "font-InterMedium text-gray-700"}`}
                    >
                      {year}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Month Selection */}
            <View className="mb-6">
              <Text className="text-lg font-InterBold mb-3 text-gray-900">
                Month
              </Text>
              <ScrollView className="max-h-48 bg-gray-50 rounded-2xl border border-gray-200">
                {[
                  "January",
                  "February",
                  "March",
                  "April",
                  "May",
                  "June",
                  "July",
                  "August",
                  "September",
                  "October",
                  "November",
                  "December",
                ].map((month, index) => (
                  <TouchableOpacity
                    key={index}
                    className={`p-4 border-b border-gray-200 ${selectedMonth === index + 1 ? "bg-primary-100" : ""}`}
                    onPress={() => setSelectedMonth(index + 1)}
                  >
                    <Text
                      className={`text-center ${selectedMonth === index + 1 ? "font-InterBold text-primary-600" : "font-InterMedium text-gray-700"}`}
                    >
                      {month}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Value Input Section */}
            <View className="mb-6">
              <Text className="text-lg font-InterBold mb-3 text-gray-900">
                Asset Value
              </Text>
              <View className="flex-row items-center bg-gray-50 rounded-2xl border border-gray-200 px-4 py-4">
                <Text className="text-gray-600 mr-2 text-lg">$</Text>
                <TextInput
                  value={newAssetValue}
                  onChangeText={setNewAssetValue}
                  style={{
                    flex: 1,
                    fontSize: 18,
                    fontWeight: '600',
                    color: '#111827',
                  }}
                  keyboardType="numeric"
                  placeholder="0.00"
                  placeholderTextColor="#9CA3AF"
                />
              </View>
            </View>

            {/* Action Buttons */}
            <View className="flex-row gap-4">
              <TouchableOpacity
                className="flex-1 bg-gray-100 py-4 rounded-2xl"
                onPress={() => {
                  setShowDatePicker(false);
                  setNewAssetValue(""); // Reset value when canceling
                }}
              >
                <Text className="text-gray-700 text-center font-InterBold">
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-primary-500 py-4 rounded-2xl shadow-sm"
                onPress={handleDateSelection}
              >
                <Text className="text-white text-center font-InterBold">
                  Add Data Point
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

ItemDetail.displayName = "ItemDetail";

export default ItemDetail;
