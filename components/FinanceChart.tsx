import React, { useRef, useState } from "react";
import { View, Text, Dimensions, TouchableOpacity } from "react-native";
import { LineChart } from "react-native-gifted-charts";
import { AssetValueHistoryDataType } from "@/types/type";

const { width: screenWidth } = Dimensions.get("window");

interface FinanceChartProps {
  data: AssetValueHistoryDataType[];
  showXAxis?: boolean;
  showYAxis?: boolean;
  showCurrentStatusTitle?: boolean;
  height?: number;
  chartTitle?: string;
  showInteractiveFeatures?: boolean;
  innerHorizontalPadding?: number;
  positiveColor?: string;
  negativeColor?: string;
}

const FinanceChart: React.FC<FinanceChartProps> = ({
  data,
  showXAxis = true,
  showYAxis = true,
  showCurrentStatusTitle = false,
  height = 300,
  chartTitle = "",
  showInteractiveFeatures = true,
  positiveColor = "#10B981",
  negativeColor = "#EF4444",
  innerHorizontalPadding = 48,
}) => {
  const scrollRef = useRef<any>(null);
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
        <Text className="text-sm text-gray-500">No Data Available</Text>
      </View>
    );
  }

  // Validate data and filter out invalid entries, ensuring consistent structure
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
      month: typeof item.month === "number" ? item.month : index, // Ensure month property exists
      value: Number(item.value), // Ensure value is a proper number
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
  const priceChangePercent =
    firstPrice !== 0 ? ((priceChange / firstPrice) * 100).toFixed(2) : "0.00";
  const isPositive = priceChange >= 0;

  // Calculate min and max values for better scaling
  const values = validData.map((item) => item.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  const yAxisOffset = Math.max(0, minValue - range * 0.1);

  // Transform data to chart format with labels
  const enhancedData = validData.map((item) => ({
    value: Number(item.value),
    label: item.date,
  }));

  // Chart configuration - curved area chart with axis options
  const getChartConfig = () => {
    // Compute chart width from measured container width when available; fall back to screen width.
    const baseWidth = containerWidth ?? screenWidth;
    const chartWidth = Math.max(200, baseWidth - innerHorizontalPadding);
    const chartHeight = height - (showCurrentStatusTitle ? 120 : 60);

    const config = {
      data: enhancedData,
      height: chartHeight,
      width: chartWidth,
      
      // Curved area chart matching SmallFinanceChart style
      areaChart: true,
      curved: true,
      
      // Gradient styling
      color: isPositive ? positiveColor : negativeColor,
      thickness: 2,
      startFillColor: isPositive ? positiveColor : negativeColor,
      endFillColor: isPositive ? positiveColor : negativeColor,
      startOpacity: 0.6,
      endOpacity: 0.2,
      
      // Spacing
      spacing: Math.max(15, chartWidth / Math.max(validData.length + 1, 2)),
      initialSpacing: 0,
      endSpacing: 0,
      
      // Hide data points for clean look like SmallFinanceChart
      hideDataPoints: true,
      
      // Hide grid completely
      hideRules: true,
      
      // X-axis control
      hideXAxisText: !showXAxis,
      xAxisLabelTextStyle: showXAxis ? {
        color: "#6B7280",
        fontSize: 10,
      } : { fontSize: 1, color: 'transparent' },
      
      // Y-axis control with $ prefix
      hideYAxisText: !showYAxis,
      yAxisTextStyle: showYAxis ? { 
        color: "#6B7280", 
        fontSize: 10 
      } : { fontSize: 1, color: 'transparent' },
      yAxisLabelPrefix: showYAxis ? "$" : "",
      yAxisOffset: yAxisOffset,
      
      // Hide axes lines but keep the chart area
      hideAxesAndRules: !showXAxis && !showYAxis,
      
      // No animations for now (will add later)
      isAnimated: false,
      animateOnDataChange: false,
      
      // Keep interactive features disabled for now
      focusEnabled: false,
      showStripOnFocus: false,
      showTextOnFocus: false,
    };

    return config;
  };

  const handleScrollToStart = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ x: 0, animated: true });
    }
  };

  const handleScrollToEnd = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  };

  return (
    <View
      style={{ height: height, width: "100%" }}
      onLayout={(e) => {
        const w = e.nativeEvent.layout.width;
        if (w && w > 0) setContainerWidth(w);
      }}
    >
      {/* Header Section */}
      {(chartTitle !== "" || showCurrentStatusTitle) && (
        <View className="mb-2">
          {chartTitle !== "" && (
            <Text className="font-InterBold text-lg text-gray-800 mb-2">
              {chartTitle}
            </Text>
          )}
          {showCurrentStatusTitle && (
            <View className="flex-row items-center justify-between">
              <View>
                <Text className="font-InterBold text-2xl text-gray-900">
                  ${lastPrice.toFixed(2)}
                </Text>
                <Text
                  className={`font-InterMedium text-sm ${isPositive ? "text-green-600" : "text-red-600"}`}
                >
                  {isPositive ? "+" : ""}${priceChange.toFixed(2)} (
                  {priceChangePercent}%)
                </Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Chart Section */}
      {/* Center vertically but allow the chart to fill available width to avoid overflow */}
      <View style={{ flex: 1, alignItems: "stretch", justifyContent: "center" }}>
        {(() => {
          try {
            return (
              <LineChart
                scrollRef={scrollRef}
                {...getChartConfig()}
                onFocus={(item: any, index: number) => {
                  // TODO: Handle focus
                }}
              />
            );
          } catch (error) {
            return (
              <View style={{ height: height - 60, justifyContent: "center", alignItems: "center" }}>
                <Text className="text-sm text-red-500">Chart Error</Text>
                <Text className="text-xs text-gray-500 mt-1">{String(error)}</Text>
              </View>
            );
          }
        })()}
      </View>

      {/* Control Buttons - show for interactive charts with many data points */}
      {showInteractiveFeatures && validData.length > 5 && height > 200 && (
        <View className="flex-row justify-between mt-3">
          <TouchableOpacity
            onPress={handleScrollToStart}
            className="bg-gray-100 px-4 py-2 rounded-lg"
          >
            <Text className="text-xs font-InterMedium text-gray-700">
              Start
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleScrollToEnd}
            className="bg-gray-100 px-4 py-2 rounded-lg"
          >
            <Text className="text-xs font-InterMedium text-gray-700">
              Latest
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default FinanceChart;
