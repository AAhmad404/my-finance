import { Ionicons } from "@expo/vector-icons";
import { Link, Stack } from "expo-router";
import { Text, View } from "react-native";

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-1 items-center justify-center bg-secondary-100 px-8">
        <View className="h-14 w-14 items-center justify-center rounded-full bg-primary-100/50">
          <Ionicons name="compass-outline" size={27} color="#449445" />
        </View>
        <Text className="mt-6 text-center text-2xl font-bold tracking-[-0.4px] text-secondary-900">
          Page not found
        </Text>
        <Text className="mt-3 text-center text-base leading-6 text-secondary-600">
          This page is unavailable.
        </Text>
        <Link href="/" className="mt-7 rounded-full bg-primary-600 px-6 py-4">
          <Text className="font-semibold text-white">Return home</Text>
        </Link>
      </View>
    </>
  );
}
