import type { ReactNode } from "react";
import { boxShadow } from "@/theme/shadows";
import { colors, radius, spacing } from "@/theme/tokens";
import { StyleSheet, View } from "react-native";

export function Card({
  children,
  highlight,
}: {
  children: ReactNode;
  highlight?: boolean;
}) {
  return <View style={[styles.card, highlight ? styles.highlight : null]}>{children}</View>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.card,
    padding: spacing.lg,
    ...boxShadow(colors.shadow),
  },
  highlight: {
    ...boxShadow(colors.primary),
  },
});
