import React from "react";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View, Pressable } from "react-native";
import { icons } from "@/constants";

const TabIcon = ({
  source,
  focused,
}: {
  source: ImageSourcePropType;
  focused: boolean;
}) => (
  <View className="w-16 h-full pt-3 items-center">
    <View
      className={`w-12 h-12 items-center justify-center rounded-full ${
        focused ? "bg-primary-400" : ""
      }`}
    >
      <Image
        source={source}
        tintColor={focused ? "white" : "#4D4D4D"}
        resizeMode="contain"
        className="w-6 h-6"
      />
    </View>
  </View>
);

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{
        tabBarActiveTintColor: "#4D4D4D",
        tabBarInactiveTintColor: "#4D4D4D",
        tabBarShowLabel: false,
        tabBarStyle: {
          backgroundColor: "white",
          height: 88,
          display: "flex",
          alignItems: "flex-start",
          borderTopWidth: 1,
          borderTopColor: "#EEEEEE",
          elevation: 0,
          shadowOpacity: 0,
        },
        tabBarItemStyle: {
          flex: 1,
        },
        tabBarButton: (props) => <Pressable {...props} style={props.style} />,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: "Home",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.home} focused={focused} />
          ),
          tabBarItemStyle: { flex: 1 },
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: "Add",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.add} focused={focused} />
          ),
          tabBarItemStyle: { flex: 1 },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          headerShown: false,
          tabBarIcon: ({ focused }) => (
            <TabIcon source={icons.profile} focused={focused} />
          ),
          tabBarItemStyle: { flex: 1 },
        }}
      />
      <Tabs.Screen
        name="details/[id]"
        options={{
          title: "Asset Details",
          headerShown: false,
          tabBarButton: () => null,
          tabBarItemStyle: { display: "none", width: 0 },
        }}
      />
    </Tabs>
  );
}
