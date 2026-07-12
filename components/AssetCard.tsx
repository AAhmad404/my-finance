import { Text, View } from "react-native";
import { Asset } from "@/types/type";
import SmallFinanceChart from "@/components/SmallFinanceChart";

const AssetCard = ({ asset }: { asset: Asset }) => {
  const firstValue = asset.value_history[0].value;
  const lastValue = asset.value_history[asset.value_history.length - 1];

  let changePercent = "0.0";
  if (firstValue !== 0) {
    const rawChange = ((lastValue.value - firstValue) / firstValue) * 100;
    changePercent = rawChange.toFixed(1);
  }
  const isPositive = parseFloat(changePercent) >= 0;

  return (
    <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-4 mx-1">
      {/* Header */}
      <View className="flex-row justify-between items-start mb-3">
        <View className="flex-1 mr-4">
          <Text
            className="text-lg font-bold text-gray-900 mb-1"
            numberOfLines={1}
          >
            {asset.asset_name}
          </Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-extrabold text-gray-900 mr-2">
              ${lastValue.value.toLocaleString()}
            </Text>
            <View
              className={`px-2 py-1 rounded-full ${isPositive ? "bg-green-100" : "bg-red-100"}`}
            >
              <Text
                className={`text-xs font-semibold ${isPositive ? "text-green-700" : "text-red-700"}`}
              >
                {isPositive ? "+" : "-"}
                {Math.abs(parseFloat(changePercent))}%
              </Text>
            </View>
          </View>
        </View>

        {/* Mini Chart */}
        <View className="w-24 h-16 bg-gray-50 rounded-xl p-2">
          <SmallFinanceChart
            data={asset.value_history}
            height={48}
          />
        </View>
      </View>

      {/* Footer Info */}
      <View className="flex-row justify-between items-center pt-3 border-t border-gray-100">
        <View></View>
        <View>
          <Text className="text-xs font-medium text-gray-500">
            Last Updated
          </Text>
          <Text className="text-sm font-semibold text-gray-700">
            {lastValue.date}
          </Text>
        </View>
      </View>
    </View>
  );
};

export default AssetCard;
