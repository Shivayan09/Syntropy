import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { formatDate } from "@/lib/exam";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { TestSummary } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function TestPreviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const [test, setTest] = useState<TestSummary | null>(null);
  const [starting, setStarting] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token || !params.id) return;
      try {
        const response = await api.getTest(token, params.id);
        setTest(response.test);
      } catch (error) {
        showError("Could not load test", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [params.id, showError, token]);

  const questionCount = useMemo(() => test?.totalQuestions || test?.questions?.length || 0, [test]);
  const subjectCount = test?.subjects?.length || 0;
  const paceSeconds = questionCount && test?.duration ? Math.max(1, Math.round((test.duration * 60) / questionCount)) : null;

  const start = async () => {
    if (!token || !params.id) return;
    try {
      setStarting(true);
      const response = await api.startAttempt(token, params.id);
      showSuccess("Attempt started", "Your timer is now running.");
      router.replace(`/(app)/test/attempt/${response.attemptId}`);
    } catch (error) {
      showError("Could not start attempt", getErrorMessage(error, "Start failed"));
    } finally {
      setStarting(false);
    }
  };

  if (!test) {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Test not found</Text>
          <Text style={styles.copy}>This test may have been removed or is unavailable.</Text>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>{test.type === "generated" ? "AI GENERATED" : "MANUAL TEST"}</Text>
        <Text style={styles.title}>{test.title || "Untitled test"}</Text>
        <Text style={styles.copy}>A quick operational check before you enter the timed attempt environment.</Text>
      </View>

      <Card highlight>
        <Text style={styles.metricLabel}>Estimated pace</Text>
        <Text style={styles.bigMetric}>{paceSeconds ? `${paceSeconds}s` : "-"}</Text>
        <Text style={styles.copy}>Per question based on the configured duration.</Text>
      </Card>

      <View style={styles.grid}>
        <Metric label="Difficulty" value={test.difficulty || "Mixed"} />
        <Metric label="Questions" value={String(questionCount || "-")} />
        <Metric label="Duration" value={`${test.duration || 0} min`} />
        <Metric label="Subjects" value={String(subjectCount || "-")} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Coverage</Text>
        <Text style={styles.copy}>Created {formatDate(test.createdAt)}</Text>
        <View style={{ height: 16 }} />
        <View style={styles.subjects}>
          {(test.subjects || []).length > 0 ? (
            (test.subjects || []).map((subject) => (
              <View key={subject} style={styles.subjectChip}>
                <Text style={styles.subjectText}>{subject}</Text>
              </View>
            ))
          ) : (
            <Text style={styles.copy}>No subject labels were attached to this test.</Text>
          )}
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Before you begin</Text>
        <Text style={styles.copy}>The timer starts immediately after you begin.</Text>
        <Text style={styles.copy}>Keep the app open until you submit.</Text>
        <Text style={styles.copy}>Review all answered and unanswered questions before final submission.</Text>
      </Card>

      <Card>
        <Text style={styles.metricLabel}>Start attempt</Text>
        <Text style={styles.bigMetric}>{test.duration || "-"} min</Text>
        <Text style={styles.copy}>You will be redirected to the attempt interface immediately.</Text>
        <View style={{ height: 16 }} />
        <Button label={starting ? "Preparing..." : "Start now"} onPress={start} disabled={starting} />
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </Card>
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
    lineHeight: 34,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  grid: {
    gap: 12,
  },
  metricLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  bigMetric: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 42,
    marginTop: 8,
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
  },
  subjects: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  subjectChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  subjectText: {
    color: colors.text,
    fontWeight: "800",
  },
});
