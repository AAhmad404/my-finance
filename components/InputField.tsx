import {
  TextInput,
  View,
  Text,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useState } from "react";
import { Ionicons } from "@expo/vector-icons";

import { InputFieldProps } from "@/types/type";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  className,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);
  const normalizedLabel = label.toLowerCase();
  const iconName: React.ComponentProps<typeof Ionicons>["name"] =
    normalizedLabel.includes("asset")
      ? "pencil-outline"
      : normalizedLabel.includes("verification")
        ? "key-outline"
        : secureTextEntry
          ? "lock-closed-outline"
          : props.keyboardType === "numeric"
            ? "cash-outline"
            : "mail-outline";

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className={`mb-6 w-full ${className}`}>
          <Text
            className={`mb-2 text-sm font-medium text-secondary-700 ${labelStyle}`}
          >
            {label}
          </Text>
          <View
            className={`
              min-h-14 flex-row items-center rounded-xl border bg-white px-4
              ${
                isFocused
                  ? "border-primary-600"
                  : hasValue
                    ? "border-secondary-400"
                    : "border-secondary-300"
              }
              ${containerStyle}
            `}
          >
            {icon && (
              <View className="mr-3">
                <Ionicons
                  name={iconName}
                  size={20}
                  color={isFocused ? "#449445" : "#858585"}
                />
              </View>
            )}
            <TextInput
              className={`
                flex-1 py-4 text-base font-medium text-secondary-900
                ${inputStyle}
              `}
              placeholderTextColor="#999999"
              secureTextEntry={secureTextEntry}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onChangeText={(text) => {
                setHasValue(text.length > 0);
                if (props.onChangeText) {
                  props.onChangeText(text);
                }
              }}
              {...props}
            />
          </View>
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
