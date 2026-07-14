import React, { useState } from "react";
import { useAuth, useUser } from "@clerk/clerk-expo";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Alert,
  Image,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { fetchAPI } from "@/lib/fetch";

type MenuItemProps = {
  icon: React.ComponentProps<typeof Ionicons>["name"];
  title: string;
  subtitle: string;
  onPress: () => void;
  destructive?: boolean;
  showArrow?: boolean;
};

const MenuItem = ({
  icon,
  title,
  subtitle,
  onPress,
  destructive = false,
  showArrow = true,
}: MenuItemProps) => {
  const color = destructive ? "#C53030" : "#449445";

  return (
    <TouchableOpacity
      activeOpacity={0.65}
      className="flex-row items-center border-b border-secondary-300 py-5"
      onPress={onPress}
    >
      <View className="mr-4 h-10 w-10 items-center justify-center rounded-full bg-primary-100/40">
        <Ionicons color={color} name={icon} size={21} />
      </View>
      <View className="flex-1 pr-3">
        <Text
          className={`text-base font-semibold ${destructive ? "text-danger-700" : "text-secondary-900"}`}
        >
          {title}
        </Text>
        <Text className="mt-1 text-sm leading-5 text-secondary-600">
          {subtitle}
        </Text>
      </View>
      {showArrow && (
        <Ionicons color="#999999" name="chevron-forward" size={18} />
      )}
    </TouchableOpacity>
  );
};

const Profile = () => {
  const { user } = useUser();
  const { signOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const showUnavailable = (title: string) => {
    Alert.alert(title, "This setting is not available yet.");
  };

  const performSignOut = async () => {
    if (isSigningOut) return;

    try {
      setIsSigningOut(true);
      await signOut();
      router.replace("/(auth)/sign-in");
    } catch {
      Alert.alert("Error", "Failed to sign out. Please try again.");
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSignOut = () => {
    Alert.alert("Sign out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: performSignOut },
    ]);
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete account",
      "Your profile and financial data will be permanently deleted.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              if (!user?.id) {
                Alert.alert("Error", "User not found.");
                return;
              }

              await fetchAPI("/(api)/user", {
                method: "DELETE",
                body: JSON.stringify({ clerkId: user.id }),
              });
              await signOut();
              router.replace("/(auth)/sign-up");
            } catch (error: any) {
              Alert.alert(
                "Error",
                error?.message || "Failed to delete the account.",
              );
            }
          },
        },
      ],
    );
  };

  const initial =
    user?.firstName?.charAt(0) ||
    user?.primaryEmailAddress?.emailAddress?.charAt(0).toUpperCase() ||
    "U";
  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <SafeAreaView
      className="flex-1 bg-secondary-100"
      edges={["top", "left", "right"]}
    >
      <ScrollView
        className="flex-1 px-6"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <Text className="mt-5 text-[32px] font-bold tracking-[-0.8px] text-secondary-900">
          Profile
        </Text>

        <View className="mt-8 flex-row items-center border-b border-secondary-300 pb-8">
          <View className="mr-5 h-[72px] w-[72px] items-center justify-center overflow-hidden rounded-full bg-primary-100/50">
            {user?.imageUrl ? (
              <Image
                source={{ uri: user.imageUrl }}
                className="h-[72px] w-[72px]"
              />
            ) : (
              <Text className="text-2xl font-bold text-primary-700">
                {initial}
              </Text>
            )}
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-secondary-900">
              {user?.fullName || "Account"}
            </Text>
            <Text className="mt-1 text-sm text-secondary-600" numberOfLines={1}>
              {user?.primaryEmailAddress?.emailAddress}
            </Text>
            <Text className="mt-2 text-sm font-medium text-primary-700">
              Member since {memberSince}
            </Text>
          </View>
        </View>

        <Text className="mt-8 text-xl font-bold tracking-[-0.3px] text-secondary-900">
          Account
        </Text>
        <MenuItem
          icon="person-outline"
          onPress={() => showUnavailable("Edit profile")}
          subtitle="Name and personal information"
          title="Edit profile"
        />
        <MenuItem
          icon="shield-checkmark-outline"
          onPress={() => showUnavailable("Privacy and security")}
          subtitle="Password and account security"
          title="Privacy and security"
        />

        <Text className="mt-8 text-xl font-bold tracking-[-0.3px] text-secondary-900">
          Preferences
        </Text>
        <MenuItem
          icon="cash-outline"
          onPress={() => showUnavailable("Currency")}
          subtitle="Display currency for portfolio values"
          title="Currency"
        />
        <MenuItem
          icon="download-outline"
          onPress={() => showUnavailable("Data export")}
          subtitle="Download a copy of your financial data"
          title="Data export"
        />
        <MenuItem
          icon="help-circle-outline"
          onPress={() => showUnavailable("Help")}
          subtitle="Support and frequently asked questions"
          title="Help"
        />

        <Text className="mt-8 text-xl font-bold tracking-[-0.3px] text-secondary-900">
          Session
        </Text>
        <MenuItem
          destructive
          icon="log-out-outline"
          onPress={handleSignOut}
          showArrow={false}
          subtitle={isSigningOut ? "Signing out" : "Sign out on this device"}
          title="Sign out"
        />
        <MenuItem
          destructive
          icon="trash-outline"
          onPress={handleDeleteAccount}
          showArrow={false}
          subtitle="Permanently remove your profile and data"
          title="Delete account"
        />

        <Text className="mt-7 text-center text-sm text-secondary-500">
          MyFinance 1.0.0
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;
