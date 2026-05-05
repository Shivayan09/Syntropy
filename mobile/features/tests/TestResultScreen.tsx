import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { clampPercent, formatDateTime, formatDurationMinutes } from "@/lib/exam";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { Attempt } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

export function TestResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { showError } = useToast();
  const [attempt, setAttempt] = useState<Attempt | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!token || !params.id) return;
      try {
        const response = await api.getAttempt(token, params.id);
        setAttempt(response.attempt);
      } catch (error) {
        showError("Could not load result", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [params.id, showError, token]);

  const isMcq = attempt?.test?.testFormat === "mcq";
  const totalQuestions = useMemo(() => {
    if (!attempt) return 0;
    if (isMcq) return (attempt.correct || 0) + (attempt.wrong || 0) + (attempt.skipped || 0);
    return attempt.test?.questions?.length || 0;
  }, [attempt, isMcq]);

  if (!attempt) {
    return null;
  }

  const obtainedMarks = attempt.obtainedMarks || 0;
  const totalMarks = attempt.totalMarks || attempt.test?.totalMarks || 0;
  const performanceRatio = isMcq ? clampPercent(attempt.accuracy || 0) : Math.round((obtainedMarks / (totalMarks || 1)) * 100);
  const duration = formatDurationMinutes(attempt.startedAt, attempt.completedAt, attempt.duration);
  const resultTone = performanceRatio >= 80 ? "Excellent control" : performanceRatio >= 60 ? "Solid attempt" : "Needs focused review";

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ATTEMPT RESULT</Text>
        <Text style={styles.title}>{attempt.test?.title || "Mock Test"}</Text>
      </View>

      <Card highlight>
        <Text style={styles.metricLabel}>Score report</Text>
        <Text style={styles.bigMetric}>{performanceRatio}%</Text>
        <Text style={styles.copy}>{resultTone}</Text>
      </Card>

      <View style={styles.grid}>
        <Metric label={isMcq ? "Correct" : "Marks scored"} value={String(isMcq ? attempt.correct || 0 : obtainedMarks)} />
        <Metric label={isMcq ? "Wrong" : "Total marks"} value={String(isMcq ? attempt.wrong || 0 : totalMarks)} />
        <Metric label={isMcq ? "Skipped" : "Questions"} value={String(isMcq ? attempt.skipped || 0 : totalQuestions)} />
      </View>

      <Card>
        <Text style={styles.sectionTitle}>Attempt details</Text>
        <Text style={styles.copy}>Submitted {formatDateTime(attempt.completedAt || attempt.createdAt)}</Text>
        <Text style={styles.copy}>Time taken {duration}</Text>
        <Text style={styles.copy}>
          {isMcq ? `${attempt.correct || 0}/${totalQuestions || "-"} answered correctly` : `${obtainedMarks}/${totalMarks || "-"} marks scored`}
        </Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Question distribution</Text>
        {isMcq ? (
          <>
            <DistributionRow label="Correct" value={attempt.correct || 0} total={totalQuestions} color={colors.primary} />
            <DistributionRow label="Wrong" value={attempt.wrong || 0} total={totalQuestions} color={colors.text} />
            <DistributionRow label="Skipped" value={attempt.skipped || 0} total={totalQuestions} color={colors.bg} />
          </>
        ) : (
          <DistributionRow label="Marks scored" value={obtainedMarks} total={totalMarks} color={colors.primary} />
        )}
      </Card>

      <Button label="Review answers" onPress={() => router.push(`/(app)/history/review/${attempt._id}`)} />
      <Button label="Back to tests" onPress={() => router.replace("/(app)/tests")} variant="secondary" />
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

function DistributionRow({ label, value, total, color }: { label: string; value: number; total: number; color: string }) {
  const percent = total ? Math.round((value / total) * 100) : 0;

  return (
    <View style={styles.distributionRow}>
      <View style={styles.distributionMeta}>
        <Text style={styles.distributionLabel}>{label}</Text>
        <Text style={styles.distributionValue}>{value}</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${percent}%`, backgroundColor: color }]} />
      </View>
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
    fontSize: 52,
    marginTop: 8,
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
  },
  distributionRow: {
    marginTop: 12,
  },
  distributionMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 8,
  },
  distributionLabel: {
    color: colors.text,
    fontWeight: "800",
  },
  distributionValue: {
    color: colors.text,
    fontWeight: "900",
  },
  track: {
    height: 12,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  fill: {
    height: "100%",
  },
});
