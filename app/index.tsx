import { Redirect, router } from "expo-router";
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

  // Show a simple loading screen while Clerk determines auth status to avoid a blank screen
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#4ca44d" />
      <Text className="mt-4 text-gray-600">Checking authentication...</Text>
    </View>
  );
};

export default Home;
