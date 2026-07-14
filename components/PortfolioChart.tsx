import React, { useMemo } from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";
import { AssetValueHistoryDataType } from "@/types/type";

type PortfolioChartProps = {
  data: AssetValueHistoryDataType[];
};

const chartWidth = 342;
const chartHeight = 224;
const left = 36;
const right = 8;
const top = 12;
const bottom = 30;
const plotWidth = chartWidth - left - right;
const plotHeight = chartHeight - top - bottom;

const compactCurrency = (value: number) => {
  if (Math.abs(value) < 1000) {
    return `$${Math.round(value).toLocaleString("en-CA")}`;
  }

  return `$${Math.round(value / 1000)}K`;
};

const formatDate = (date: string) => {
  const [year, month] = date.split("/");
  const value = new Date(Number(year), Number(month) - 1, 1);
  return value.toLocaleDateString("en-CA", { month: "short", year: "2-digit" });
};

export default function PortfolioChart({ data }: PortfolioChartProps) {
  const chart = useMemo(() => {
    const values = data.map((item) => item.value);
    const minimum = Math.min(...values);
    const maximum = Math.max(...values);
    const padding = Math.max((maximum - minimum) * 0.16, maximum * 0.025);
    const lower = Math.max(0, minimum - padding);
    const upper = maximum + padding;
    const range = Math.max(upper - lower, 1);
    const points = data.map((item, index) => {
      const x = left + (index / Math.max(data.length - 1, 1)) * plotWidth;
      const y = top + (1 - (item.value - lower) / range) * plotHeight;
      return { x, y };
    });
    const line = points
      .map(
        (point, index) =>
          `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`,
      )
      .join(" ");
    const area = `${line} L${points.at(-1)?.x.toFixed(1)} ${(top + plotHeight).toFixed(1)} L${points[0]?.x.toFixed(1)} ${(top + plotHeight).toFixed(1)} Z`;
    const labels = [0, 1, 2, 3].map(
      (index) => lower + (range * (3 - index)) / 3,
    );
    const xIndices = Array.from(
      new Set([0, Math.floor((data.length - 1) / 2), data.length - 1]),
    );
    return { area, labels, line, points, xIndices };
  }, [data]);

  if (data.length === 0) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>No history yet</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Svg
        width="100%"
        height={chartHeight}
        viewBox={`0 0 ${chartWidth} ${chartHeight}`}
      >
        {chart.labels.map((label, index) => {
          const y = top + (index / 3) * plotHeight;
          return (
            <React.Fragment key={label}>
              <Line
                x1={left}
                y1={y}
                x2={chartWidth - right}
                y2={y}
                stroke="#E6E6E6"
                strokeDasharray="3 4"
              />
              <SvgText x={0} y={y + 3} fill="#858585" fontSize="10">
                {compactCurrency(label)}
              </SvgText>
            </React.Fragment>
          );
        })}
        <Path d={chart.area} fill="#E6F3DF" />
        <Path
          d={chart.line}
          fill="none"
          stroke="#4ca44d"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />
        {chart.xIndices.map((index) => {
          const point = chart.points[index];
          if (!point) return null;
          return (
            <SvgText
              key={index}
              x={point.x}
              y={chartHeight - 7}
              fill="#858585"
              fontSize="10"
              textAnchor={
                index === 0
                  ? "start"
                  : index === data.length - 1
                    ? "end"
                    : "middle"
              }
            >
              {formatDate(data[index].date)}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: chartHeight, overflow: "hidden", width: "100%" },
  emptyState: {
    alignItems: "center",
    height: chartHeight,
    justifyContent: "center",
  },
  emptyText: { color: "#999999", fontSize: 14 },
});
