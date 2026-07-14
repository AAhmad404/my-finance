import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

interface OAuthProp {
  title: string;
}

const OAuth: React.FC<OAuthProp> = ({ title }) => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists" || result.success) {
      router.replace("/(root)/(tabs)/home");
      return;
    }

    // Only show alert for actual errors
    if (!result.success) {
      Alert.alert("Error", result.message);
    }
  };

  return (
    <View>
      <View className="mt-7 flex-row items-center gap-x-3">
        <View className="h-px flex-1 bg-secondary-300" />
        <Text className="text-sm text-secondary-600">or</Text>
        <View className="h-px flex-1 bg-secondary-300" />
      </View>

      <CustomButton
        title={title}
        className="mt-7 w-full"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;
