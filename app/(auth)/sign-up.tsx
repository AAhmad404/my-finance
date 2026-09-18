import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  ScrollView,
  Text,
  View,
  Modal,
  Pressable,
  TouchableOpacity,
} from "react-native";

import CustomButton from "@/components/CustomButton";
import AuthHeader from "@/components/AuthHeader";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons } from "@/constants";
import { Ionicons } from "@expo/vector-icons";
import { fetchAPI } from "@/lib/fetch";
import { SafeAreaView } from "react-native-safe-area-context";

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });
  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: "",
  });

  const onSignUpPress = async () => {
    if (!isLoaded) return;
    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerification({
        ...verification,
        state: "pending",
      });
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verification.code,
      });
      if (completeSignUp.status === "complete") {
        await fetchAPI("/(api)/user", {
          method: "POST",
          body: JSON.stringify({
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });
        await setActive({ session: completeSignUp.createdSessionId });
        setVerification({
          ...verification,
          state: "success",
        });
        // Navigate directly to home without showing success modal
        router.replace("/(root)/(tabs)/home");
      } else {
        setVerification({
          ...verification,
          error: "Verification failed. Please try again.",
          state: "failed",
        });
      }
    } catch (err: any) {
      setVerification({
        ...verification,
        error: err.errors[0].longMessage,
        state: "failed",
      });
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-100">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="flex-1 px-6 pb-8 pt-4">
          <AuthHeader
            title="Create account"
            subtitle="Manage your finances in one place."
          />
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
              title="Sign Up"
              onPress={onSignUpPress}
              className="mt-2"
            />
            <OAuth title="Sign Up with Google" />
            <Pressable onPress={() => router.push("/sign-in")} className="mt-9">
              <Text className="text-center text-base text-secondary-600">
                Already have an account?{" "}
                <Text className="font-semibold text-primary-600">Sign in</Text>
              </Text>
            </Pressable>
          </View>
          <Modal
            visible={verification.state === "pending"}
            transparent={true}
            animationType="fade"
            onRequestClose={() =>
              setVerification({ ...verification, state: "default" })
            }
          >
            <View className="flex-1 justify-end bg-black/40">
              <View className="rounded-t-[28px] bg-secondary-100 px-6 pb-10 pt-6">
                <View className="mb-7 flex-row items-start justify-between">
                  <View className="flex-1 pr-6">
                    <Text className="text-2xl font-bold tracking-[-0.4px] text-secondary-900">
                      Verify email
                    </Text>
                    <Text className="mt-2 text-base leading-6 text-secondary-600">
                      Enter the code sent to {form.email}.
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      setVerification({ ...verification, state: "default" })
                    }
                    className="h-10 w-10 items-center justify-center rounded-full border border-secondary-300"
                  >
                    <Ionicons name="close" size={22} color="#666666" />
                  </TouchableOpacity>
                </View>
                <InputField
                  label="Verification code"
                  icon={icons.lock}
                  placeholder={"12345"}
                  value={verification.code}
                  keyboardType="numeric"
                  onChangeText={(code) =>
                    setVerification({ ...verification, code })
                  }
                />
                {verification.error ? (
                  <Text className="text-red-500 text-sm mt-1">
                    {verification.error}
                  </Text>
                ) : null}
                <CustomButton
                  title="Verify Email"
                  onPress={onPressVerify}
                  className="mt-2"
                />
              </View>
            </View>
          </Modal>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
