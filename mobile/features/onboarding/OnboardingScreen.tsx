import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import * as DocumentPicker from "expo-document-picker";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const steps = ["Basic Info", "Education", "Preferences", "Syllabus", "Finish"];

export function OnboardingScreen() {
  const router = useRouter();
  const { token, user, setUser } = useAuth();
  const { showError, showSuccess } = useToast();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [syllabusName, setSyllabusName] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    username: user?.username || "",
    college: user?.college || "",
    semester: String(user?.semester || ""),
    targetRole: user?.preferences?.targetRole || "",
    difficulty: user?.preferences?.difficulty || "Medium",
    questionsPerTest: String(user?.preferences?.questionsPerTest || 20),
  });

  const canContinue = useMemo(() => {
    if (step === 1) return Boolean(form.name.trim() && form.username.trim());
    if (step === 2) return Boolean(form.college.trim() && form.semester.trim());
    if (step === 3) return Boolean(form.targetRole.trim() && form.questionsPerTest.trim());
    return true;
  }, [form, step]);

  const saveProfileBlock = async () => {
    if (!token) return;
    const trimmedSemester = form.semester.trim();
    const trimmedQuestions = form.questionsPerTest.trim();
    const response = await api.updateProfile(token, {
      name: form.name,
      username: form.username,
      college: form.college,
      semester: trimmedSemester ? Number(trimmedSemester) : undefined,
      preferences: {
        targetRole: form.targetRole,
        difficulty: form.difficulty as "Easy" | "Medium" | "Hard",
        questionsPerTest: trimmedQuestions ? Number(trimmedQuestions) : undefined,
      },
    });
    setUser(response.user);
  };

  const pickSyllabus = async () => {
    if (!token) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    try {
      setLoading(true);
      const asset = result.assets[0];
      setSyllabusName(asset.name);
      await api.uploadSyllabus(token, {
        uri: asset.uri,
        name: asset.name,
        mimeType: asset.mimeType || "application/octet-stream",
        type: asset.mimeType || "application/octet-stream",
      });
      showSuccess("Uploaded", "Syllabus uploaded successfully.");
    } catch (error) {
      showError("Upload failed", getErrorMessage(error, "Unable to upload syllabus"));
    } finally {
      setLoading(false);
    }
  };

  const next = async () => {
    try {
      if (step === 3) {
        setLoading(true);
        await saveProfileBlock();
      }
      if (step < steps.length) {
        setStep((prev) => prev + 1);
      }
    } catch (error) {
      showError("Unable to continue", getErrorMessage(error, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const finish = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.updateProfile(token, { onboardingCompleted: true });
      setUser(response.user);
      showSuccess("Setup complete", "Your profile is ready.");
      router.replace("/(app)/dashboard");
    } catch (error) {
      showError("Unable to finish", getErrorMessage(error, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  const skipOnboarding = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await api.updateProfile(token, { onboardingCompleted: true });
      setUser(response.user);
      showSuccess("Onboarding skipped", "You can finish setup later from your profile.");
      router.replace("/(app)/dashboard");
    } catch (error) {
      showError("Unable to skip", getErrorMessage(error, "Something went wrong"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>STEP {step} / {steps.length}</Text>
        <Text style={styles.title}>{steps[step - 1]}</Text>
        <Text style={styles.copy}>Set up your academic context so test creation, review, and recommendations feel like the website.</Text>
      </View>

      <Card>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${(step / steps.length) * 100}%` }]} />
        </View>

        {step === 1 ? (
          <View style={styles.form}>
            <Field label="Full name" value={form.name} onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))} />
            <Field label="Username" value={form.username} onChangeText={(value) => setForm((prev) => ({ ...prev, username: value }))} />
          </View>
        ) : null}

        {step === 2 ? (
          <View style={styles.form}>
            <Field label="College" value={form.college} onChangeText={(value) => setForm((prev) => ({ ...prev, college: value }))} />
            <Field label="Semester" value={form.semester} onChangeText={(value) => setForm((prev) => ({ ...prev, semester: value }))} keyboardType="number-pad" />
          </View>
        ) : null}

        {step === 3 ? (
          <View style={styles.form}>
            <Field label="Target role" value={form.targetRole} onChangeText={(value) => setForm((prev) => ({ ...prev, targetRole: value }))} />
            <Pressable style={styles.choiceBox} onPress={() => setForm((prev) => ({ ...prev, difficulty: prev.difficulty === "Easy" ? "Medium" : prev.difficulty === "Medium" ? "Hard" : "Easy" }))}>
              <Text style={styles.choiceLabel}>Preferred difficulty</Text>
              <Text style={styles.choiceValue}>{form.difficulty}</Text>
            </Pressable>
            <Field label="Questions per test" value={form.questionsPerTest} onChangeText={(value) => setForm((prev) => ({ ...prev, questionsPerTest: value }))} keyboardType="number-pad" />
          </View>
        ) : null}

        {step === 4 ? (
          <View style={styles.form}>
            <Text style={styles.copy}>Upload your syllabus PDF or image so manual and AI flows can suggest the right subjects.</Text>
            <Button label={loading ? "Uploading..." : "Upload syllabus"} onPress={() => void pickSyllabus()} disabled={loading} />
            {syllabusName ? <Text style={styles.copy}>Selected: {syllabusName}</Text> : null}
          </View>
        ) : null}

        {step === 5 ? (
          <View style={styles.form}>
            <Text style={styles.finish}>All set. Your account is ready for mobile practice.</Text>
          </View>
        ) : null}

        <View style={styles.actions}>
          {step > 1 ? <Button label="Back" onPress={() => setStep((prev) => Math.max(1, prev - 1))} variant="secondary" /> : <View style={styles.buttonSpacer} />}
          {step < steps.length ? <Button label={loading ? "Processing..." : "Next"} onPress={() => void next()} disabled={!canContinue || loading} /> : <Button label={loading ? "Finishing..." : "Enter"} onPress={() => void finish()} disabled={loading} />}
        </View>

        <View style={{ height: 12 }} />
        <Button label={loading ? "Please wait..." : "Skip onboarding"} onPress={() => void skipOnboarding()} disabled={loading} variant="secondary" />
      </Card>
    </Screen>
  );
}

function Field(props: { label: string; value: string; onChangeText: (value: string) => void; keyboardType?: "default" | "number-pad" }) {
  return (
    <View>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput value={props.value} onChangeText={props.onChangeText} keyboardType={props.keyboardType} placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 8,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 12,
    letterSpacing: 1.2,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 30,
  },
  progressTrack: {
    height: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    marginBottom: 18,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  form: {
    gap: 16,
  },
  label: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  actions: {
    marginTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  buttonSpacer: {
    flex: 1,
  },
  choiceBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  choiceLabel: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  choiceValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 8,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
  },
  finish: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 30,
  },
});
