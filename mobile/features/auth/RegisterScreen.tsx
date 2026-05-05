import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function RegisterScreen() {
  const router = useRouter();
  const { register } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    password: "",
    confirmPassword: "",
  });

  const patch = (key: keyof typeof form, value: string) => setForm((prev) => ({ ...prev, [key]: value }));

  const sendOtp = async () => {
    try {
      setLoading(true);
      const response = await api.sendOtp({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
      });
      showSuccess("OTP sent", response.message);
      setStep(2);
    } catch (error) {
      showError("Unable to continue", getErrorMessage(error, "OTP request failed"));
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      const response = await api.verifyOtp({ email: form.email, otp });
      setOtpVerified(true);
      showSuccess("Email verified", response.message);
      setStep(3);
    } catch (error) {
      showError("Verification failed", getErrorMessage(error, "OTP verification failed"));
    } finally {
      setLoading(false);
    }
  };

  const completeRegistration = async () => {
    if (!otpVerified) {
      showWarning("OTP required", "Please verify your email before creating the account.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      showWarning("Password mismatch", "The password and confirmation must match.");
      return;
    }
    if (!acceptedTerms) {
      showWarning("Terms required", "Please accept the terms and conditions to continue.");
      return;
    }

    try {
      setLoading(true);
      const nextUser = await register({
        name: form.name,
        email: form.email,
        phoneNumber: form.phoneNumber,
        password: form.password,
        acceptedTerms,
      });
      showSuccess("Account created", "Your mobile account is ready.");
      router.replace(nextUser.onboardingCompleted ? "/(app)/dashboard" : "/(app)/onboarding");
    } catch (error) {
      showError("Registration failed", getErrorMessage(error, "Unable to create account"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.hero}>
        <Text style={styles.brand}>syntropy</Text>
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.copy}>The same 3-step web onboarding path is preserved here for mobile sign-up.</Text>
      </View>

      <Card>
        <Text style={styles.eyebrow}>STEP {step} OF 3</Text>
        <Text style={styles.heading}>Join Syntropy</Text>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / 3) * 100}%` }]} />
        </View>

        <View style={styles.form}>
          {step === 1 ? (
            <>
              <Input label="Full name" value={form.name} onChangeText={(value) => patch("name", value)} placeholder="Your name" />
              <Input label="Email" value={form.email} onChangeText={(value) => patch("email", value)} placeholder="you@example.com" keyboardType="email-address" />
              <Input label="Phone number" value={form.phoneNumber} onChangeText={(value) => patch("phoneNumber", value)} placeholder="9876543210" keyboardType="phone-pad" />
              <Button label={loading ? "Sending..." : "Continue"} onPress={sendOtp} disabled={loading} />
            </>
          ) : null}

          {step === 2 ? (
            <>
              <Input label="Verification code" value={otp} onChangeText={setOtp} placeholder="Enter OTP" keyboardType="number-pad" />
              <View style={styles.row}>
                <View style={styles.rowButton}>
                  <Button label="Back" onPress={() => setStep(1)} variant="secondary" />
                </View>
                <View style={styles.rowButton}>
                  <Button label={loading ? "Verifying..." : "Verify"} onPress={verifyOtp} disabled={loading} />
                </View>
              </View>
            </>
          ) : null}

          {step === 3 ? (
            <>
              <Input label="Password" value={form.password} onChangeText={(value) => patch("password", value)} placeholder="Create password" secureTextEntry />
              <Input label="Confirm password" value={form.confirmPassword} onChangeText={(value) => patch("confirmPassword", value)} placeholder="Repeat password" secureTextEntry />
              <Pressable style={styles.checkboxRow} onPress={() => setAcceptedTerms((prev) => !prev)}>
                <View style={[styles.checkbox, acceptedTerms ? styles.checkboxActive : null]} />
                <Text style={styles.checkboxText}>I agree to the Terms and Conditions.</Text>
              </Pressable>
              <View style={styles.row}>
                <View style={styles.rowButton}>
                  <Button label="Back" onPress={() => setStep(2)} variant="secondary" />
                </View>
                <View style={styles.rowButton}>
                  <Button label={loading ? "Creating..." : "Create account"} onPress={completeRegistration} disabled={loading} />
                </View>
              </View>
            </>
          ) : null}
        </View>
      </Card>

      <Text style={styles.footerText}>
        Already have an account? <Link href="/(auth)/login" style={styles.link}>Login</Link>
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
    marginTop: 4,
  },
  progressTrack: {
    marginTop: 18,
    height: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  form: {
    marginTop: 18,
    gap: 16,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  rowButton: {
    flex: 1,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  checkboxActive: {
    backgroundColor: colors.primary,
  },
  checkboxText: {
    flex: 1,
    color: colors.text,
    lineHeight: 20,
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
