import { boxShadow } from "@/theme/shadows";
import { colors, radius, spacing } from "@/theme/tokens";
import { StyleSheet, Text, TextInput, View } from "react-native";

type Props = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
};

export function Input(props: Props) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.muted}
        secureTextEntry={props.secureTextEntry}
        keyboardType={props.keyboardType}
        autoCapitalize="none"
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },
  label: {
    fontWeight: "800",
    color: colors.text,
    fontSize: 14,
  },
  input: {
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.input,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    ...boxShadow(colors.shadow),
  },
});
