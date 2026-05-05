import "react-native-gesture-handler";

import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <AuthProvider>
      <ToastProvider>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        />
      </ToastProvider>
    </AuthProvider>
  );
}
