import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import { useState } from "react";
import { StyleSheet, Text, TextInput, View } from "react-native";

const faqs = [
  ["Are these tests actually useful?", "They show where you waste time, where you guess, and what topics you do not actually understand."],
  ["Is this only for competitive exams?", "No. Placements, semester prep, or any timed practice benefits from structured feedback."],
  ["Will this track weak topics automatically?", "Yes. Accuracy, time spent, and performance trends reveal what you need to fix."],
];

export function SupportScreen() {
  const { token, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (!token) return;
    try {
      setSubmitting(true);
      const response = await api.contactSupport(token, {
        name: user?.name || "",
        email: user?.email || "",
        message,
      });
      showSuccess("Sent", response.message);
      setMessage("");
    } catch (error) {
      showError("Unable to send", getErrorMessage(error, "Support request failed"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>SUPPORT</Text>
        <Text style={styles.title}>Contact us</Text>
      </View>

      <Card>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.copy}>{user?.name}</Text>
        <Text style={styles.label}>Email</Text>
        <Text style={styles.copy}>{user?.email}</Text>
        <Text style={styles.label}>Message</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          placeholder="Explain your issue..."
          placeholderTextColor={colors.muted}
          multiline
          textAlignVertical="top"
          style={styles.textarea}
        />
        <View style={{ height: 16 }} />
        <Button label={submitting ? "Sending..." : "Send message"} onPress={() => void submit()} disabled={submitting} />
      </Card>

      {faqs.map(([question, answer]) => (
        <Card key={question}>
          <Text style={styles.question}>{question}</Text>
          <Text style={styles.copy}>{answer}</Text>
        </Card>
      ))}
    </Screen>
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
  label: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 8,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginBottom: 12,
  },
  textarea: {
    minHeight: 140,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    padding: 14,
  },
  question: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginBottom: 8,
  },
});
