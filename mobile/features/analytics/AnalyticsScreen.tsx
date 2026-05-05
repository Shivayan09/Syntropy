import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import type { Attempt } from "@/types/api";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not recorded";
const getQuestionTotal = (attempt: Attempt) => attempt.test?.totalQuestions || attempt.test?.questions?.length || 0;
const getAccuracy = (attempt: Attempt) => typeof attempt.accuracy === "number" ? clampPercent(attempt.accuracy) : 0;

export function AnalyticsScreen() {
  const { token } = useAuth();
  const [attempts, setAttempts] = useState<Attempt[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      const response = await api.getAttempts(token);
      setAttempts(response.attempts || []);
    };
    void load();
  }, [token]);

  const analytics = useMemo(() => {
    const totalQuestions = attempts.reduce((sum, attempt) => sum + getQuestionTotal(attempt), 0);
    const totalCorrect = attempts.reduce((sum, attempt) => sum + (attempt.correct || 0), 0);
    const totalWrong = attempts.reduce((sum, attempt) => sum + (attempt.wrong || 0), 0);
    const totalSkipped = attempts.reduce((sum, attempt) => sum + (attempt.skipped || 0), 0);
    const averageAccuracy = attempts.length ? clampPercent(attempts.reduce((sum, attempt) => sum + getAccuracy(attempt), 0) / attempts.length) : 0;
    const trend = attempts.slice(0, 5).reverse();

    const subjectMap = new Map<string, { total: number; count: number }>();
    attempts.forEach((attempt) => {
      const subject = attempt.test?.subjects?.[0] || "Mixed practice";
      const current = subjectMap.get(subject) || { total: 0, count: 0 };
      subjectMap.set(subject, { total: current.total + getAccuracy(attempt), count: current.count + 1 });
    });

    const subjects = Array.from(subjectMap.entries()).map(([name, value]) => ({
      name,
      accuracy: clampPercent(value.total / value.count),
      attempts: value.count,
    })).sort((a, b) => a.accuracy - b.accuracy);

    return {
      averageAccuracy,
      totalQuestions,
      totalCorrect,
      totalWrong,
      totalSkipped,
      trend,
      strongest: subjects[subjects.length - 1],
      weakest: subjects[0],
    };
  }, [attempts]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ANALYTICS</Text>
        <Text style={styles.title}>How your attempts are moving</Text>
      </View>

      <Card highlight>
        <Text style={styles.label}>Current standing</Text>
        <Text style={styles.bigValue}>{analytics.averageAccuracy}%</Text>
        <Text style={styles.copy}>Average accuracy across completed attempts.</Text>
      </Card>

      <View style={styles.grid}>
        <SummaryCard label="Questions reviewed" value={`${analytics.totalQuestions}`} />
        <SummaryCard label="Correct" value={`${analytics.totalCorrect}`} />
        <SummaryCard label="Wrong" value={`${analytics.totalWrong}`} />
        <SummaryCard label="Skipped" value={`${analytics.totalSkipped}`} />
      </View>

      <Card>
        <Text style={styles.label}>Study direction</Text>
        <Text style={styles.sectionTitle}>Focus next</Text>
        <View style={styles.focusList}>
          <FocusRow label="Protect your strength" value={analytics.strongest?.name || "Not enough data"} note={analytics.strongest ? `${analytics.strongest.accuracy}% accuracy` : "Complete more attempts to identify it."} />
          <FocusRow label="Main focus" value={analytics.weakest?.name || "Not enough data"} note={analytics.weakest ? `${analytics.weakest.accuracy}% accuracy` : "Weak areas will appear after more attempts."} />
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Recent trend</Text>
        <Text style={styles.sectionTitle}>Last completed attempts</Text>
        <View style={styles.trendList}>
          {analytics.trend.length === 0 ? (
            <Text style={styles.copy}>Analytics will appear after your first completed mock test.</Text>
          ) : (
            analytics.trend.map((attempt) => (
              <View key={attempt._id} style={styles.trendRow}>
                <View style={styles.trendMeta}>
                  <Text style={styles.trendTitle}>{attempt.test?.title || "Mock Test"}</Text>
                  <Text style={styles.trendDate}>{formatDate(attempt.completedAt || attempt.createdAt)}</Text>
                </View>
                <Text style={styles.trendScore}>{getAccuracy(attempt)}%</Text>
              </View>
            ))
          )}
        </View>
      </Card>
    </Screen>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </Card>
  );
}

function FocusRow({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <View style={styles.focusRow}>
      <Text style={styles.focusLabel}>{label}</Text>
      <Text style={styles.focusValue}>{value}</Text>
      <Text style={styles.copy}>{note}</Text>
    </View>
  );
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
    lineHeight: 34,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginTop: 4,
    marginBottom: 14,
  },
  label: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 13,
  },
  bigValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 54,
    marginTop: 10,
  },
  summaryValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 32,
    marginTop: 12,
  },
  grid: {
    gap: 16,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
  },
  focusList: {
    gap: 14,
  },
  focusRow: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  focusLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 13,
  },
  focusValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginTop: 6,
    marginBottom: 4,
  },
  trendList: {
    gap: 12,
  },
  trendRow: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 16,
  },
  trendMeta: {
    flex: 1,
  },
  trendTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 15,
  },
  trendDate: {
    color: colors.muted,
    marginTop: 4,
  },
  trendScore: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
  },
});
