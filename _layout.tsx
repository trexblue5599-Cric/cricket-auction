import { BlurView } from "expo-blur";
import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { Icon, Label, NativeTabs } from "expo-router/unstable-native-tabs";
import { SymbolView } from "expo-symbols";
import { Feather } from "@expo/vector-icons";
import React from "react";
import { Platform, StyleSheet, View, useColorScheme } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";

function NativeTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  return (
    <NativeTabs
      style={{
        backgroundColor: "rgba(255,255,255,0.04)",
        borderTopWidth: 1,
        borderTopColor: "rgba(255,255,255,0.06)",
        backdropFilter: "blur(20px)",
      }}
    >
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "house", selected: "house.fill" }} />
        <Label>Home</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="players">
        <Icon sf={{ default: "person.2", selected: "person.2.fill" }} />
        <Label>Players</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="teams">
        <Icon sf={{ default: "shield", selected: "shield.fill" }} />
        <Label>Teams</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const colors = useColors();
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();
  const isDark = colorScheme === "dark";
  const isIOS = Platform.OS === "ios";
  const isWeb = Platform.OS === "web";

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#818cf8",
        tabBarInactiveTintColor: colors.mutedForeground,
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          bottom: isIOS ? insets.bottom : 10,
          left: isWeb ? 0 : 16,
          right: isWeb ? 0 : 16,
          height: isWeb ? 80 : 68,
          borderRadius: isWeb ? 0 : 20,
          backgroundColor: "rgba(255,255,255,0.04)",
          borderTopWidth: 1,
          borderTopColor: "rgba(255,255,255,0.06)",
          borderWidth: isWeb ? 0 : 1,
          borderColor: "rgba(255,255,255,0.06)",
          shadowColor: "#818cf8",
          shadowRadius: 20,
          shadowOpacity: 0.08,
          elevation: 10,
          paddingBottom: isWeb ? 12 : 0,
          ...(isWeb ? { position: "relative", bottom: 0 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint={isDark ? "dark" : "light"} style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: "#0a0a0a" }]} />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "house.fill" : "house"} tintColor={color} size={24} />
            ) : (
              <Feather name={focused ? "home" : "home"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="players"
        options={{
          title: "Players",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "person.2.fill" : "person.2"} tintColor={color} size={24} />
            ) : (
              <Feather name={focused ? "users" : "users"} size={22} color={color} />
            ),
        }}
      />
      <Tabs.Screen
        name="teams"
        options={{
          title: "Teams",
          tabBarIcon: ({ color, focused }) =>
            isIOS ? (
              <SymbolView name={focused ? "shield.fill" : "shield"} tintColor={color} size={24} />
            ) : (
              <Feather name={focused ? "shield" : "shield"} size={22} color={color} />
            ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
