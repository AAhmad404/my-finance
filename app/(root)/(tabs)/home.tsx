import React, { useCallback, useEffect } from "react";
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
import AssetCard from "@/components/AssetCard";
import FinanceChart from "@/components/FinanceChart";
import { useFetch } from "@/lib/fetch";
import { ensureUserExists } from "@/lib/auth";
import { Asset } from "@/types/type";
import { AssetValueHistoryDataType } from "@/types/type";

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

  const {
    data: assetsResponse,
    loading,
    error,
    refetch,
  } = useFetch<any>(`/(api)/assets/${user?.id}`);

  // Extract the actual assets array
  const assets = assetsResponse?.[0]?.assets || [];
  const completeValueHistory = getCompleteAssetHistory(assets);

  // Ensure user exists in database when component mounts
  useEffect(() => {
    if (user?.id) {
      ensureUserExists(
        user.id,
        user.primaryEmailAddress?.emailAddress
      );
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
    <SafeAreaView className="bg-gray-50 flex-1">
      <FlatList
        data={assets}
        renderItem={({ item }) => {
          return (
            <TouchableOpacity
              onPress={() => {
                router.push({
                  pathname: "/details/[id]" as any,
                  params: {
                    id: item.asset_id,
                    assets: JSON.stringify(assets),
                    assetId: item.asset_id,
                  },
                });
              }}
              className="transform active:scale-98"
            >
              <AssetCard asset={item} />
            </TouchableOpacity>
          );
        }}
        keyExtractor={(item, index) => {
          return index.toString();
        }}
        className="px-4"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
        }}
        ListEmptyComponent={() => {
          return (
            <View className="flex-1 items-center justify-center py-10">
              {assets.length === 0 ? (
                <View className="items-center px-8">
                  <Text className="text-2xl font-bold text-gray-900 mb-3 text-center">
                    Start Building Your Portfolio
                  </Text>
                  <Text className="text-gray-600 font-medium text-center text-base leading-6">
                    Add your first asset to begin tracking your financial
                    journey.
                  </Text>
                </View>
              ) : (
                <ActivityIndicator size="small" color="#4ca44d" />
              )}
            </View>
          );
        }}
        ListHeaderComponent={
          <>
            {/* Header Section */}
            <View className="flex-row items-center justify-between mb-6 mt-6 px-1">
              <View>
                <Text className="text-3xl font-extrabold text-gray-900">
                  Portfolio
                </Text>
              </View>
            </View>

            {/* Chart Section - only show if user has assets */}
            {!(!completeValueHistory || completeValueHistory.length === 0) ? (
              <View className="bg-white rounded-3xl p-6 mx-1 mb-6 shadow-sm border border-gray-100">
                <FinanceChart
                  data={completeValueHistory}
                  showCurrentStatusTitle={true}
                  height={320}
                  showInteractiveFeatures={true}
                  chartTitle="Portfolio Overview"
                />
              </View>
            ) : null}

            {/* Assets Section Header */}
            {assets.length > 0 && (
              <View className="flex-row items-center justify-between mb-4 px-1">
                <Text className="text-xl font-bold text-gray-900">
                  Your Assets
                </Text>
              </View>
            )}
          </>
        }
      />
    </SafeAreaView>
  );
};

Home.displayName = "Home";

export default Home;
