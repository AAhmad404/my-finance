import React from "react";
import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const visibleTabs = ["home", "add", "profile"] as const;

type PortfolioTabBarProps = Parameters<
  NonNullable<React.ComponentProps<typeof Tabs>["tabBar"]>
>[0];

const tabDetails = {
  home: {
    activeIcon: "pie-chart" as const,
    icon: "pie-chart-outline" as const,
    label: "Portfolio",
  },
  add: {
    activeIcon: "add-circle" as const,
    icon: "add-circle-outline" as const,
    label: "Add",
  },
  profile: {
    activeIcon: "person" as const,
    icon: "person-outline" as const,
    label: "Profile",
  },
};

function PortfolioTabBar({
  state,
  descriptors,
  navigation,
}: PortfolioTabBarProps) {
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeRoute = state.routes[state.index];

  if (activeRoute.name.startsWith("details/")) {
    return null;
  }

  return (
    <View
      style={[
        styles.tabBar,
        {
          height: 58 + insets.bottom,
          paddingBottom: Math.max(insets.bottom, 8),
          width,
        },
      ]}
    >
      {visibleTabs.map((name) => {
        const route = state.routes.find((item) => item.name === name);

        if (!route) return null;

        const focused = route.key === activeRoute.key;
        const details = tabDetails[name];
        const color = focused ? "#35A548" : "#7C8289";

        return (
          <View
            key={route.key}
            style={[styles.tabSlot, { width: width / visibleTabs.length }]}
          >
            <TouchableOpacity
              accessibilityLabel={
                descriptors[route.key]?.options.tabBarAccessibilityLabel ??
                details.label
              }
              accessibilityRole="tab"
              accessibilityState={{ selected: focused }}
              activeOpacity={0.65}
              onPress={() => {
                const event = navigation.emit({
                  canPreventDefault: true,
                  target: route.key,
                  type: "tabPress",
                });

                if (!focused && !event.defaultPrevented) {
                  navigation.navigate(route.name, route.params);
                }
              }}
              style={styles.tabItem}
            >
              <Ionicons
                color={color}
                name={focused ? details.activeIcon : details.icon}
                size={26}
              />
              <Text
                numberOfLines={1}
                style={[
                  styles.tabLabel,
                  { color },
                  focused && styles.activeLabel,
                ]}
              >
                {details.label}
              </Text>
            </TouchableOpacity>
          </View>
        );
      })}
    </View>
  );
}

export default function Layout() {
  return (
    <Tabs
      initialRouteName="home"
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <PortfolioTabBar {...props} />}
    >
      <Tabs.Screen name="home" options={{ title: "Portfolio" }} />
      <Tabs.Screen name="add" options={{ title: "Add" }} />
      <Tabs.Screen name="profile" options={{ title: "Profile" }} />
      <Tabs.Screen
        name="details/[id]"
        options={{ href: null, title: "Asset Details" }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    alignItems: "stretch",
    alignSelf: "stretch",
    backgroundColor: "#FFFFFF",
    borderTopColor: "#D9D9D9",
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    paddingTop: 8,
  },
  tabSlot: {
    alignItems: "center",
    flexGrow: 0,
    flexShrink: 0,
  },
  tabItem: {
    alignItems: "center",
    flex: 1,
    gap: 2,
    justifyContent: "center",
    minWidth: 0,
    width: "100%",
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    lineHeight: 16,
    textAlign: "center",
    width: "100%",
  },
  activeLabel: {
    fontWeight: "600",
  },
});
