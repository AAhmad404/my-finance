import { useUser } from "@clerk/clerk-expo";
import { fetchAPI, useFetch } from "@/lib/fetch";
import React, { useState } from "react";
import { ScrollView, Text, View, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router, useFocusEffect } from "expo-router";
import { icons } from "@/constants";
import InputField from "@/components/InputField";
import CustomButton from "@/components/CustomButton";
import { formatDate } from "@/lib/dateUtils";

const AddAsset = () => {
  const { user } = useUser();

  const {
    data: assetsResponse,
    loading,
    error,
    refetch,
  } = useFetch<any>(`/(api)/assets/${user?.id}`);

  // Extract the actual assets array
  const assets = assetsResponse?.[0]?.assets || [];

  useFocusEffect(
    React.useCallback(() => {
      refetch();
    }, [refetch]),
  );

  const [assetName, setAssetName] = useState("");
  const [assetValue, setAssetValue] = useState("");

  const handleAddAsset = async () => {
    if (!assetName || !assetValue) {
      alert("Please fill in all fields");
      return;
    }

    const lastAsset = assets.length > 0 ? assets[assets.length - 1] : null;
    const newAssetId = lastAsset ? lastAsset.asset_id + 1 : 0;

    const currentDate = new Date();
    const newAsset = {
      asset_id: newAssetId,
      asset_name: assetName,
      created_at: currentDate.toISOString(),
      last_updated: currentDate.toISOString(),
      starting_month: currentDate.getMonth(),
      starting_year: currentDate.getFullYear(),
      value_history: [
        {
          date: formatDate(
            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1),
          ),
          month: 0,
          value: parseFloat(assetValue),
        },
      ],
    };

    const updatedAssets = [...assets, newAsset];

    try {
      if (user) {
        await fetchAPI("/(api)/user", {
          method: "PUT",
          body: JSON.stringify({
            clerkId: user.id,
            assets: updatedAssets,
          }),
        });
        router.back();
      } else {
        console.error("User not found or user ID is missing");
      }
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Display loading spinner while fetching data
  if (loading) {
    return (
      <View className="flex-1 items-center justify-center">
        <ActivityIndicator size="large" color="#858585" />
      </View>
    );
  }

  return (
    <SafeAreaView
      edges={["top", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ flexGrow: 1, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View className="mt-6 mb-8">
          <Text className="text-3xl font-extrabold text-gray-900 mb-2">
            Add New Asset
          </Text>
        </View>

        {/* Form Section */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
          <View className="space-y-6">
            <InputField
              label="Asset Name"
              placeholder="e.g., Savings Account"
              icon={icons.edit}
              value={assetName}
              onChangeText={setAssetName}
            />
            <InputField
              label="Current Value"
              placeholder="0.00"
              icon={icons.dollar}
              value={assetValue}
              onChangeText={setAssetValue}
              keyboardType="numeric"
            />
          </View>
        </View>

        {/* Button Section */}
        <View className="mt-auto">
          <CustomButton
            title="Add Asset"
            onPress={handleAddAsset}
            disabled={!assetName || !assetValue}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default AddAsset;
