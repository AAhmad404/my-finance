import { useSignUp } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Image, ScrollView, Text, View, Modal, Pressable } from "react-native";

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAuth from "@/components/OAuth";
import { icons, images } from "@/constants";
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
    <SafeAreaView className="flex-1 bg-white">
      <ScrollView className="flex-1">
        <View className="flex-1 bg-white">
          <View className="relative w-full h-[250px]">
            <Image
              source={images.banner}
              className="z-0 w-full h-[250px] ml-[-5px]"
            />
            <Text className="text-2xl text-black font-InterBold absolute top-7 left-5">
              Get Started!
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
              title="Sign Up"
              onPress={onSignUpPress}
              className="mt-6 bg-primary-400"
            />
            <OAuth title="Sign Up with Google" />
            <Pressable
              onPress={() => router.push("/sign-in")}
              className="mt-10"
            >
              <Text className="text-lg text-center text-general-200">
                Already have an account?{" "}
                <Text className="text-primary-500">Log In</Text>
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
            <View className="flex-1 justify-center items-center bg-black/50">
              <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px] w-[90%] max-w-sm">
                <Text className="font-InterExtraBold text-2xl mb-2">
                  Verification
                </Text>
                <Text className="font-Inter mb-5">
                  We've sent a verification code to {form.email}.
                </Text>
                <InputField
                  label={"Code"}
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
                  className="mt-5 bg-success-500"
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
