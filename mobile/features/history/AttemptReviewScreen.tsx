import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { formatDateTime, formatDurationMinutes, normalizeAnswerEntry, optionLabels, questionState } from "@/lib/exam";
import { useAuth } from "@/providers/AuthProvider";
import { colors } from "@/theme/tokens";
import type { Attempt } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

export function AttemptReviewScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const load = async () => {
      if (!token || !params.id) return;
      const response = await api.getAttempt(token, params.id);
      setAttempt(response.attempt);
    };
    void load();
  }, [token, params.id]);

  const questions = useMemo(() => attempt?.test?.questions || [], [attempt]);
  const answers = useMemo(() => (attempt?.answers || []).map((entry) => normalizeAnswerEntry(entry as never)), [attempt]);
  const isMcq =
    attempt?.test?.testFormat === "mcq" || questions.some((question) => Array.isArray(question.options) && question.options.length > 0);
  const currentQuestion = questions[active];
  const currentAnswer = answers[active];

  if (!attempt || !currentQuestion) {
    return (
      <Screen>
        <Card>
          <Text style={styles.title}>Review unavailable</Text>
          <Text style={styles.copy}>This attempt could not be loaded or has no questions.</Text>
          <View style={{ height: 16 }} />
          <Button label="Back to history" onPress={() => router.replace("/(app)/history")} variant="secondary" />
        </Card>
      </Screen>
    );
  }

  const currentState = questionState(currentQuestion, currentAnswer, isMcq);
  const answeredCount = questions.filter((question, index) => questionState(question, answers[index], isMcq) !== "skipped").length;
  const correctCount = isMcq ? attempt.correct ?? questions.filter((question, index) => questionState(question, answers[index], true) === "correct").length : answeredCount;
  const wrongCount = isMcq ? attempt.wrong ?? questions.filter((question, index) => questionState(question, answers[index], true) === "wrong").length : Math.max(0, questions.length - answeredCount);
  const skippedCount = attempt.skipped ?? questions.filter((question, index) => questionState(question, answers[index], isMcq) === "skipped").length;
  const obtainedMarks = attempt.obtainedMarks ?? answers.reduce((sum, entry) => sum + (entry?.marksAwarded || 0), 0);
  const totalMarks = attempt.totalMarks ?? attempt.test?.totalMarks ?? questions.reduce((sum, question) => sum + (question.marks || 0), 0);
  const selectedOption = typeof currentAnswer?.answer === "number" ? currentAnswer.answer : null;

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>ANSWER REVIEW</Text>
        <Text style={styles.title}>{attempt.test?.title || "Mock Test"}</Text>
        <Text style={styles.copy}>Attempted on {formatDateTime(attempt.completedAt || attempt.createdAt)}</Text>
        <Text style={styles.copy}>Time taken {formatDurationMinutes(attempt.startedAt, attempt.completedAt, attempt.duration)}</Text>
      </View>

      <View style={styles.statsGrid}>
        <Card>
          <Text style={styles.statLabel}>Score</Text>
          <Text style={styles.statValue}>{isMcq ? attempt.score ?? correctCount : obtainedMarks}</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>Accuracy</Text>
          <Text style={styles.statValue}>{Math.round(attempt.accuracy || 0)}%</Text>
        </Card>
        <Card>
          <Text style={styles.statLabel}>Questions</Text>
          <Text style={styles.statValue}>{questions.length}</Text>
        </Card>
      </View>

      <Card>
        <View style={styles.questionHeader}>
          <Text style={styles.sectionTitle}>Question {active + 1}</Text>
          <View style={[styles.badge, currentState === "correct" || currentState === "answered" ? styles.badgePrimary : currentState === "wrong" ? styles.badgeDanger : null]}>
            <Text style={[styles.badgeText, currentState === "correct" || currentState === "answered" || currentState === "wrong" ? styles.badgeTextActive : null]}>
              {currentState}
            </Text>
          </View>
        </View>
        <Text style={styles.prompt}>{currentQuestion.question}</Text>
      </Card>

      {isMcq ? (
        <View style={styles.optionList}>
          {currentQuestion.options?.map((option, index) => {
            const isSelected = selectedOption === index;
            const isCorrect = currentQuestion.correctAnswer === index;
            const isWrongSelection = isSelected && !isCorrect;

            return (
              <Card key={`${option}-${index}`} highlight={isCorrect}>
                <Text style={styles.optionTitle}>
                  {optionLabels[index]} - {option}
                </Text>
                <Text style={styles.copy}>{isCorrect ? "Correct answer" : isWrongSelection ? "Your answer" : "Option"}</Text>
              </Card>
            );
          })}
        </View>
      ) : (
        <>
          <Card>
            <Text style={styles.sectionTitle}>Your answer</Text>
            <Text style={styles.copy}>
              {typeof currentAnswer?.answer === "string" && currentAnswer.answer.trim() ? currentAnswer.answer : "No answer submitted."}
            </Text>
          </Card>
          <Card>
            <Text style={styles.sectionTitle}>Feedback</Text>
            <Text style={styles.copy}>Marks awarded: {currentAnswer?.marksAwarded || 0}/{currentQuestion.marks || 0}</Text>
            <Text style={styles.copy}>{currentAnswer?.feedback || "No feedback available."}</Text>
          </Card>
        </>
      )}

      <Card>
        <Text style={styles.sectionTitle}>Outcome</Text>
        <View style={styles.metricsRow}>
          <Metric label={isMcq ? "Correct" : "Answered"} value={String(isMcq ? correctCount : answeredCount)} />
          <Metric label={isMcq ? "Wrong" : "Marks"} value={String(isMcq ? wrongCount : obtainedMarks)} />
          <Metric label="Skipped" value={String(skippedCount)} />
        </View>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Question map</Text>
        <View style={styles.palette}>
          {questions.map((question, index) => {
            const state = questionState(question, answers[index], isMcq);
            const activeItem = active === index;

            return (
              <Pressable
                key={`review-${index}`}
                onPress={() => setActive(index)}
                style={[
                  styles.paletteItem,
                  activeItem ? styles.paletteActive : null,
                  !activeItem && (state === "correct" || state === "answered") ? styles.paletteDone : null,
                  !activeItem && state === "wrong" ? styles.paletteWrong : null,
                ]}
              >
                <Text style={[styles.paletteText, activeItem ? styles.paletteTextActive : null]}>{index + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      </Card>
    </Screen>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
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
    fontSize: 28,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
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
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginTop: 8,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
  },
  questionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  badge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgePrimary: {
    backgroundColor: colors.primary,
  },
  badgeDanger: {
    backgroundColor: colors.danger,
  },
  badgeText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
  },
  badgeTextActive: {
    color: colors.white,
  },
  prompt: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 20,
    lineHeight: 28,
  },
  optionList: {
    gap: 12,
  },
  optionTitle: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
  metricsRow: {
    flexDirection: "row",
    gap: 12,
  },
  metricCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 14,
  },
  palette: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  paletteItem: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  paletteActive: {
    backgroundColor: colors.text,
  },
  paletteDone: {
    backgroundColor: colors.primary,
  },
  paletteWrong: {
    backgroundColor: colors.danger,
  },
  paletteText: {
    color: colors.text,
    fontWeight: "900",
  },
  paletteTextActive: {
    color: colors.white,
  },
});
