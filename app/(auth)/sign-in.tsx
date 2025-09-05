import { useSignIn, useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useCallback, useState, useEffect } from "react";
import { Alert, Image, ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = useCallback(async () => {
    if (!isLoaded) return;

    try {
      const signInAttempt = await signIn.create({
        identifier: form.email,
        password: form.password,
      });

      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        // Ensure a local DB row exists for this Clerk user (use user.id from Clerk)
        try {
          if (user?.id) {
            await fetchAPI("/(api)/user", {
              method: "POST",
              body: JSON.stringify({
                clerkId: user.id,
                email: form.email || undefined,
              }),
            });
          }
        } catch (err) {
        }

        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }, [isLoaded, signIn, form.email, form.password, setActive]);

  // If Clerk already reports the user is signed in, redirect to home
  useEffect(() => {
    if (authLoaded && isSignedIn) { 
      router.replace("/(root)/(tabs)/home");
    }
  }, [authLoaded, isSignedIn]);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1">
          <View className="relative w-full h-[250px]">
            <Image
              source={images.banner}
              className="z-0 w-full h-[250px] ml-[-5px]"
            />
            <Text className="text-2xl text-black font-InterBold absolute top-7 left-5">
              Welcome Back!
            </Text>
          </View>

          <View className="p-5">
            <InputField
              label="Email"
              placeholder="Enter email"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
            />

            <InputField
              label="Password"
              placeholder="Enter password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
            />

            <CustomButton
              title="Sign In"
              onPress={onSignInPress}
              className="mt-6 bg-primary-400"
            />

            <OAuth title="Log In with Google" />

            <Pressable 
              onPress={() => router.push("/sign-up")}
              className="mt-10"
            >
              <Text className="text-lg text-center text-general-200">
                Don't have an account?{" "}
                <Text className="text-primary-500">Sign Up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
