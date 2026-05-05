import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Screen } from "@/components/ui/Screen";
import { api } from "@/lib/api";
import { getErrorMessage } from "@/lib/feedback";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";
import { colors } from "@/theme/tokens";
import type { Difficulty, TestFormat } from "@/types/api";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

type McqQuestion = {
  question: string;
  options: string[];
  correctIndex: number;
};

type SubjectiveQuestion = {
  question: string;
  marks: number;
  expectedAnswer: string;
  keyPoints: string;
};

const emptyMcq = (): McqQuestion => ({ question: "", options: ["", "", "", ""], correctIndex: 0 });
const emptySubjective = (): SubjectiveQuestion => ({ question: "", marks: 5, expectedAnswer: "", keyPoints: "" });

export function ManualCreateScreen() {
  const router = useRouter();
  const { token } = useAuth();
  const { showError, showSuccess } = useToast();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
  const [duration, setDuration] = useState("30");
  const [testFormat, setTestFormat] = useState<TestFormat>("mcq");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([emptyMcq()]);
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<SubjectiveQuestion[]>([emptySubjective()]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      try {
        const response = await api.getSyllabus(token);
        const suggested = response.syllabus?.[0]?.subjects?.map((subject) => subject.name) || [];
        setSyllabusSubjects(suggested);
      } catch (error) {
        showError("Could not load subjects", getErrorMessage(error, "Load failed"));
      }
    };
    void load();
  }, [showError, token]);

  const subjectiveTotalMarks = useMemo(
    () => subjectiveQuestions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0),
    [subjectiveQuestions],
  );

  const addSubject = (value?: string) => {
    const next = (value ?? subjectInput).trim();
    if (!next || subjects.includes(next)) return;
    setSubjects((prev) => [...prev, next]);
    setSubjectInput("");
  };

  const removeSubject = (subject: string) => setSubjects((prev) => prev.filter((item) => item !== subject));

  const createTest = async () => {
    if (!token) return;

    try {
      setLoading(true);
      const questions =
        testFormat === "mcq"
          ? mcqQuestions.map((question) => ({
              question: question.question,
              options: question.options,
              correctAnswer: question.correctIndex,
            }))
          : subjectiveQuestions.map((question) => ({
              question: question.question,
              marks: Number(question.marks) || 0,
              expectedAnswer: question.expectedAnswer.trim(),
              keyPoints: question.keyPoints.split("\n").map((item) => item.trim()).filter(Boolean),
            }));

      const response = await api.createManualTest(token, {
        title,
        description,
        difficulty,
        duration: Number(duration),
        subjects,
        testFormat,
        questions,
      });
      showSuccess("Test created", "Your manual test is ready.");
      router.replace(`/(app)/test/preview/${response.test._id}`);
    } catch (error) {
      showError("Unable to create test", getErrorMessage(error, "Creation failed"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>MANUAL BUILDER</Text>
        <Text style={styles.title}>Create a structured test</Text>
      </View>

      <FormatPicker active={testFormat} onSelect={setTestFormat} />

      <Card>
        <LabeledInput label="Test name" value={title} onChangeText={setTitle} placeholder="DSA Mock 1" />
        <Spacer />
        <LabeledInput label="Description" value={description} onChangeText={setDescription} placeholder="Instructions or context" multiline />
        <Spacer />
        <View style={styles.row}>
          <FieldBox label="Difficulty" value={difficulty} onPress={() => cycleDifficulty(setDifficulty, difficulty)} />
          <FieldBox label="Duration" value={`${duration} min`} onPress={() => cycleDuration(setDuration, duration)} />
        </View>
        <Spacer />
        <Text style={styles.label}>Subjects</Text>
        <View style={styles.chips}>
          {subjects.map((subject) => (
            <Pressable key={subject} onPress={() => removeSubject(subject)} style={styles.chip}>
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
        {syllabusSubjects.length > 0 ? (
          <View style={styles.chips}>
            {syllabusSubjects.map((subject) => (
              <Pressable key={subject} onPress={() => addSubject(subject)} style={styles.suggestionChip}>
                <Text style={styles.suggestionText}>{subject}</Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </Card>

      {testFormat === "mcq" ? (
        mcqQuestions.map((question, index) => (
          <Card key={`mcq-${index}`}>
            <Text style={styles.sectionTitle}>Question {index + 1}</Text>
            <LabeledInput
              label="Prompt"
              value={question.question}
              onChangeText={(value) =>
                setMcqQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, question: value } : item)))
              }
              placeholder="Enter question"
              multiline
            />
            <Spacer />
            <View style={styles.optionsList}>
              {question.options.map((option, optionIndex) => (
                <View key={`${index}-${optionIndex}`} style={styles.optionRow}>
                  <Pressable
                    onPress={() => setMcqQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, correctIndex: optionIndex } : item)))}
                    style={[styles.correctMarker, question.correctIndex === optionIndex ? styles.correctMarkerActive : null]}
                  >
                    <Text style={styles.correctMarkerText}>{optionIndex + 1}</Text>
                  </Pressable>
                  <TextInput
                    value={option}
                    onChangeText={(value) =>
                      setMcqQuestions((prev) =>
                        prev.map((item, i) =>
                          i === index
                            ? { ...item, options: item.options.map((entry, j) => (j === optionIndex ? value : entry)) }
                            : item,
                        ),
                      )
                    }
                    placeholder={`Option ${optionIndex + 1}`}
                    placeholderTextColor={colors.muted}
                    style={[styles.input, styles.optionInput]}
                  />
                </View>
              ))}
            </View>
            <Spacer />
            <Button
              label={mcqQuestions.length === 1 ? "Keep question" : "Remove question"}
              onPress={() => setMcqQuestions((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))}
              variant="secondary"
            />
          </Card>
        ))
      ) : (
        subjectiveQuestions.map((question, index) => (
          <Card key={`subjective-${index}`}>
            <Text style={styles.sectionTitle}>Question {index + 1}</Text>
            <LabeledInput
              label="Prompt"
              value={question.question}
              onChangeText={(value) =>
                setSubjectiveQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, question: value } : item)))
              }
              placeholder="Enter written question"
              multiline
            />
            <Spacer />
            <LabeledInput
              label="Marks"
              value={String(question.marks)}
              onChangeText={(value) =>
                setSubjectiveQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, marks: Number(value) || 0 } : item)))
              }
              keyboardType="number-pad"
            />
            <Spacer />
            <LabeledInput
              label="Expected answer"
              value={question.expectedAnswer}
              onChangeText={(value) =>
                setSubjectiveQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, expectedAnswer: value } : item)))
              }
              placeholder="Optional model answer"
              multiline
            />
            <Spacer />
            <LabeledInput
              label="Key points"
              value={question.keyPoints}
              onChangeText={(value) =>
                setSubjectiveQuestions((prev) => prev.map((item, i) => (i === index ? { ...item, keyPoints: value } : item)))
              }
              placeholder="One point per line"
              multiline
            />
            <Spacer />
            <Button
              label={subjectiveQuestions.length === 1 ? "Keep question" : "Remove question"}
              onPress={() => setSubjectiveQuestions((prev) => (prev.length === 1 ? prev : prev.filter((_, i) => i !== index)))}
              variant="secondary"
            />
          </Card>
        ))
      )}

      <Button
        label={testFormat === "mcq" ? "Add question" : "Add written question"}
        onPress={() => (testFormat === "mcq" ? setMcqQuestions((prev) => [...prev, emptyMcq()]) : setSubjectiveQuestions((prev) => [...prev, emptySubjective()]))}
        variant="secondary"
      />

      <Card>
        <Text style={styles.summaryText}>
          {testFormat === "mcq" ? `${mcqQuestions.length} questions` : `${subjectiveQuestions.length} questions · ${subjectiveTotalMarks} total marks`}
        </Text>
        <Spacer />
        <Button label={loading ? "Creating..." : "Create test"} onPress={createTest} disabled={loading} />
      </Card>
    </Screen>
  );
}

function FormatPicker({ active, onSelect }: { active: TestFormat; onSelect: (format: TestFormat) => void }) {
  return (
    <View style={styles.row}>
      <Pressable onPress={() => onSelect("mcq")} style={[styles.formatCard, active === "mcq" ? styles.formatActive : null]}>
        <Text style={[styles.formatEyebrow, active === "mcq" ? styles.formatActiveText : null]}>MCQ TEST</Text>
        <Text style={[styles.formatTitle, active === "mcq" ? styles.formatActiveText : null]}>Objective practice</Text>
      </Pressable>
      <Pressable onPress={() => onSelect("subjective")} style={[styles.formatCard, active === "subjective" ? styles.formatActive : null]}>
        <Text style={[styles.formatEyebrow, active === "subjective" ? styles.formatActiveText : null]}>SUBJECTIVE</Text>
        <Text style={[styles.formatTitle, active === "subjective" ? styles.formatActiveText : null]}>Written evaluation</Text>
      </Pressable>
    </View>
  );
}

function FieldBox({ label, value, onPress }: { label: string; value: string; onPress: () => void }) {
  return (
    <Pressable onPress={onPress} style={styles.fieldBox}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value}</Text>
    </Pressable>
  );
}

function LabeledInput(props: {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "email-address" | "number-pad" | "phone-pad";
  multiline?: boolean;
}) {
  return (
    <View>
      <Text style={styles.label}>{props.label}</Text>
      <TextInput
        value={props.value}
        onChangeText={props.onChangeText}
        placeholder={props.placeholder}
        placeholderTextColor={colors.muted}
        keyboardType={props.keyboardType}
        multiline={props.multiline}
        textAlignVertical={props.multiline ? "top" : "center"}
        style={[styles.input, props.multiline ? styles.textarea : null]}
      />
    </View>
  );
}

function cycleDifficulty(setter: (value: Difficulty) => void, current: Difficulty) {
  const values: Difficulty[] = ["Easy", "Medium", "Hard"];
  setter(values[(values.indexOf(current) + 1) % values.length]);
}

function cycleDuration(setter: (value: string) => void, current: string) {
  const values = ["15", "30", "45", "60", "90"];
  setter(values[(values.indexOf(current) + 1) % values.length] || "30");
}

function Spacer() {
  return <View style={{ height: 16 }} />;
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
    fontSize: 30,
    lineHeight: 34,
    fontWeight: "900",
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
  },
  formatActive: {
    backgroundColor: colors.primary,
  },
  formatEyebrow: {
    color: colors.primary,
    fontWeight: "900",
    fontSize: 11,
  },
  formatTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 6,
  },
  formatActiveText: {
    color: colors.white,
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
  textarea: {
    minHeight: 110,
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
  },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.bgSecondary,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  chipText: {
    fontWeight: "700",
    color: colors.text,
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
  sectionTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 22,
    marginBottom: 12,
  },
  optionsList: {
    gap: 10,
  },
  optionRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "center",
  },
  correctMarker: {
    width: 34,
    height: 34,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  correctMarkerActive: {
    backgroundColor: colors.primary,
  },
  correctMarkerText: {
    color: colors.text,
    fontWeight: "900",
  },
  optionInput: {
    flex: 1,
  },
  fieldBox: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: 16,
  },
  fieldLabel: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
  },
  fieldValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 18,
    marginTop: 8,
  },
  summaryText: {
    color: colors.text,
    fontWeight: "800",
    fontSize: 16,
  },
});
