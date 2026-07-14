import { TouchableOpacity, Text, View } from "react-native";

import { ButtonProps } from "@/types/type";

const getBgVariantStyle = (variant: ButtonProps["bgVariant"]) => {
  switch (variant) {
    case "secondary":
      return "bg-secondary-800";
    case "danger":
      return "bg-danger-600";
    case "success":
      return "bg-primary-600";
    case "outline":
      return "bg-transparent border border-secondary-300";
    default:
      return "bg-primary-600";
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
        min-h-14 w-full rounded-full px-6 py-4
        flex-row justify-center items-center 
        ${getBgVariantStyle(bgVariant)} 
        ${disabled ? "opacity-50" : "opacity-100"}
        ${className}
      `}
      activeOpacity={0.7}
      {...props}
    >
      {IconLeft && (
        <View className="mr-2">
          <IconLeft />
        </View>
      )}

      <Text
        className={`text-base font-semibold ${getTextVariantStyle(textVariant)}`}
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
