import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function ProfileScreen() {
  const router = useRouter();
  const { signOut, user, token, setUser } = useAuth();
  const { showError, showSuccess, showWarning } = useToast();
  const [saving, setSaving] = useState(false);
  const [subjectInput, setSubjectInput] = useState("");
  const [form, setForm] = useState({
    name: "",
    username: "",
    email: "",
    phone: "",
    college: "",
    semester: "",
    targetRole: "",
    difficulty: "Medium",
    questions: "20",
    subjects: [] as string[],
    avatar: "",
  });

  useEffect(() => {
    setForm({
      name: user?.name || "",
      username: user?.username || "",
      email: user?.email || "",
      phone: user?.phoneNumber || "",
      college: user?.college || "",
      semester: String(user?.semester || ""),
      targetRole: user?.preferences?.targetRole || "",
      difficulty: user?.preferences?.difficulty || "Medium",
      questions: String(user?.preferences?.questionsPerTest || 20),
      subjects: user?.preferences?.subjects || [],
      avatar: user?.avatar || "",
    });
  }, [user]);

  const save = async () => {
    if (!token) return;
    try {
      setSaving(true);
      const trimmedPhone = form.phone.trim();
      const trimmedSemester = form.semester.trim();
      const trimmedQuestions = form.questions.trim();
      const response = await api.updateProfile(token, {
        name: form.name,
        username: form.username,
        email: form.email,
        phoneNumber: trimmedPhone || undefined,
        college: form.college,
        semester: trimmedSemester ? Number(trimmedSemester) : undefined,
        preferences: {
          targetRole: form.targetRole,
          difficulty: form.difficulty as "Easy" | "Medium" | "Hard",
          questionsPerTest: trimmedQuestions ? Number(trimmedQuestions) : undefined,
          subjects: form.subjects,
        },
      });
      setUser(response.user);
      showSuccess("Saved", "Profile updated successfully.");
    } catch (error) {
      showError("Save failed", getErrorMessage(error, "Unable to save profile"));
    } finally {
      setSaving(false);
    }
  };

  const pickAvatar = async () => {
    if (!token) return;
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      showWarning("Permission needed", "Allow photo library access to update the avatar.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [1, 1],
    });

    if (result.canceled) return;

    try {
      setSaving(true);
      const asset = result.assets[0];
      const response = await api.updateAvatar(token, {
        uri: asset.uri,
        name: asset.fileName || "avatar.jpg",
        mimeType: asset.mimeType || "image/jpeg",
        type: asset.mimeType || "image/jpeg",
      });
      setForm((prev) => ({ ...prev, avatar: response.avatar }));
      setUser(user ? { ...user, avatar: response.avatar } : user);
      showSuccess("Avatar updated", "Your profile photo was updated.");
    } catch (error) {
      showError("Upload failed", getErrorMessage(error, "Unable to upload avatar"));
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      showSuccess("Logged out", "Your session has been cleared.");
      router.replace("/(auth)/login");
    } catch (error) {
      showError("Logout failed", getErrorMessage(error, "Unable to log out"));
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MY ACCOUNT</Text>
        <Text style={styles.title}>Profile and plan</Text>
      </View>

      <Card>
        <Text style={styles.name}>{form.name || "Syntropy user"}</Text>
        <Text style={styles.copy}>{form.email}</Text>
        <View style={styles.buttonRow}>
          <Button label="Change avatar" onPress={() => void pickAvatar()} variant="secondary" />
          <Button label={saving ? "Saving..." : "Save profile"} onPress={() => void save()} disabled={saving} />
        </View>
      </Card>

      <Card>
        <Field label="Name" value={form.name} onChangeText={(value) => setForm((prev) => ({ ...prev, name: value }))} />
        <Spacer />
        <Field label="Username" value={form.username} onChangeText={(value) => setForm((prev) => ({ ...prev, username: value }))} />
        <Spacer />
        <Field label="Email" value={form.email} onChangeText={(value) => setForm((prev) => ({ ...prev, email: value }))} />
        <Spacer />
        <Field label="Phone" value={form.phone} onChangeText={(value) => setForm((prev) => ({ ...prev, phone: value }))} />
      </Card>

      <Card>
        <Field label="College" value={form.college} onChangeText={(value) => setForm((prev) => ({ ...prev, college: value }))} />
        <Spacer />
        <Field label="Semester" value={form.semester} onChangeText={(value) => setForm((prev) => ({ ...prev, semester: value }))} />
        <Spacer />
        <Field label="Target role" value={form.targetRole} onChangeText={(value) => setForm((prev) => ({ ...prev, targetRole: value }))} />
      </Card>

      <Card>
        <Pressable style={styles.choiceBox} onPress={() => setForm((prev) => ({ ...prev, difficulty: prev.difficulty === "Easy" ? "Medium" : prev.difficulty === "Medium" ? "Hard" : "Easy" }))}>
          <Text style={styles.choiceLabel}>Default difficulty</Text>
          <Text style={styles.choiceValue}>{form.difficulty}</Text>
        </Pressable>
        <Spacer />
        <Field label="Questions per test" value={form.questions} onChangeText={(value) => setForm((prev) => ({ ...prev, questions: value }))} />
        <Spacer />
        <Field label="Preferred subject" value={subjectInput} onChangeText={setSubjectInput} />
        <Spacer />
        <Button
          label="Add subject"
          onPress={() => {
            const next = subjectInput.trim();
            if (!next || form.subjects.includes(next)) return;
            setForm((prev) => ({ ...prev, subjects: [...prev.subjects, next] }));
            setSubjectInput("");
          }}
          variant="secondary"
        />
        <View style={styles.subjectList}>
          {form.subjects.map((subject) => (
            <Pressable key={subject} onPress={() => setForm((prev) => ({ ...prev, subjects: prev.subjects.filter((item) => item !== subject) }))} style={styles.subjectChip}>
              <Text style={styles.subjectText}>{subject} x</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.meta}>Plan: {user?.plan || "free"}</Text>
        <Text style={styles.meta}>Onboarding: {user?.onboardingCompleted ? "Completed" : "Incomplete"}</Text>
        <Spacer />
        {!user?.onboardingCompleted ? <Button label="Complete onboarding" onPress={() => router.push("/(app)/onboarding")} variant="secondary" /> : null}
        <Spacer />
        <Button label="Syllabus" onPress={() => router.push("/(app)/syllabus")} variant="secondary" />
        <Spacer />
        <Button label="Leaderboard" onPress={() => router.push("/(app)/leaderboard")} variant="secondary" />
        <Spacer />
        <Button label="Subscription" onPress={() => router.push("/(app)/subscription")} variant="secondary" />
        <Spacer />
        <Button label="Support" onPress={() => router.push("/(app)/support")} variant="secondary" />
      </Card>

      <Button label="Logout" onPress={handleLogout} variant="secondary" />
    </Screen>
  );
}

function Field({ label, value, onChangeText }: { label: string; value: string; onChangeText: (value: string) => void }) {
  return (
    <View>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput value={value} onChangeText={onChangeText} placeholderTextColor={colors.muted} style={styles.input} />
    </View>
  );
}

function Spacer() {
  return <View style={{ height: 12 }} />;
}

const styles = StyleSheet.create({
  header: {
    gap: 6,
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
  name: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
  },
  copy: {
    color: colors.muted,
    marginTop: 6,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 18,
  },
  fieldLabel: {
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
  metaList: {
    gap: 10,
    marginTop: 18,
  },
  meta: {
    color: colors.text,
    fontWeight: "700",
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
  subjectList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12,
  },
  subjectChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  subjectText: {
    color: colors.text,
    fontWeight: "700",
  },
});
