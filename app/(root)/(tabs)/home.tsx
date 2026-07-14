import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-expo";
import { router, useFocusEffect } from "expo-router";
import {
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import PortfolioChart from "@/components/PortfolioChart";
import { useFetch } from "@/lib/fetch";
import { ensureUserExists } from "@/lib/auth";
import { Asset } from "@/types/type";
import { AssetValueHistoryDataType } from "@/types/type";

type Range = "1W" | "1M" | "1Y" | "All";

const ranges: Range[] = ["1W", "1M", "1Y", "All"];

// Gather asset data for all unique dates across assets for general trend visualization
function getCompleteAssetHistory(assets: Asset[]): AssetValueHistoryDataType[] {
  const completeValueHistory: AssetValueHistoryDataType[] = [];

  const allDates = new Set<string>();

  for (const asset of assets) {
    for (const value of asset.value_history) {
      allDates.add(value.date);
    }
  }

  const sortedDates = Array.from(allDates).sort();

  let lastKnownValues: Record<string, number> = {};

  for (const date of sortedDates) {
    let totalValue = 0;
    let validAssetCount = 0;

    for (const asset of assets) {
      let assetValueForDate = null;

      for (let i = asset.value_history.length - 1; i >= 0; i--) {
        const value = asset.value_history[i];

        if (value.date === date) {
          assetValueForDate = value.value;
          break;
        }

        // Simple string comparison works with YYYY/MM/DD format
        if (value.date < date) {
          assetValueForDate = value.value;
          break;
        }
      }

      // If no value was found for this asset, we use the last known value for that asset
      if (
        assetValueForDate === null &&
        lastKnownValues[asset.asset_id] !== undefined
      ) {
        assetValueForDate = lastKnownValues[asset.asset_id];
      }

      // If we found a valid value for the asset on this date, aggregate it
      if (assetValueForDate !== null) {
        totalValue += assetValueForDate;
        validAssetCount++;
      }
    }

    // If there is no valid value for any asset, skip this date
    if (validAssetCount === 0) {
      continue;
    }

    // Create an entry for the date in the result
    const newEntry: AssetValueHistoryDataType = {
      date,
      value: totalValue,
      month: completeValueHistory.length,
    };

    completeValueHistory.push(newEntry);

    // Update the last known values for each asset
    for (const asset of assets) {
      let assetValueForDate = null;

      for (let i = asset.value_history.length - 1; i >= 0; i--) {
        const value = asset.value_history[i];

        // Simple string comparison works with YYYY/MM/DD format
        if (value.date <= date) {
          assetValueForDate = value.value;
          break;
        }
      }

      // Update last known values
      if (assetValueForDate !== null) {
        lastKnownValues[asset.asset_id] = assetValueForDate;
      }
    }
  }

  return completeValueHistory;
}

const Home = () => {
  const { user } = useUser();
  const [range, setRange] = useState<Range>("1Y");

  const {
    data: assetsResponse,
    loading,
    error,
    refetch,
  } = useFetch<any>(`/(api)/assets/${user?.id}`);

  // Extract the actual assets array
  const assets = assetsResponse?.[0]?.assets || [];
  const completeValueHistory = getCompleteAssetHistory(assets);
  const visibleHistory = useMemo(() => {
    if (range === "All") return completeValueHistory;

    const days = range === "1W" ? 7 : range === "1M" ? 31 : 366;
    const latest = completeValueHistory.at(-1);

    if (!latest) return [];

    const [year, month, day] = latest.date.split("/").map(Number);
    const cutOff = new Date(year, month - 1, day);
    cutOff.setDate(cutOff.getDate() - days);

    return completeValueHistory.filter((item) => {
      const [itemYear, itemMonth, itemDay] = item.date.split("/").map(Number);
      return new Date(itemYear, itemMonth - 1, itemDay) >= cutOff;
    });
  }, [completeValueHistory, range]);

  const latestValue = completeValueHistory.at(-1)?.value ?? 0;
  const firstVisibleValue = visibleHistory[0]?.value ?? latestValue;
  const change = latestValue - firstVisibleValue;
  const changePercent = firstVisibleValue
    ? (change / firstVisibleValue) * 100
    : 0;
  const isPositive = change >= 0;

  const openAsset = (asset: Asset) => {
    router.push({
      pathname: "/details/[id]" as any,
      params: {
        id: asset.asset_id,
        assets: JSON.stringify(assets),
        assetId: asset.asset_id,
      },
    });
  };

  // Ensure user exists in database when component mounts
  useEffect(() => {
    if (user?.id) {
      ensureUserExists(user.id, user.primaryEmailAddress?.emailAddress);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#4ca44d" />
        <Text className="mt-4 text-gray-600 font-medium">
          Loading your assets...
        </Text>
      </View>
    );
  }

  // Display error message if there's an error
  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50 px-6">
        <Text className="text-red-500 text-center font-medium text-lg">{`Error: ${error}`}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-secondary-100"
      edges={["top", "left", "right"]}
    >
      <FlatList
        data={assets}
        renderItem={({ item, index }) => {
          const assetFirstValue = item.value_history[0]?.value ?? 0;
          const assetLastValue = item.value_history.at(-1)?.value ?? 0;
          const assetReturn = assetFirstValue
            ? ((assetLastValue - assetFirstValue) / assetFirstValue) * 100
            : 0;
          const assetIsPositive = assetReturn >= 0;

          return (
            <TouchableOpacity
              onPress={() => openAsset(item)}
              activeOpacity={0.65}
              className={`flex-row items-center justify-between py-5 ${
                index < assets.length - 1 ? "border-b border-secondary-300" : ""
              }`}
            >
              <View className="mr-4 flex-1">
                <Text
                  className="text-base font-semibold text-secondary-900"
                  numberOfLines={1}
                >
                  {item.asset_name}
                </Text>
                <Text className="mt-1 text-sm text-secondary-600">
                  {assetReturn >= 0 ? "+" : ""}
                  {assetReturn.toFixed(1)}% return
                </Text>
              </View>
              <View className="flex-row items-center">
                <View className="items-end">
                  <Text className="text-base font-semibold text-secondary-900">
                    $
                    {assetLastValue.toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    className={`mt-1 text-sm font-medium ${
                      assetIsPositive ? "text-primary-600" : "text-danger-600"
                    }`}
                  >
                    {assetIsPositive ? "+" : ""}
                    {assetReturn.toFixed(1)}%
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="#858585"
                  style={{ marginLeft: 12 }}
                />
              </View>
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
        className="px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 28,
        }}
        ListEmptyComponent={() => {
          return (
            <View className="items-center justify-center py-12">
              {assets.length === 0 ? (
                <View className="items-center px-8">
                  <Text className="mb-3 text-center text-2xl font-bold text-secondary-900">
                    Add your first holding
                  </Text>
                  <Text className="text-center text-base leading-6 text-secondary-600">
                    Track balances and portfolio performance in one place.
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/add")}
                    className="mt-6 rounded-full bg-primary-500 px-5 py-3"
                  >
                    <Text className="font-semibold text-white">+ Add</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <ActivityIndicator size="small" color="#4ca44d" />
              )}
            </View>
          );
        }}
        ListHeaderComponent={
          <View className="pt-5">
            <Text className="text-[32px] font-bold tracking-[-0.8px] text-secondary-900">
              Portfolio
            </Text>

            {assets.length > 0 && (
              <>
                <View className="mt-8">
                  <Text className="text-[42px] font-bold leading-[48px] tracking-[-1.5px] text-secondary-900">
                    $
                    {latestValue.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    className={`mt-3 text-lg font-semibold ${
                      isPositive ? "text-primary-600" : "text-danger-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}$
                    {Math.abs(change).toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </Text>
                  <Text
                    className={`mt-1 text-base font-medium ${
                      isPositive ? "text-primary-600" : "text-danger-600"
                    }`}
                  >
                    {isPositive ? "+" : ""}
                    {changePercent.toFixed(1)}% this{" "}
                    {range === "All"
                      ? "period"
                      : range === "1Y"
                        ? "year"
                        : range === "1M"
                          ? "month"
                          : "week"}
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
                        key={item}
                        onPress={() => setRange(item)}
                        activeOpacity={1}
                        accessibilityRole="button"
                        accessibilityLabel={`Show ${item} portfolio history`}
                        accessibilityState={{ selected }}
                        className="min-h-11 flex-1 items-center justify-center"
                      >
                        <View
                          className={`h-11 w-16 items-center justify-center rounded-full ${
                            selected ? "bg-[#EAF5EA]" : "bg-transparent"
                          }`}
                        >
                          <Text
                            className={`text-base font-medium ${
                              selected
                                ? "text-primary-600"
                                : "text-secondary-700"
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
                  <Text className="text-2xl font-bold tracking-[-0.4px] text-secondary-900">
                    Holdings
                  </Text>
                  <TouchableOpacity
                    onPress={() => router.push("/add")}
                    accessibilityRole="button"
                    className="rounded-full px-1 py-1"
                  >
                    <Text className="text-base font-semibold text-primary-600">
                      + Add
                    </Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        }
      />
    </SafeAreaView>
  );
};

Home.displayName = "Home";

export default Home;
