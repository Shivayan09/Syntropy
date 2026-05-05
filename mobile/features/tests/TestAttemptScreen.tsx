import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { api } from "@/lib/api";
import { formatClock } from "@/lib/exam";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { Attempt } from "@/types/api";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";

export function TestAttemptScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const [attempt, setAttempt] = useState<Attempt | null>(null);
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<Array<number | string | undefined>>([]);
  const [markedForReview, setMarkedForReview] = useState<boolean[]>([]);
  const [timeLeft, setTimeLeft] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const questions = useMemo(() => attempt?.test?.questions || [], [attempt]);
  const currentQuestion = questions[current];
  const isMcq = attempt?.test?.testFormat === "mcq";
  const answeredCount = answers.filter((item) => item !== undefined && item !== "").length;
  const unansweredCount = Math.max(0, questions.length - answeredCount);
  const reviewCount = markedForReview.filter(Boolean).length;
  const progress = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;
  const timeWarning = timeLeft > 0 && timeLeft <= 300;

  const submit = useCallback(async () => {
    if (!token || !attempt?._id || submitting) return;
    try {
      setSubmitting(true);
      const response = await api.submitAttempt(token, attempt._id, answers.map((item) => item ?? null));
      showSuccess("Attempt submitted", "Your score report is ready.");
      router.replace(`/(app)/test/result/${response.attemptId}`);
    } catch (error) {
      showError("Unable to submit", getErrorMessage(error, "Submit failed"));
    } finally {
      setSubmitting(false);
    }
  }, [answers, attempt?._id, router, showError, showSuccess, submitting, token]);

  useEffect(() => {
    const load = async () => {
      if (!token || !params.id) return;
      try {
        const response = await api.getAttempt(token, params.id);
        if (response.attempt.status !== "in_progress") {
          router.replace(`/(app)/test/result/${response.attempt._id}`);
          return;
        }
        const nextQuestions = response.attempt.test?.questions || [];
        setAttempt(response.attempt);
        setAnswers(Array(nextQuestions.length).fill(undefined));
        setMarkedForReview(Array(nextQuestions.length).fill(false));
      } catch (error) {
        showError("Could not load attempt", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [params.id, router, showError, token]);

  useEffect(() => {
    if (!attempt) return;

    const start = new Date(attempt.startedAt || "").getTime();
    const duration = (attempt.duration || 0) * 60 * 1000;

    const tick = () => {
      const remaining = start + duration - Date.now();
      if (remaining <= 0) {
        setTimeLeft(0);
        void submit();
        return;
      }
      setTimeLeft(Math.floor(remaining / 1000));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [attempt, submit]);

  useEffect(() => {
    if (!token || !attempt?._id || submitting) return;

    const heartbeat = () => {
      void api.heartbeatAttempt(token, attempt._id).catch(() => {
        // Do not interrupt the user for transient activity sync failures.
      });
    };

    heartbeat();
    const interval = setInterval(heartbeat, 60000);
    return () => clearInterval(interval);
  }, [attempt?._id, submitting, token]);

  const updateCurrentAnswer = (value: number | string | undefined) => {
    setAnswers((prev) => prev.map((item, index) => (index === current ? value : item)));
  };

  const confirmSubmit = () => {
    if (submitting) return;

    const title = unansweredCount > 0 ? "Submit with unanswered questions?" : reviewCount > 0 ? "Submit with questions marked for review?" : "Submit test?";
    const message =
      unansweredCount > 0
        ? "Some questions are still unanswered. Once submitted, your responses cannot be changed."
        : reviewCount > 0
          ? "You still have questions marked for review. Confirm only if you are done reviewing them."
          : "All questions are answered and none are marked for review.";

    Alert.alert(title, message, [
      { text: "Cancel", style: "cancel" },
      { text: "Confirm", onPress: () => void submit() },
    ]);
  };

  if (!attempt || !currentQuestion) {
    return (
      <View style={styles.loadingWrap}>
        <Card>
          <Text style={styles.title}>Loading attempt...</Text>
          <Text style={styles.copy}>Preparing the active test session.</Text>
        </Card>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerCopy}>
          <Text style={styles.eyebrow}>LIVE ATTEMPT</Text>
          <Text style={styles.headerTitle}>{attempt.test?.title || "Mock Test"}</Text>
          <Text style={styles.headerMeta}>
            Question {current + 1} of {questions.length}
          </Text>
        </View>
        <View style={[styles.timerBox, timeWarning ? styles.timerWarning : null]}>
          <Text style={[styles.timerLabel, timeWarning ? styles.timerLabelActive : null]}>Time left</Text>
          <Text style={[styles.timerValue, timeWarning ? styles.timerValueActive : null]}>{formatClock(timeLeft)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {timeWarning ? (
          <View style={styles.warningCard}>
            <Text style={styles.warningTitle}>Less than five minutes remain.</Text>
            <Text style={styles.warningCopy}>Confirm pending answers and submit before the timer expires.</Text>
          </View>
        ) : null}

        <Card>
          <Text style={styles.progressText}>
            {answeredCount}/{questions.length} answered - {reviewCount} marked for review
          </Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
          <View style={{ height: 16 }} />
          <View style={styles.questionMetaRow}>
            <View style={styles.questionBadge}>
              <Text style={styles.questionBadgeText}>{isMcq ? "Single correct option" : "Written response"}</Text>
            </View>
            {!isMcq ? (
              <View style={styles.questionBadge}>
                <Text style={styles.questionBadgeText}>{currentQuestion.marks || 0} marks</Text>
              </View>
            ) : null}
            {markedForReview[current] ? (
              <View style={[styles.questionBadge, styles.questionBadgePrimary]}>
                <Text style={[styles.questionBadgeText, styles.questionBadgeTextActive]}>Marked for review</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.questionTitle}>{currentQuestion.question}</Text>
        </Card>

        {isMcq ? (
          <View style={styles.optionsList}>
            {currentQuestion.options?.map((option, index) => {
              const selected = answers[current] === index;
              return (
                <Pressable key={`${option}-${index}`} onPress={() => updateCurrentAnswer(index)} style={[styles.optionCard, selected ? styles.optionActive : null]}>
                  <View style={[styles.optionIndex, selected ? styles.optionIndexActive : null]}>
                    <Text style={[styles.optionIndexText, selected ? styles.optionIndexTextActive : null]}>{index + 1}</Text>
                  </View>
                  <Text style={[styles.optionText, selected ? styles.optionTextActive : null]}>{option}</Text>
                </Pressable>
              );
            })}
          </View>
        ) : (
          <TextInput
            value={(answers[current] as string) || ""}
            onChangeText={(value) => updateCurrentAnswer(value)}
            placeholder="Write your answer..."
            placeholderTextColor={colors.muted}
            multiline
            textAlignVertical="top"
            style={styles.subjectiveInput}
          />
        )}

        <Card>
          <View style={styles.metricsRow}>
            <Metric label="Done" value={String(answeredCount)} />
            <Metric label="Left" value={String(unansweredCount)} />
            <Metric label="Review" value={String(reviewCount)} />
          </View>

          <View style={{ height: 16 }} />
          <View style={styles.actionGrid}>
            <Button
              label={markedForReview[current] ? "Reviewed" : "Mark review"}
              onPress={() => setMarkedForReview((prev) => prev.map((item, index) => (index === current ? !item : item)))}
              variant="secondary"
            />
            <Button label="Clear" onPress={() => updateCurrentAnswer(undefined)} variant="secondary" />
          </View>

          <View style={{ height: 12 }} />
          <View style={styles.actionGrid}>
            <Button label="Previous" onPress={() => setCurrent((prev) => Math.max(0, prev - 1))} variant="secondary" disabled={current === 0} />
            {current === questions.length - 1 ? (
              <Button label={submitting ? "Submitting..." : "Submit test"} onPress={confirmSubmit} disabled={submitting} />
            ) : (
              <Button label="Save & next" onPress={() => setCurrent((prev) => Math.min(questions.length - 1, prev + 1))} />
            )}
          </View>
        </Card>

        <Card>
          <Text style={styles.sectionTitle}>Palette</Text>
          <View style={styles.palette}>
            {questions.map((_, index) => {
              const answered = answers[index] !== undefined && answers[index] !== "";
              const reviewed = markedForReview[index];
              const active = current === index;

              return (
                <Pressable
                  key={`palette-${index}`}
                  onPress={() => setCurrent(index)}
                  style={[
                    styles.paletteItem,
                    active ? styles.paletteActive : null,
                    !active && answered ? styles.paletteAnswered : null,
                    !active && !answered && reviewed ? styles.paletteReview : null,
                  ]}
                >
                  <Text style={[styles.paletteText, active ? styles.paletteTextActive : null]}>{index + 1}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>
      </ScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricCard}>
      <Text style={styles.metricLabel}>{label}</Text>
      <Text style={styles.metricValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bgSecondary,
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 56,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 16,
  },
  headerCopy: {
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 11,
  },
  headerTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 6,
  },
  headerMeta: {
    color: colors.muted,
    fontWeight: "700",
    marginTop: 6,
  },
  timerBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 10,
    minWidth: 104,
  },
  timerWarning: {
    backgroundColor: colors.primary,
  },
  timerLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 11,
  },
  timerLabelActive: {
    color: colors.white,
  },
  timerValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginTop: 4,
  },
  timerValueActive: {
    color: colors.white,
  },
  scrollContent: {
    padding: 16,
    gap: 16,
    paddingBottom: 48,
  },
  warningCard: {
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.surface,
    padding: 16,
  },
  warningTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 16,
  },
  warningCopy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 6,
  },
  progressText: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  progressTrack: {
    height: 8,
    backgroundColor: colors.bg,
    marginTop: 12,
  },
  progressFill: {
    height: "100%",
    backgroundColor: colors.primary,
  },
  questionMetaRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  questionBadge: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  questionBadgePrimary: {
    backgroundColor: colors.primary,
  },
  questionBadgeText: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 11,
    textTransform: "uppercase",
  },
  questionBadgeTextActive: {
    color: colors.white,
  },
  questionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    lineHeight: 32,
    marginTop: 16,
  },
  optionsList: {
    gap: 12,
  },
  optionCard: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 14,
  },
  optionActive: {
    backgroundColor: colors.primary,
  },
  optionIndex: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    alignItems: "center",
    justifyContent: "center",
  },
  optionIndexActive: {
    backgroundColor: colors.white,
  },
  optionIndexText: {
    color: colors.text,
    fontWeight: "900",
  },
  optionIndexTextActive: {
    color: colors.text,
  },
  optionText: {
    color: colors.text,
    fontWeight: "700",
    lineHeight: 22,
    flex: 1,
  },
  optionTextActive: {
    color: colors.white,
  },
  subjectiveInput: {
    minHeight: 220,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    color: colors.text,
    padding: 16,
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
  metricLabel: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
  },
  metricValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
    marginTop: 8,
  },
  actionGrid: {
    flexDirection: "row",
    gap: 12,
  },
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
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
  paletteAnswered: {
    backgroundColor: colors.primary,
  },
  paletteReview: {
    borderColor: colors.primary,
  },
  paletteText: {
    color: colors.text,
    fontWeight: "900",
  },
  paletteTextActive: {
    color: colors.white,
  },
  loadingWrap: {
    flex: 1,
    backgroundColor: colors.bg,
    justifyContent: "center",
    padding: 16,
  },
  title: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 24,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
});
