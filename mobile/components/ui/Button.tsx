import { boxShadow } from "@/theme/shadows";
import { colors, radius, spacing } from "@/theme/tokens";
import { Pressable, StyleSheet, Text } from "react-native";

type Props = {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary";
  disabled?: boolean;
};

export function Button({ label, onPress, variant = "primary", disabled }: Props) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === "primary" ? styles.primary : styles.secondary,
        pressed && !disabled ? styles.pressed : null,
        disabled ? styles.disabled : null,
      ]}
    >
      <Text style={[styles.text, variant === "secondary" ? styles.secondaryText : null]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 52,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
    ...boxShadow(colors.shadow),
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.bgSecondary,
  },
  text: {
    color: colors.white,
    fontWeight: "800",
    fontSize: 16,
  },
  secondaryText: {
    color: colors.text,
  },
  pressed: {
    transform: [{ translateX: 2 }, { translateY: 2 }],
    ...boxShadow(colors.shadow, 2),
  },
  disabled: {
    opacity: 0.55,
  },
});
