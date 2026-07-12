import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { fetchAPI } from "@/lib/fetch";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { icons } from "@/constants";

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const performSignOut = async () => {
    if (isSigningOut) return;
    try {
      setIsSigningOut(true);
      await signOut();
      // Navigate to sign-in after signOut completes
      router.replace("/(auth)/sign-in");
    } catch (err) {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOut = () => {
    if (isSigningOut) return;
    Alert.alert("Confirm Logout", "Are you sure you want to log out?", [
      {
        text: "Cancel",
        style: "cancel",
      },
      {
        text: "Log Out",
        style: "destructive",
        onPress: () => {
          // Kick off sign out and navigation
          void performSignOut();
        },
      },
    ]);
  };

  const ProfileMenuItem = ({
    icon,
    title,
    subtitle,
    onPress,
    showArrow = true,
    textColor = "text-gray-900",
    bgColor = "bg-white",
  }: {
    icon?: any;
    title: string;
    subtitle?: string;
    onPress: () => void;
    showArrow?: boolean;
    textColor?: string;
    bgColor?: string;
  }) => (
    <TouchableOpacity
      onPress={onPress}
      className={`${bgColor} rounded-2xl border border-gray-100 shadow-sm mb-3 p-4 active:scale-98`}
    >
      <View className="flex-row items-center">
        {icon && (
          <View className="w-12 h-12 bg-gray-100 rounded-xl items-center justify-center mr-4">
            <Image
              source={icon}
              className="w-6 h-6"
              style={{ tintColor: "#4ca44d" }}
              resizeMode="contain"
            />
          </View>
        )}
        <View className={`flex-1 ${!icon ? "ml-4" : ""}`}>
          <Text className={`text-base font-semibold ${textColor}`}>
            {title}
          </Text>
          {subtitle && (
            <Text className="text-sm font-medium text-gray-500 mt-1">
              {subtitle}
            </Text>
          )}
        </View>
        {showArrow && (
          <Text className="text-gray-400 text-lg font-bold">›</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-extrabold text-gray-900">
            Profile
          </Text>
        </View>

        {/* User Info Card */}
        <View className="mx-6 mb-6">
          <View className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
            {/* Profile Picture and Basic Info */}
            <View className="flex-row items-center mb-6">
              <View className="w-20 h-20 bg-primary-100 rounded-full items-center justify-center mr-4">
                {user?.imageUrl ? (
                  <Image
                    source={{ uri: user.imageUrl }}
                    className="w-20 h-20 rounded-full"
                  />
                ) : (
                  <Text className="text-2xl font-bold text-primary-600">
                    {user?.emailAddresses[0]?.emailAddress?.charAt(0).toUpperCase() ||
                      "U"}
                  </Text>
                )}
              </View>
              <View className="flex-1">
                <Text className="text-xl font-extrabold text-gray-900 mb-1">
                  User
                </Text>
                <Text className="text-base font-medium text-gray-600">
                  {user?.primaryEmailAddress?.emailAddress}
                </Text>
              </View>
            </View>

            {/* Account Stats */}
            <View className="flex-row justify-between pt-4 border-t border-gray-100">
              <View className="items-center flex-1">
                <Text className="text-xl font-extrabold text-gray-900">
                  {new Date(user?.createdAt || Date.now()).toLocaleDateString(
                    "en-US",
                    {
                      month: "short",
                      year: "numeric",
                    },
                  )}
                </Text>
                <Text className="text-sm font-medium text-gray-500 mt-1">
                  Member Since
                </Text>
              </View>
              <View className="w-px bg-gray-200 mx-4" />
              <View className="items-center flex-1">
                <Text className="text-xl font-extrabold text-primary-600">
                  Regular
                </Text>
                <Text className="text-sm font-medium text-gray-500 mt-1">
                  Account Type
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Account Settings Section */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 px-2">
            Account Settings
          </Text>

          <ProfileMenuItem
            icon={icons.profile}
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Profile editing will be available in a future update.",
              );
            }}
          />

          <ProfileMenuItem
            icon={icons.lock}
            title="Privacy & Security"
            subtitle="Password, 2FA, and privacy settings"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Security settings will be available in a future update.",
              );
            }}
          />
        </View>

        {/* App Settings Section */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 px-2">
            App Settings
          </Text>

          <ProfileMenuItem
            icon={icons.dollar}
            title="Currency Settings"
            subtitle="Choose your preferred currency"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Currency settings will be available in a future update.",
              );
            }}
          />

          <ProfileMenuItem
            icon={icons.home}
            title="Data Export"
            subtitle="Download your financial data"
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Data export will be available in a future update.",
              );
            }}
          />
        </View>

        {/* Support Section */}
        <View className="mx-6 mb-6">
          <Text className="text-lg font-bold text-gray-900 mb-4 px-2">
            Support & Info
          </Text>

          <ProfileMenuItem
            icon={icons.home}
            title="Help Center"
            subtitle="FAQs and support articles"
            // onPress={() => {
            //   Alert.alert("Help Center", "For support, please contact us at support@myfinance.app");
            // }}
            onPress={() => {
              Alert.alert(
                "Coming Soon",
                "Email preferences will be available in a future update.",
              );
            }}
          />

          {/* <ProfileMenuItem
            icon={icons.email}
            title="Contact Support"
            subtitle="Get help with your account"
            onPress={() => {
              const email = "support@myfinance.app";
              const subject = "MyFinance App Support";
              const body = "Hi, I need help with...";
              const url = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
              
              Linking.openURL(url).catch(() => {
                Alert.alert("Error", "Could not open email client. Please contact support@myfinance.app");
              });
            }}
          /> */}

          <ProfileMenuItem
            title="App Version"
            subtitle="Version 1.0.0"
            onPress={() => {
              Alert.alert("MyFinance", "Version 1.0.0");
            }}
            showArrow={false}
          />
        </View>

        {/* Sign Out Section */}

        <View className="mx-6 mb-2">
          <ProfileMenuItem
            icon={icons.lock}
            title="Sign Out"
            subtitle="Log out of your account"
            onPress={handleSignOut}
            textColor="text-red-600"
            bgColor="bg-red-50"
            showArrow={false}
          />
        </View>

        <View className="h-px bg-gray-200 mx-6 mb-6" />

        {/* Danger Zone - Account Deletion */}
        <View className="mx-6">
          <View className="bg-red-50 border border-red-200 rounded-3xl p-6">
            <Text className="text-lg font-bold text-red-800 mb-2">
              Danger Zone
            </Text>
            <Text className="text-red-600 font-medium text-sm mb-4">
              Deleting your account will permanently remove your profile and associated data. This action cannot be undone.
            </Text>
            <TouchableOpacity
              onPress={() => {
                Alert.alert(
                  "Delete Account",
                  "Are you sure you want to permanently delete your account? This action cannot be undone.",
                  [
                    { text: "Cancel", style: "cancel" },
                    {
                      text: "Delete",
                      style: "destructive",
                      onPress: async () => {
                        try {
                          if (!user?.id) {
                            Alert.alert("Error", "User not found");
                            return;
                          }

                          // First delete the user data from the database
                          await fetchAPI("/(api)/user", {
                            method: "DELETE",
                            body: JSON.stringify({ clerkId: user.id }),
                          });

                          // Then sign out and navigate properly
                          await signOut();
                          router.replace("/(auth)/sign-up");
                        } catch (err: any) {
                          Alert.alert("Error", err?.message || "Failed to delete account");
                        }
                      },
                    },
                  ],
                );
              }}
              className="bg-white py-3 px-6 rounded-2xl border border-red-100"
            >
              <Text className="text-red-600 text-center font-bold">Delete Account</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
