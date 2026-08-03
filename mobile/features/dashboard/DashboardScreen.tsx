import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { AiTokenStatus, Attempt } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";

const clampPercent = (value: number) => Math.max(0, Math.min(100, Math.round(value)));
const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : "Not attempted";
const normalizeSubject = (value?: string) => value?.trim() || "Mixed practice";

export function DashboardScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [tokenStatus, setTokenStatus] = useState<AiTokenStatus | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = async () => {
    if (!token) return;
    const [attemptResponse, tokenResponse] = await Promise.all([
      api.getAttempts(token),
      api.getAiTokenStatus(token),
    ]);
    setAttempts(attemptResponse.attempts || []);
    setTokenStatus(tokenResponse.aiTokenStatus || null);
  };

  useEffect(() => {
    const run = async () => {
      try {
        await load();
      } catch (error) {
        showError("Could not load dashboard", getErrorMessage(error, "Load failed"));
      }
    };
    void run();
  }, [showError, token]);

  const onRefresh = async () => {
    try {
      setRefreshing(true);
      await load();
      showSuccess("Refreshed", "Dashboard data is up to date.");
    } catch (error) {
      showError("Refresh failed", getErrorMessage(error, "Unable to refresh"));
    } finally {
      setRefreshing(false);
    }
  };

  const firstAttempts = useMemo(() => attempts.filter((attempt) => attempt.isFirstAttempt), [attempts]);
  const uniqueAttempts = firstAttempts.length > 0 ? firstAttempts : attempts;
  const bestAttempt = attempts.reduce<Attempt | undefined>((best, current) => {
    if (!best) return current;
    return (current.score || 0) > (best.score || 0) ? current : best;
  }, undefined);

  const averageScore = uniqueAttempts.length
    ? clampPercent(uniqueAttempts.reduce((total, item) => total + (item.score || 0), 0) / uniqueAttempts.length)
    : 0;
  const averageAccuracy = uniqueAttempts.length
    ? clampPercent(uniqueAttempts.reduce((total, item) => total + (item.accuracy || 0), 0) / uniqueAttempts.length)
    : 0;
  const readiness = attempts.length ? clampPercent(averageScore * 0.65 + averageAccuracy * 0.35) : 0;

  const subjectStats = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    attempts.forEach((attempt) => {
      const subject = normalizeSubject(attempt.test?.subjects?.[0]);
      const current = map.get(subject) || { total: 0, count: 0 };
      map.set(subject, { total: current.total + (attempt.accuracy || 0), count: current.count + 1 });
    });
    return Array.from(map.entries()).map(([name, stat]) => ({
      name,
      attempts: stat.count,
      average: clampPercent(stat.total / stat.count),
    })).sort((a, b) => b.average - a.average);
  }, [attempts]);

  return (
    <Screen>
      <View style={styles.hero}>
        <h1>Welcome back {user?.username || user?.name}</h1>
        <Text style={styles.copy}>Let&apos;s continue your exam preparation.</Text>
      </View>

      <Card>
        <Text style={styles.tokenLabel}>AI Test Credits</Text>
        <Text style={styles.tokenValue}>{tokenStatus?.remaining ?? 0} left this month</Text>
        <View style={styles.refreshButtonWrap}>
          <Button label={refreshing ? "Refreshing..." : "Refresh data"} onPress={onRefresh} variant="secondary" disabled={refreshing} />
        </View>
      </Card>

      <View style={styles.statsGrid}>
        <StatCard label="Tests taken" value={`${uniqueAttempts.length || "--"}`} note={attempts.length ? `${attempts.length} total attempts` : "Awaiting first run"} />
        <StatCard label="Average score" value={attempts.length ? `${averageScore}` : "--"} note="First attempts counted" />
        <StatCard label="Accuracy" value={attempts.length ? `${averageAccuracy}%` : "--"} note="Across completed tests" />
        <StatCard label="Best score" value={bestAttempt ? `${clampPercent(bestAttempt.score || 0)}` : "--"} note={bestAttempt?.test?.title || "No top score yet"} />
      </View>

      <Card highlight>
        <Text style={styles.sectionLabel}>Exam readiness</Text>
        <Text style={styles.readinessValue}>{readiness}%</Text>
        <Text style={styles.copy}>
          {readiness >= 80 ? "Exam-ready" : readiness >= 60 ? "Building well" : attempts.length ? "Needs reps" : "Start baseline"}
        </Text>
        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${readiness}%` }]} />
        </View>
        <Button label="Generate AI test" onPress={() => router.push("/(app)/create")} />
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Subject map</Text>
        <Text style={styles.sectionTitle}>Accuracy by practice zone</Text>
        {subjectStats.length === 0 ? (
          <Text style={styles.copy}>Your first completed attempt will unlock subject analytics.</Text>
        ) : (
          <View style={styles.subjectList}>
            {subjectStats.slice(0, 4).map((subject) => (
              <View key={subject.name} style={styles.subjectRow}>
                <View style={styles.subjectHeader}>
                  <Text style={styles.subjectName}>{subject.name}</Text>
                  <Text style={styles.subjectScore}>{subject.average}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${subject.average}%` }]} />
                </View>
                <Text style={styles.subjectAttempts}>{subject.attempts} attempts</Text>
              </View>
            ))}
          </View>
        )}
      </Card>

      <Card>
        <Text style={styles.sectionLabel}>Recent attempts</Text>
        <Text style={styles.sectionTitle}>Test history that still teaches</Text>
        {attempts.length === 0 ? (
          <Text style={styles.copy}>Attempt a manual mock or generate one with AI to start seeing trends here.</Text>
        ) : (
          <View style={styles.historyList}>
            {attempts.slice(0, 4).map((attempt) => (
              <View key={attempt._id} style={styles.historyItem}>
                <Text style={styles.historyTitle}>{attempt.test?.title || "AI Test"}</Text>
                <Text style={styles.historyMeta}>{formatDate(attempt.createdAt)} · {normalizeSubject(attempt.test?.subjects?.[0])}</Text>
                <Text style={styles.historyScore}>{clampPercent(attempt.accuracy || 0)}% accuracy</Text>
              </View>
            ))}
          </View>
        )}
      </Card>
    </Screen>
  );
}

function StatCard({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <Card>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </Card>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: 6,
  },
  title: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
  },
  copy: {
    fontSize: 15,
    lineHeight: 22,
    color: colors.muted,
  },
  tokenLabel: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 14,
  },
  tokenValue: {
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
    color: colors.text,
    marginTop: 8,
  },
  refreshButtonWrap: {
    marginTop: 16,
  },
  statsGrid: {
    gap: 16,
  },
  statLabel: {
    fontWeight: "800",
    color: colors.muted,
    fontSize: 13,
  },
  statValue: {
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    color: colors.text,
    marginTop: 12,
  },
  statNote: {
    color: colors.muted,
    marginTop: 6,
  },
  sectionLabel: {
    fontSize: 13,
    color: colors.muted,
    fontWeight: "800",
  },
  sectionTitle: {
    fontSize: 26,
    lineHeight: 30,
    color: colors.text,
    fontWeight: "900",
    marginTop: 4,
    marginBottom: 14,
  },
  readinessValue: {
    fontSize: 54,
    lineHeight: 58,
    color: colors.text,
    fontWeight: "900",
    marginTop: 8,
  },
  progressTrack: {
    height: 14,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    borderRadius: 999,
    overflow: "hidden",
    marginTop: 14,
    marginBottom: 16,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  subjectList: {
    gap: 14,
  },
  subjectRow: {
    gap: 4,
  },
  subjectHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  subjectName: {
    color: colors.text,
    fontWeight: "800",
  },
  subjectScore: {
    color: colors.text,
    fontWeight: "900",
  },
  subjectAttempts: {
    color: colors.muted,
    fontSize: 12,
  },
  historyList: {
    gap: 12,
  },
  historyItem: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  historyTitle: {
    fontWeight: "900",
    color: colors.text,
    fontSize: 16,
  },
  historyMeta: {
    color: colors.muted,
    marginTop: 4,
  },
  historyScore: {
    color: colors.text,
    fontWeight: "800",
    marginTop: 10,
  },
});
