import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import { Feather } from "@expo/vector-icons";
import { Redirect, Tabs, useSegments } from "expo-router";

export default function AppLayout() {
  const { ready, user } = useAuth();
  const segments = useSegments();
  const currentPath = segments.join("/");
  const isOnboardingRoute = currentPath.startsWith("(app)/onboarding");

  if (!ready) {
    return null;
  }

  if (!user) {
    return <Redirect href="/(auth)/login" />;
  }

  if (!user.onboardingCompleted && !isOnboardingRoute) {
    return <Redirect href="/(app)/onboarding" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: "#6f6f6f",
        tabBarStyle: {
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 72,
          paddingTop: 8,
          paddingBottom: 10,
          backgroundColor: colors.surface,
        },
        tabBarLabelStyle: {
          fontWeight: "800",
          fontSize: 11,
        },
      }}
    >
      <Tabs.Screen name="dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Feather name="grid" size={size} color={color} /> }} />
      <Tabs.Screen name="tests" options={{ title: "Tests", tabBarIcon: ({ color, size }) => <Feather name="book-open" size={size} color={color} /> }} />
      <Tabs.Screen name="create" options={{ title: "Create", tabBarIcon: ({ color, size }) => <Feather name="edit-3" size={size} color={color} /> }} />
      <Tabs.Screen name="history" options={{ title: "History", tabBarIcon: ({ color, size }) => <Feather name="rotate-ccw" size={size} color={color} /> }} />
      <Tabs.Screen name="analytics" options={{ title: "Analytics", tabBarIcon: ({ color, size }) => <Feather name="bar-chart-2" size={size} color={color} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Feather name="settings" size={size} color={color} /> }} />
      <Tabs.Screen name="onboarding" options={{ href: null }} />
      <Tabs.Screen name="create/manual" options={{ href: null }} />
      <Tabs.Screen name="create/generate" options={{ href: null }} />
      <Tabs.Screen name="test/preview/[id]" options={{ href: null }} />
      <Tabs.Screen name="test/attempt/[id]" options={{ href: null }} />
      <Tabs.Screen name="test/result/[id]" options={{ href: null }} />
      <Tabs.Screen name="history/review/[id]" options={{ href: null }} />
      <Tabs.Screen name="leaderboard" options={{ href: null }} />
      <Tabs.Screen name="syllabus" options={{ href: null }} />
      <Tabs.Screen name="support" options={{ href: null }} />
      <Tabs.Screen name="subscription" options={{ href: null }} />
      <Tabs.Screen name="users/[id]" options={{ href: null }} />
    </Tabs>
  );
}
