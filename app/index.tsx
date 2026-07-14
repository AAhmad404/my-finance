import { router } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useEffect } from "react";
import { View, ActivityIndicator, Text } from "react-native";

const Home = () => {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      router.replace("/(root)/(tabs)/home");
    } else if (isLoaded && !isSignedIn) {
      router.replace("/(auth)/sign-in");
    }
  }, [isLoaded, isSignedIn]);

  return (
    <View className="flex-1 items-center justify-center bg-secondary-100">
      <ActivityIndicator size="large" color="#4ca44d" />
      <Text className="mt-4 text-sm font-medium text-secondary-600">
        Loading MyFinance
      </Text>
    </View>
  );
};

export default Home;
