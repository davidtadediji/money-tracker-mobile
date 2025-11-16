import { Tabs } from "expo-router";
import React from "react";
import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="chart.bar.xaxis" color={color} />
          ),
          unmountOnBlur: true,
        } as any}
      />

      <Tabs.Screen
        name="transactions"
        options={{
          title: "Transactions",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="paperplane.fill" color={color} />
          ),
          unmountOnBlur: true,
        } as any}
      />

      <Tabs.Screen
        name="budget"
        options={{
          title: "Budget",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="wallet.pass.fill" color={color} />
          ),
          unmountOnBlur: true,
        } as any}
      />

      <Tabs.Screen
        name="analytics"
        options={{
          title: "Analytics",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="chart.bar.xaxis" color={color} />
          ),
          unmountOnBlur: true,
        } as any}
      />

      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }: { color: string }) => (
            <IconSymbol size={28} name="gear" color={color} />
          ),
          unmountOnBlur: true,
        } as any}
      />
    </Tabs>
  );
}
