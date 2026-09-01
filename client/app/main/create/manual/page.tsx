"use client";

import { useAuth } from "@/context/AuthContext";
import {
  ArrowRight,
  Check,
  ClipboardPen,
  FileText,
  Infinity as InfinityIcon,
  ListChecks,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  BuilderBar,
  ChoiceChip,
  OptionCard,
  PageHeading,
  RangeField,
  SegmentedControl,
  SelectionIndicator,
  StepSection,
} from "@/components/main/builder/BuilderKit";

type TestFormat = "mcq" | "subjective";

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

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
const optionLabels = ["A", "B", "C", "D"];

const createEmptyMcqQuestion = (): McqQuestion => ({
  question: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

const createEmptySubjectiveQuestion = (): SubjectiveQuestion => ({
  question: "",
  marks: 5,
  expectedAnswer: "",
  keyPoints: "",
});

export default function Create() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [difficulty, setDifficulty] = useState("Medium");
  const [time, setTime] = useState(30);
  const [testFormat, setTestFormat] = useState<TestFormat>("mcq");
  const [subjects, setSubjects] = useState<string[]>([]);
  const [subjectInput, setSubjectInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [mcqQuestions, setMcqQuestions] = useState<McqQuestion[]>([createEmptyMcqQuestion()]);
  const [subjectiveQuestions, setSubjectiveQuestions] = useState<SubjectiveQuestion[]>([createEmptySubjectiveQuestion()]);
  const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    const fetchSyllabus = async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/syllabus/my`, {
          credentials: "include",
        });
        const data = await res.json();
        const subs = data.syllabus?.[0]?.subjects?.map((s: { name: string }) => s.name) || [];
        setSyllabusSubjects(subs);
      } catch (err) {
        console.error("Failed to fetch syllabus", err);
      }
    };

    fetchSyllabus();
  }, []);

  const activeQuestionCount = testFormat === "mcq" ? mcqQuestions.length : subjectiveQuestions.length;
  const subjectiveTotalMarks = useMemo(
    () => subjectiveQuestions.reduce((sum, question) => sum + (Number(question.marks) || 0), 0),
    [subjectiveQuestions],
  );

  const missingRequirements = useMemo(() => {
    const missing: string[] = [];

    if (!title.trim()) missing.push("a test name");
    if (!subjects.length) missing.push("at least one subject");

    if (testFormat === "mcq") {
      const incomplete = mcqQuestions.some(
        (question) => !question.question.trim() || question.options.some((option) => !option.trim()),
      );
      if (incomplete) missing.push("every question and all 4 options filled");
    } else {
      const incomplete = subjectiveQuestions.some(
        (question) => !question.question.trim() || !(Number(question.marks) > 0),
      );
      if (incomplete) missing.push("every question filled with marks above 0");
    }

    return missing;
  }, [mcqQuestions, subjectiveQuestions, subjects.length, testFormat, title]);

  const isReady = missingRequirements.length === 0;

  const addSubject = () => {
    const value = subjectInput.trim();
    if (!value || subjects.includes(value)) return;
    setSubjects((prev) => [...prev, value]);
    setSubjectInput("");
  };

  const toggleSuggestedSubject = (subject: string) => {
    setSubjects((prev) =>
      prev.includes(subject) ? prev.filter((item) => item !== subject) : [...prev, subject],
    );
  };

  const removeSubject = (subject: string) => {
    setSubjects((prev) => prev.filter((item) => item !== subject));
  };

  const addMcqQuestion = () => {
    setMcqQuestions((prev) => [...prev, createEmptyMcqQuestion()]);
  };

  const removeMcqQuestion = (index: number) => {
    if (mcqQuestions.length === 1) return;
    setMcqQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateMcqQuestion = (index: number, value: string) => {
    setMcqQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, question: value } : question)),
    );
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setMcqQuestions((prev) =>
      prev.map((question, i) =>
        i === questionIndex
          ? {
            ...question,
            options: question.options.map((option, j) => (j === optionIndex ? value : option)),
          }
          : question,
      ),
    );
  };

  const setCorrect = (questionIndex: number, optionIndex: number) => {
    setMcqQuestions((prev) =>
      prev.map((question, i) => (i === questionIndex ? { ...question, correctIndex: optionIndex } : question)),
    );
  };

  const addSubjectiveQuestion = () => {
    setSubjectiveQuestions((prev) => [...prev, createEmptySubjectiveQuestion()]);
  };

  const removeSubjectiveQuestion = (index: number) => {
    if (subjectiveQuestions.length === 1) return;
    setSubjectiveQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateSubjectiveQuestion = <K extends keyof SubjectiveQuestion>(
    index: number,
    field: K,
    value: SubjectiveQuestion[K],
  ) => {
    setSubjectiveQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, [field]: value } : question)),
    );
  };

  const createTest = async () => {
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
            keyPoints: question.keyPoints
              .split("\n")
              .map((point) => point.trim())
              .filter(Boolean),
          }));

      const res = await fetch(`${BACKEND_URL}/api/test/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          difficulty,
          duration: time,
          subjects,
          type: "manual",
          testFormat,
          questions,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.warn(data.message);
        return;
      }

      toast.success("Test created");
      window.location.href = `/main/test/preview/${data.test._id}`;
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Failed to create test");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative pb-2">
      {!user?.onboardingCompleted &&
        <div onClick={() => router.push('/main/profile/education')} className="mb-5 flex w-fit cursor-pointer items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-black transition-all">
          <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300"></div>
          Add your syllabus in profile for personalized tests <ArrowRight className="h-4" />
        </div>
      }

      <PageHeading
        eyebrow="Manual builder"
        icon={ClipboardPen}
        title="Create Test"
        description="Build a paper your way, with separate flows for objective drills and written practice."
        aside={
          <div className="soft-panel flex items-center gap-3">
            <InfinityIcon size={20} className="text-primary" />
            <div>
              <p className="text-xs font-bold uppercase opacity-55">Manual tests</p>
              <p className="text-lg font-extrabold">Unlimited</p>
            </div>
          </div>
        }
      />

      <StepSection
        step={1}
        title="Choose test format"
        description="This decides how questions are authored and how attempts are scored."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <OptionCard
            selected={testFormat === "mcq"}
            onSelect={() => setTestFormat("mcq")}
            icon={ListChecks}
            eyebrow="MCQ Test"
            title="Objective practice"
            description="Four options with one correct answer, scored instantly on submit."
          />

          <OptionCard
            selected={testFormat === "subjective"}
            onSelect={() => setTestFormat("subjective")}
            icon={FileText}
            eyebrow="Subjective Test"
            title="Written evaluation"
            description="Set marks per question and optionally add model answers plus key points."
          />
        </div>
      </StepSection>

      <StepSection
        step={2}
        title="Test details"
        description="Name the paper and set how long the attempt should run."
      >
        <div className="grid gap-8 md:grid-cols-3">
          <div>
            <p className="mb-3 font-bold">Test name</p>
            <input
              placeholder="DSA Mock 1"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full"
            />
          </div>

          <SegmentedControl
            label="Difficulty"
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: "Easy", label: "Easy" },
              { value: "Medium", label: "Medium" },
              { value: "Hard", label: "Hard" },
            ]}
          />

          <RangeField
            label="Time limit"
            value={time}
            min={5}
            max={180}
            step={5}
            suffix="min"
            onChange={setTime}
          />
        </div>

        <div className="mt-6">
          <p className="mb-3 font-bold">Description</p>
          <textarea
            placeholder="Optional instructions shown before the attempt"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full"
          />
        </div>
      </StepSection>

      <StepSection
        step={3}
        title="Add subjects"
        description="Used for filtering, analytics and your subject-wise accuracy map."
        error={!subjects.length ? "Add at least one subject to continue." : undefined}
        action={
          <span className="soft-panel px-3! py-2! text-xs font-bold">{subjects.length} added</span>
        }
      >
        <div className="flex items-center gap-3">
          <input
            placeholder="Type a subject, e.g. Operating Systems"
            value={subjectInput}
            className="w-full"
            onChange={(e) => setSubjectInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
          />

          <button className="button-secondary shrink-0 gap-2" onClick={addSubject}>
            <Plus size={17} />
            Add
          </button>
        </div>

        {subjects.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {subjects.map((subject) => (
              <span
                key={subject}
                className="inline-flex items-center gap-2 rounded-full bg-primary py-1 pl-3 pr-1 text-xs font-bold text-white"
              >
                <Check size={13} strokeWidth={3.5} />
                {subject}
                <span
                  role="button"
                  tabIndex={0}
                  aria-label={`Remove ${subject}`}
                  onClick={() => removeSubject(subject)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      removeSubject(subject);
                    }
                  }}
                  className="grid h-5 w-5 cursor-pointer place-items-center rounded-full bg-white/25 hover:bg-white/40"
                >
                  <X size={11} strokeWidth={3} />
                </span>
              </span>
            ))}
          </div>
        )}

        {syllabusSubjects.length > 0 && (
          <div className="soft-panel mt-4">
            <p className="mb-3 text-xs font-extrabold uppercase tracking-wide opacity-60">
              From your syllabus
            </p>

            <div className="flex flex-wrap gap-2">
              {syllabusSubjects.map((subject) => (
                <ChoiceChip
                  key={subject}
                  label={subject}
                  selected={subjects.includes(subject)}
                  onSelect={() => toggleSuggestedSubject(subject)}
                />
              ))}
            </div>
          </div>
        )}
      </StepSection>

      {testFormat === "mcq" ? (
        <StepSection
          step={4}
          title="Add questions"
          description="At least one question is required. Tick the option that is correct."
          action={
            <span className="soft-panel px-3! py-2! text-xs font-bold">
              {mcqQuestions.length} question{mcqQuestions.length === 1 ? "" : "s"}
            </span>
          }
        >
          <div className="space-y-4">
            {mcqQuestions.map((question, questionIndex) => (
              <div key={questionIndex} className="card p-5">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                    Question {questionIndex + 1}
                  </p>

                  <button
                    onClick={() => removeMcqQuestion(questionIndex)}
                    disabled={mcqQuestions.length === 1}
                    className={`button-secondary h-9 gap-2 px-4 text-sm ${mcqQuestions.length === 1 ? "cursor-not-allowed opacity-40" : ""}`}
                  >
                    <Trash2 size={15} />
                    Remove
                  </button>
                </div>

                <textarea
                  placeholder="Enter the question"
                  value={question.question}
                  onChange={(e) => updateMcqQuestion(questionIndex, e.target.value)}
                  className="mb-4 w-full"
                />

                <p className="mb-3 text-xs font-bold uppercase tracking-wide opacity-55">
                  Options — tick the correct one
                </p>

                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = question.correctIndex === optionIndex;

                    return (
                      <div
                        key={optionIndex}
                        data-selected={isCorrect}
                        className="select-card is-static flex items-center gap-3 p-3!"
                      >
                        <span
                          role="radio"
                          aria-checked={isCorrect}
                          aria-label={`Mark option ${optionLabels[optionIndex]} correct`}
                          tabIndex={0}
                          onClick={() => setCorrect(questionIndex, optionIndex)}
                          onKeyDown={(event) => {
                            if (event.key === "Enter" || event.key === " ") {
                              event.preventDefault();
                              setCorrect(questionIndex, optionIndex);
                            }
                          }}
                          className="cursor-pointer"
                        >
                          <SelectionIndicator selected={isCorrect} round />
                        </span>

                        <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-(--bg-secondary) text-xs font-extrabold">
                          {optionLabels[optionIndex]}
                        </span>

                        <input
                          placeholder={`Option ${optionLabels[optionIndex]}`}
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs opacity-60">
                  Correct answer: option {optionLabels[question.correctIndex]}
                </p>
              </div>
            ))}
          </div>

          <button onClick={addMcqQuestion} className="button-secondary mt-4 gap-2">
            <Plus size={17} />
            Add question
          </button>
        </StepSection>
      ) : (
        <StepSection
          step={4}
          title="Add written questions"
          description="Each question needs marks. Expected answer and key points are optional but improve AI evaluation."
          action={
            <span className="soft-panel px-3! py-2! text-xs font-bold">
              {subjectiveQuestions.length} question{subjectiveQuestions.length === 1 ? "" : "s"} · {subjectiveTotalMarks} marks
            </span>
          }
        >
          <div className="space-y-4">
            {subjectiveQuestions.map((question, index) => (
              <div key={index} className="card p-5">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <p className="text-xs font-extrabold uppercase tracking-wide text-primary">
                    Question {index + 1}
                  </p>

                  <div className="flex items-end gap-3">
                    <div className="w-28">
                      <p className="mb-2 text-xs font-bold">Marks</p>
                      <input
                        type="number"
                        min={1}
                        value={question.marks}
                        onChange={(e) => updateSubjectiveQuestion(index, "marks", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <button
                      onClick={() => removeSubjectiveQuestion(index)}
                      disabled={subjectiveQuestions.length === 1}
                      className={`button-secondary h-9 gap-2 px-4 text-sm ${subjectiveQuestions.length === 1 ? "cursor-not-allowed opacity-40" : ""}`}
                    >
                      <Trash2 size={15} />
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 text-sm font-bold">Question</p>
                    <textarea
                      placeholder="Enter the written question"
                      value={question.question}
                      onChange={(e) => updateSubjectiveQuestion(index, "question", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-bold">Expected answer</p>
                    <textarea
                      placeholder="Optional model answer or evaluation reference"
                      value={question.expectedAnswer}
                      onChange={(e) => updateSubjectiveQuestion(index, "expectedAnswer", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-bold">Key points</p>
                    <textarea
                      placeholder={"Optional evaluation checklist, one point per line\nExample:\nDefines the concept clearly\nUses a correct example\nMentions limitations"}
                      value={question.keyPoints}
                      onChange={(e) => updateSubjectiveQuestion(index, "keyPoints", e.target.value)}
                      className="w-full min-h-32"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <button onClick={addSubjectiveQuestion} className="button-secondary mt-4 gap-2">
            <Plus size={17} />
            Add written question
          </button>
        </StepSection>
      )}

      <BuilderBar
        items={[
          { label: "Format", value: testFormat === "mcq" ? "MCQ" : "Subjective" },
          { label: "Subjects", value: subjects.length ? `${subjects.length} added` : "None" },
          {
            label: "Paper",
            value:
              testFormat === "mcq"
                ? `${activeQuestionCount} Q · ${time} min`
                : `${activeQuestionCount} Q · ${subjectiveTotalMarks} marks · ${time} min`,
          },
        ]}
        note={isReady ? undefined : `Still needed: ${missingRequirements.join(", ")}.`}
      >
        <button
          disabled={loading || !isReady}
          className={`flex-1 gap-2 lg:flex-none ${loading || !isReady ? "cursor-not-allowed opacity-50" : ""}`}
          onClick={createTest}
        >
          <ClipboardPen size={18} />
          {loading ? "Creating..." : "Create test"}
        </button>
      </BuilderBar>
    </div>
  );
}
