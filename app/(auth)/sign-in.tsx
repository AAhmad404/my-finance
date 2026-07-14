import { useSignIn, useUser, useAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { Alert, ScrollView, Text, View, Pressable } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons } from "@/constants";
import { fetchAPI } from "@/lib/fetch";

const SignIn = () => {
  const { signIn, setActive, isLoaded } = useSignIn();
  const { isSignedIn, isLoaded: authLoaded } = useAuth();
  const { user } = useUser();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const onSignInPress = async () => {
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
        } catch {}

        router.replace("/(root)/(tabs)/home");
      } else {
        Alert.alert("Error", "Log in failed. Please try again.");
      }
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  // If Clerk already reports the user is signed in, redirect to home
  useEffect(() => {
    if (authLoaded && isSignedIn) {
      router.replace("/(root)/(tabs)/home");
    }
  }, [authLoaded, isSignedIn]);

  return (
    <SafeAreaView className="flex-1 bg-secondary-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pb-8 pt-12">
          <View className="mb-12">
            <Text className="text-[38px] font-bold tracking-[-1px] text-secondary-900">
              Welcome back
            </Text>
            <Text className="mt-3 text-base leading-6 text-secondary-600">
              Sign in to view and manage your portfolio.
            </Text>
          </View>

          <View className="border-t border-secondary-300 pt-8">
            <InputField
              label="Email"
              placeholder="name@example.com"
              icon={icons.email}
              textContentType="emailAddress"
              value={form.email}
              onChangeText={(value) => setForm({ ...form, email: value })}
            />

            <InputField
              label="Password"
              placeholder="Password"
              icon={icons.lock}
              secureTextEntry={true}
              textContentType="password"
              value={form.password}
              onChangeText={(value) => setForm({ ...form, password: value })}
            />

            <CustomButton
              title="Sign In"
              onPress={onSignInPress}
              className="mt-2"
            />

            <OAuth title="Log In with Google" />

            <Pressable onPress={() => router.push("/sign-up")} className="mt-9">
              <Text className="text-center text-base text-secondary-600">
                Don't have an account?{" "}
                <Text className="font-semibold text-primary-600">Sign up</Text>
              </Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignIn;
