import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { AiTokenStatus, Difficulty, TestFormat } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

export function GenerateAiScreen() {
  const router = useRouter();
  const { token, user } = useAuth();
  const { showError, showSuccess } = useToast();
  const [testFormat, setTestFormat] = useState<TestFormat>("mcq");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<Difficulty>(user?.preferences?.difficulty || "Medium");
  const [questions, setQuestions] = useState(String(user?.preferences?.questionsPerTest || 20));
  const [totalMarks, setTotalMarks] = useState("100");
  const [time, setTime] = useState("30");
  const [topicFocus, setTopicFocus] = useState("");
  const [tokenStatus, setTokenStatus] = useState<AiTokenStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const [syllabusResponse, tokenResponse] = await Promise.all([api.getSyllabus(token), api.getAiTokenStatus(token)]);
        setSyllabusSubjects(syllabusResponse.syllabus?.[0]?.subjects?.map((subject) => subject.name) || []);
        setTokenStatus(tokenResponse.aiTokenStatus);
      } catch (error) {
        showError("Could not load generator", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [showError, token]);

  const addSubject = (value?: string) => {
    const next = (value ?? subjectInput).trim();
    if (!next || subjects.includes(next)) return;
    setSubjects((prev) => [...prev, next]);
    setSubjectInput("");
  };

  const generate = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const response = await api.generateAiTest(token, {
        subjects,
        difficulty,
        time: Number(time),
        topicFocus,
        college: user?.college,
        semester: user?.semester,
        testFormat,
        questions: testFormat === "mcq" ? Number(questions) : undefined,
        totalMarks: testFormat === "subjective" ? Number(totalMarks) : undefined,
        mixedSubjects: true,
      });
      if (response.aiTokenStatus) {
        setTokenStatus(response.aiTokenStatus);
      }
      showSuccess("Test generated", "Your AI practice set is ready.");
      router.replace(`/(app)/test/preview/${response.testId}`);
    } catch (error) {
      showError("Unable to generate test", getErrorMessage(error, "Generation failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>AI GENERATOR</Text>
        <Text style={styles.title}>Generate a focused practice test</Text>
      </View>

      <Card highlight>
        <Text style={styles.tokenLabel}>AI credits</Text>
        <Text style={styles.tokenValue}>{tokenStatus?.remaining ?? 0} available</Text>
        <Text style={styles.copy}>If you run out, users can buy a plan on the website and continue using the same account here.</Text>
      </Card>

      <View style={styles.row}>
        <Pressable onPress={() => setTestFormat("mcq")} style={[styles.formatCard, testFormat === "mcq" ? styles.active : null]}>
          <Text style={[styles.formatTitle, testFormat === "mcq" ? styles.activeText : null]}>MCQ</Text>
        </Pressable>
        <Pressable onPress={() => setTestFormat("subjective")} style={[styles.formatCard, testFormat === "subjective" ? styles.active : null]}>
          <Text style={[styles.formatTitle, testFormat === "subjective" ? styles.activeText : null]}>Subjective</Text>
        </Pressable>
      </View>

      <Card>
        <Text style={styles.label}>Subjects</Text>
        <View style={styles.chips}>
          {subjects.map((subject) => (
            <Pressable key={subject} onPress={() => setSubjects((prev) => prev.filter((item) => item !== subject))} style={styles.chip}>
              <Text style={styles.chipText}>{subject} x</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.inlineRow}>
          <TextInput value={subjectInput} onChangeText={setSubjectInput} placeholder="Add subject" placeholderTextColor={colors.muted} style={styles.input} />
          <View style={styles.inlineButton}>
            <Button label="Add" onPress={() => addSubject()} variant="secondary" />
          </View>
        </View>
        <View style={styles.chips}>
          {syllabusSubjects.map((subject) => (
            <Pressable key={subject} onPress={() => addSubject(subject)} style={styles.suggestionChip}>
              <Text style={styles.suggestionText}>{subject}</Text>
            </Pressable>
          ))}
        </View>
      </Card>

      <Card>
        <Text style={styles.label}>Difficulty</Text>
        <Pressable onPress={() => cycleDifficulty(setDifficulty, difficulty)} style={styles.fieldBox}>
          <Text style={styles.fieldValue}>{difficulty}</Text>
        </Pressable>
        <View style={{ height: 16 }} />
        <Text style={styles.label}>{testFormat === "mcq" ? "Questions" : "Total marks"}</Text>
        <TextInput
          value={testFormat === "mcq" ? questions : totalMarks}
          onChangeText={testFormat === "mcq" ? setQuestions : setTotalMarks}
          keyboardType="number-pad"
          style={styles.input}
        />
        <View style={{ height: 16 }} />
        <Text style={styles.label}>Time (minutes)</Text>
        <TextInput value={time} onChangeText={setTime} keyboardType="number-pad" style={styles.input} />
        <View style={{ height: 16 }} />
        <Text style={styles.label}>Topic focus</Text>
        <TextInput value={topicFocus} onChangeText={setTopicFocus} placeholder="Optional" placeholderTextColor={colors.muted} style={styles.input} />
      </Card>

      <Button label={loading ? "Generating..." : "Generate test"} onPress={generate} disabled={loading || subjects.length === 0} />
    </Screen>
  );
}

function cycleDifficulty(setter: (value: Difficulty) => void, current: Difficulty) {
  const values: Difficulty[] = ["Easy", "Medium", "Hard"];
  setter(values[(values.indexOf(current) + 1) % values.length]);
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
  tokenLabel: {
    color: colors.primary,
    fontWeight: "800",
    fontSize: 13,
  },
  tokenValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 34,
    marginTop: 8,
  },
  copy: {
    color: colors.muted,
    lineHeight: 22,
    marginTop: 8,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  formatCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    padding: 16,
    alignItems: "center",
  },
  active: {
    backgroundColor: colors.primary,
  },
  activeText: {
    color: colors.white,
  },
  formatTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
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
  inlineRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  inlineButton: {
    width: 92,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
    marginTop: 12,
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    color: colors.text,
    fontWeight: "700",
  },
  suggestionChip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  suggestionText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
  },
  fieldBox: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  fieldValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
  },
});
