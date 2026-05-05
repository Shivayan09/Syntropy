import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function LoginScreen() {
  const router = useRouter();
  const { signIn } = useAuth();
  const { showError, showSuccess } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setLoading(true);
      const nextUser = await signIn(email, password);
      showSuccess("Welcome back", "Login successful.");
      router.replace(nextUser.onboardingCompleted ? "/(app)/dashboard" : "/(app)/onboarding");
    } catch (error) {
      showError("Login failed", getErrorMessage(error, "Unable to log in"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>syntropy</Text>
        <Text style={styles.title}>Stop guessing. Start improving.</Text>
        <Text style={styles.copy}>The same exam-focused experience as your web app, now shaped for native mobile.</Text>
      </View>

      <Card>
        <View style={styles.formHeader}>
          <Text style={styles.eyebrow}>WELCOME BACK</Text>
          <Text style={styles.heading}>Login to continue</Text>
        </View>

        <View style={styles.form}>
          <Input label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" />
          <Input label="Password" value={password} onChangeText={setPassword} placeholder="Enter your password" secureTextEntry />
          <Button label={loading ? "Logging in..." : "Login"} onPress={handleLogin} disabled={loading} />
        </View>
      </Card>

      <Text style={styles.footerText}>
        New here? <Link href="/(auth)/register" style={styles.link}>Create account</Link>
      </Text>
      <Text style={styles.footerText}>
        Forgot password? <Link href="/(auth)/forgot-password" style={styles.link}>Reset it</Link>
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 10,
  },
  brand: {
    color: colors.primary,
    fontWeight: "900",
    textTransform: "lowercase",
    fontSize: 18,
  },
  title: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: colors.text,
  },
  copy: {
    fontSize: 16,
    color: colors.muted,
    lineHeight: 24,
  },
  formHeader: {
    gap: 4,
    marginBottom: 18,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  heading: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 26,
  },
  form: {
    gap: 16,
  },
  footerText: {
    textAlign: "center",
    color: colors.muted,
    fontSize: 14,
  },
  link: {
    color: colors.primary,
    fontWeight: "800",
  },
});
