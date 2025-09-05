import { Stack } from "expo-router";
import { useEffect } from "react";
import { BackHandler } from "react-native";

const Layout = () => {
  useEffect(() => {
    const backAction = () => {
      // Exit the app when back is pressed in the root section
      BackHandler.exitApp();
      return true;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);

    return () => backHandler.remove();
  }, []);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;
