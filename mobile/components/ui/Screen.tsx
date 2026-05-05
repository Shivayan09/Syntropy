import type { ReactNode } from "react";
import { colors, spacing } from "@/theme/tokens";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScrollView, StyleSheet, View } from "react-native";

export function Screen({
  children,
  scroll = true,
}: {
  children: ReactNode;
  scroll?: boolean;
}) {
  const content = <View style={styles.content}>{children}</View>;

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right"]}>
      {scroll ? (
        <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent}>
          {content}
        </ScrollView>
      ) : (
        content
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: spacing.xxl,
  },
  content: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    gap: spacing.lg,
  },
});
