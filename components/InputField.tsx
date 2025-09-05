import {
  TextInput,
  View,
  Text,
  Image,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";
import { useState } from "react";

import { InputFieldProps } from "@/types/type";

const InputField = ({
  label,
  icon,
  secureTextEntry = false,
  labelStyle,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [hasValue, setHasValue] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View className="my-3 w-full">
          <Text
            className={`text-sm font-InterSemiBold mb-3 text-gray-700 ${labelStyle}`}
          >
            {label}
          </Text>
          <View
            className={`
              flex-row items-center relative
              bg-white rounded-xl border 
              shadow-sm overflow-hidden
              ${
                isFocused
                  ? "border-primary-500 shadow-md shadow-primary-100"
                  : hasValue
                    ? "border-gray-300"
                    : "border-gray-200"
              }
              ${containerStyle}
            `}
          >
            {isFocused && (
              <View className="absolute left-0 top-0 bottom-0 w-1 bg-primary-500" />
            )}

            {icon && (
              <View className="ml-4 mr-3">
                <Image
                  source={icon}
                  className={`w-5 h-5 ${iconStyle}`}
                  style={{
                    tintColor: isFocused
                      ? "#4ca44d"
                      : hasValue
                        ? "#374151"
                        : "#9CA3AF",
                  }}
                />
              </View>
            )}
            <TextInput
              className={`
                flex-1 py-4 px-2 font-InterMedium text-base text-gray-900
                ${icon ? "" : "ml-4"}
                ${inputStyle}
              `}
              placeholderTextColor="#9CA3AF"
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

            {isFocused && (
              <View className="absolute right-0 top-0 bottom-0 w-0.5 bg-primary-500" />
            )}
          </View>

          {/* Optional helper text space */}
          <View className="h-1 mt-1" />
        </View>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
};

export default InputField;
