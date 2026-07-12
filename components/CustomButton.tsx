import { TouchableOpacity, Text, View } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-gray-600";
    case "danger":
      return "bg-red-500";
    case "success":
      return "bg-green-500";
    case "outline":
      return "bg-transparent border-2 border-gray-200";
    default:
      return "bg-primary-500";
  }
};

const getTextVariantStyle = (variant: ButtonProps["textVariant"]) => {
  switch (variant) {
    case "primary":
      return "text-primary-600";
    case "secondary":
      return "text-white";
    case "danger":
      return "text-white";
    case "success":
      return "text-white";
    default:
      return "text-white";
  }
};

const getHoverStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "active:bg-gray-700";
    case "danger":
      return "active:bg-red-600";
    case "success":
      return "active:bg-green-600";
    case "outline":
      // subtle neutral hover for outline buttons
      return "active:bg-gray-100";
    default:
      return "active:bg-primary-600";
  }
};

const CustomButton = ({
  onPress,
  title,
  bgVariant = "primary",
  textVariant = "default",
  IconLeft,
  IconRight,
  className,
  disabled = false,
  ...props
}: ButtonProps) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        w-full rounded-2xl px-6 py-4 
        flex-row justify-center items-center 
        shadow-lg shadow-black/10
        ${getBgVariantStyle(bgVariant)} 
        ${getHoverStyle(bgVariant)}
        ${disabled ? "opacity-50" : "opacity-100"}
        ${className}
      `}
      style={{
        elevation: 4, // Android shadow
      }}
      {...props}
    >
      {IconLeft && (
        <View className="mr-2">
          <IconLeft />
        </View>
      )}

      <Text
        className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}
      >
        {title}
      </Text>

      {IconRight && (
        <View className="ml-3">
          <IconRight />
        </View>
      )}
    </TouchableOpacity>
  );
};

export default CustomButton;
