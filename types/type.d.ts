import { TextInputProps, TouchableOpacityProps } from "react-native";
import React from "react";
declare interface Asset {
  asset_id: number;
  asset_name: string;
  value_history: AssetValueHistoryDataType[];
  starting_month: number;
  starting_year: number;
  last_updated: string;
  created_at: string;
}

declare interface ButtonProps extends TouchableOpacityProps {
  title: string;
  bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
  textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
  IconLeft?: React.ComponentType<any>;
  IconRight?: React.ComponentType<any>;
  className?: string;
}

declare interface InputFieldProps extends TextInputProps {
  label: string;
  icon?: any;
  secureTextEntry?: boolean;
  labelStyle?: string;
  containerStyle?: string;
  inputStyle?: string;
  iconStyle?: string;
  className?: string;
}
type AssetValueHistoryDataType = {
  month: number;
  date: string;
  value: number;
};

export interface FinanceChartProps {
  data: AssetValueHistoryDataType[];
  hideAxis?: boolean;
  showCurrentStatusTitle?: boolean;
  showAnimation?: boolean;
  height?: number;
  chartTitle?: string;
  chartType?: 'line' | 'area' | 'curved' | 'gradient';
  showInteractiveFeatures?: boolean;
  positiveColor?: string;
  negativeColor?: string;
}
