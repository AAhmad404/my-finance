import React, { useState } from "react";
import { View, Text, Dimensions } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { AssetValueHistoryDataType } from "@/types/type";

interface SmallFinanceChartProps {
  data: AssetValueHistoryDataType[];
  height?: number;
  positiveColor?: string;
  negativeColor?: string;
  innerHorizontalPadding?: number;
}

const SmallFinanceChart: React.FC<SmallFinanceChartProps> = ({
  data,
  height = 80,
  positiveColor = "#10B981",
  negativeColor = "#EF4444",
}) => {
  const [containerWidth, setContainerWidth] = useState<number | null>(null);

  // Ensure data is defined and validate values
  if (!data || data.length === 0) {
    return (
      <View
        style={{
          height: height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text className="text-sm text-gray-500">No Data</Text>
      </View>
    );
  }

  // Validate data and filter out invalid entries
  const validData = data
    .filter(
      (item) =>
        item &&
        typeof item.value === "number" &&
        !isNaN(item.value) &&
        isFinite(item.value) &&
        item.date &&
        typeof item.date === "string",
    )
    .map((item, index) => ({
      ...item,
      month: typeof item.month === "number" ? item.month : index,
      value: Number(item.value),
    }));

  if (validData.length === 0) {
    return (
      <View
        style={{
          height: height,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text className="text-sm text-gray-500">Invalid Data</Text>
      </View>
    );
  }

  const lastPrice = validData[validData.length - 1]?.value || 0;
  const firstPrice = validData[0]?.value || 0;
  const priceChange = lastPrice - firstPrice;
  const isPositive = priceChange >= 0;

  // Transform data to simple chart format
  const chartData = validData.map((item) => ({
    value: Number(item.value),
    // Remove label to see if that's causing issues
  }));

  // Small chart configuration - fit exactly in 80x48px space
  const getChartConfig = () => {
    // Container is 96x64px with 8px padding = 80x48px usable space
    const chartWidth = containerWidth ? containerWidth : 80;
    const chartHeight = height; // Use exact height passed in

    const config = {
      data: chartData,
      height: chartHeight,
      width: chartWidth,
      
      // Simplified area chart
      areaChart: true,
      
      // Basic styling
      color: isPositive ? positiveColor : negativeColor,
      thickness: 2,
      startFillColor: isPositive ? positiveColor : negativeColor,
      endFillColor: isPositive ? positiveColor : negativeColor,
      startOpacity: 0.6,
      endOpacity: 0.2,
      
      // Tight spacing to fit in small container
      spacing: Math.max(6, (chartWidth - 12) / Math.max(chartData.length - 1, 1)),
      initialSpacing: 2,
      endSpacing: 2,
      
      // Hide unnecessary elements
      hideDataPoints: true,
      hideRules: true,
      hideYAxisText: true,
      hideAxesAndRules: true,
      hideXAxisText: true,
      
      // No animations
      isAnimated: false,
      
      // Minimal text (but visible for debugging)
      textFontSize: 1,
    };

    return config;
  };

  return (
    <View
      style={{ height: height, width: "100%" }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w > 0) setContainerWidth(w);
      }}
    >
      <View style={{ flex: 1, alignItems: "stretch", justifyContent: "center" }}>
        {(() => {
          try {
            return <LineChart {...getChartConfig()} />;
          } catch (error) {
            return (
              <View style={{ height: height - 10, justifyContent: "center", alignItems: "center" }}>
                <Text className="text-xs text-red-500">Chart Error</Text>
              </View>
            );
          }
        })()}
      </View>
    </View>
  );
};

export default SmallFinanceChart;
