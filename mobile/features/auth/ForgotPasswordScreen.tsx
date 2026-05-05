import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import { Link } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function ForgotPasswordScreen() {
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    try {
      setLoading(true);
      const response = await api.forgotPassword(email);
      showSuccess("Check your email", response.message);
    } catch (error) {
      showError("Unable to continue", getErrorMessage(error, "Request failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>syntropy</Text>
        <Text style={styles.title}>Recover your password</Text>
      </View>
      <Card>
        <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
        <View style={{ height: 16 }} />
        <Button label={loading ? "Sending..." : "Send reset link"} onPress={submit} disabled={loading} />
      </Card>
      <Text style={styles.footerText}>
        Back to <Link href="/(auth)/login" style={styles.link}>login</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { gap: 8 },
  brand: { color: colors.primary, fontWeight: "900", fontSize: 18, textTransform: "lowercase" },
  title: { color: colors.text, fontWeight: "900", fontSize: 32 },
  footerText: { textAlign: "center", color: colors.muted, fontSize: 14 },
  link: { color: colors.primary, fontWeight: "800" },
});
