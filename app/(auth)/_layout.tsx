import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false,
        gestureEnabled: false,
        presentation: "card",
        animationTypeForReplace: "push",
      }}
    >
      <Stack.Screen 
        name="sign-in" 
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
      <Stack.Screen 
        name="sign-up" 
        options={{
          headerShown: false,
          gestureEnabled: false,
        }}
      />
    </Stack>
  );
};

export default Layout;
