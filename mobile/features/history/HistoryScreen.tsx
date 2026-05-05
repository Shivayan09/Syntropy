import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { formatDate, formatDurationMinutes, normalizeSubject } from "@/lib/exam";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { Attempt } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type SortMode = "latest" | "oldest" | "highest-score" | "highest-accuracy" | "fastest";

function getDurationMinutes(attempt: Attempt) {
  if (!attempt.startedAt || !attempt.completedAt) return null;
  const duration = Math.round((new Date(attempt.completedAt).getTime() - new Date(attempt.startedAt).getTime()) / 60000);
  return Number.isFinite(duration) && duration >= 0 ? duration : null;
}

function getSubject(attempt: Attempt) {
  return normalizeSubject(attempt.test?.subjects?.[0]);
}

export function HistoryScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { showError } = useToast();
  const [attempts, setAttempts] = useState<Attempt[]>([]);
  const [search, setSearch] = useState("");
  const [subject, setSubject] = useState("all");
  const [sort, setSort] = useState<SortMode>("latest");

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await api.getAttempts(token);
        setAttempts(response.attempts || []);
      } catch (error) {
        showError("Could not load history", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [showError, token]);

  const subjects = useMemo(() => Array.from(new Set(attempts.map(getSubject))).sort((a, b) => a.localeCompare(b)), [attempts]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();

    return [...attempts]
      .filter((attempt) => {
        const title = (attempt.test?.title || "Mock Test").toLowerCase();
        const currentSubject = getSubject(attempt).toLowerCase();
        const matchesSearch = title.includes(query) || currentSubject.includes(query);
        const matchesSubject = subject === "all" || currentSubject === subject.toLowerCase();
        return matchesSearch && matchesSubject;
      })
      .sort((a, b) => {
        if (sort === "oldest") {
          return new Date(a.createdAt || "").getTime() - new Date(b.createdAt || "").getTime();
        }
        if (sort === "highest-score") {
          return (b.score || 0) - (a.score || 0);
        }
        if (sort === "highest-accuracy") {
          return (b.accuracy || 0) - (a.accuracy || 0);
        }
        if (sort === "fastest") {
          return (getDurationMinutes(a) ?? Number.MAX_SAFE_INTEGER) - (getDurationMinutes(b) ?? Number.MAX_SAFE_INTEGER);
        }
        return new Date(b.createdAt || "").getTime() - new Date(a.createdAt || "").getTime();
      });
  }, [attempts, search, sort, subject]);

  const completedAttempts = useMemo(() => attempts.filter((attempt) => attempt.completedAt), [attempts]);
  const averageAccuracy =
    completedAttempts.length > 0
      ? Math.round(completedAttempts.reduce((total, attempt) => total + (attempt.accuracy || 0), 0) / completedAttempts.length)
      : 0;
  const bestAttempt = useMemo(
    () => attempts.reduce<Attempt | null>((best, attempt) => (!best || (attempt.score || 0) > (best.score || 0) ? attempt : best), null),
    [attempts],
  );
  const totalMinutes = useMemo(() => attempts.reduce((total, attempt) => total + (getDurationMinutes(attempt) || 0), 0), [attempts]);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ATTEMPT HISTORY</Text>
        <Text style={styles.title}>Review trail</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card>
          <Text style={styles.statLabel}>Completed attempts</Text>
          <Text style={styles.statValue}>{completedAttempts.length}</Text>
          <Text style={styles.statCopy}>{attempts.length} total records</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>Average accuracy</Text>
          <Text style={styles.statValue}>{completedAttempts.length ? `${averageAccuracy}%` : "--"}</Text>
          <Text style={styles.statCopy}>Across completed tests</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>Best score</Text>
          <Text style={styles.statValue}>{bestAttempt ? Math.round(bestAttempt.score || 0).toString() : "--"}</Text>
          <Text style={styles.statCopy}>{bestAttempt?.test?.title || `${totalMinutes} min practiced`}</Text>
        </Card>
      </View>

      <TextInput
        value={search}
        onChangeText={setSearch}
        placeholder="Search by test title or subject"
        placeholderTextColor={colors.muted}
        style={styles.input}
      />

      <View style={styles.row}>
        <Pressable onPress={() => setSubject("all")} style={[styles.filter, subject === "all" ? styles.filterActive : null]}>
          <Text style={[styles.filterText, subject === "all" ? styles.filterTextActive : null]}>All subjects</Text>
        </Pressable>
        {subjects.map((item) => (
          <Pressable key={item} onPress={() => setSubject(item)} style={[styles.filter, subject === item ? styles.filterActive : null]}>
            <Text style={[styles.filterText, subject === item ? styles.filterTextActive : null]}>{item}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.row}>
        {(["latest", "oldest", "highest-score", "highest-accuracy", "fastest"] as SortMode[]).map((item) => (
          <Pressable key={item} onPress={() => setSort(item)} style={[styles.filter, sort === item ? styles.filterActive : null]}>
            <Text style={[styles.filterText, sort === item ? styles.filterTextActive : null]}>{item.replace("-", " ")}</Text>
          </Pressable>
        ))}
      </View>

      {filtered.length === 0 ? (
        <Card>
          <Text style={styles.emptyTitle}>No attempts found</Text>
          <Text style={styles.copy}>
            {attempts.length ? "Try changing the search, subject, or sorting controls." : "Your completed mock tests will appear here with review and retake options."}
          </Text>
          <View style={{ height: 16 }} />
          <Button label="Browse tests" onPress={() => router.push("/(app)/tests")} />
        </Card>
      ) : (
        filtered.map((attempt) => {
          const duration = getDurationMinutes(attempt);
          const completedAt = attempt.completedAt || attempt.createdAt;
          const canRetake = Boolean(attempt.test?._id);

          return (
            <Card key={attempt._id}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{getSubject(attempt)}</Text>
              </View>
              <Text style={styles.itemTitle}>{attempt.test?.title || "Mock Test"}</Text>
              <Text style={styles.copy}>
                Score {Math.round(attempt.score || 0)} - Accuracy {Math.round(attempt.accuracy || 0)}%
              </Text>
              <Text style={styles.copy}>
                {formatDate(completedAt)} - {duration === null ? formatDurationMinutes(attempt.startedAt, attempt.completedAt, attempt.duration) : `${duration} min`}
              </Text>
              <View style={styles.buttonRow}>
                <Button label="Review" onPress={() => router.push(`/(app)/history/review/${attempt._id}`)} variant="secondary" />
                {canRetake ? <Button label="Retake" onPress={() => router.push(`/(app)/test/preview/${attempt.test!._id}`)} /> : null}
              </View>
            </Card>
          );
        })
      )}
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
  statsGrid: {
    gap: 12,
  },
  statLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  statValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 28,
    marginTop: 8,
  },
  statCopy: {
    color: colors.muted,
    marginTop: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    color: colors.text,
    paddingHorizontal: 14,
    paddingVertical: 14,
  },
  row: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  filter: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  filterActive: {
    backgroundColor: colors.primary,
  },
  filterText: {
    color: colors.text,
    fontWeight: "800",
    textTransform: "capitalize",
  },
  filterTextActive: {
    color: colors.white,
  },
  emptyTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  badge: {
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
  },
  itemTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 16,
  },
});
