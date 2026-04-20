"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";

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

  const addSubject = () => {
    const value = subjectInput.trim();
    if (!value || subjects.includes(value)) return;
    setSubjects((prev) => [...prev, value]);
    setSubjectInput("");
  };

  const addSuggestedSubject = (subject: string) => {
    if (subjects.includes(subject)) return;
    setSubjects((prev) => [...prev, subject]);
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
    <div>
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">Create Test</h1>
        <p className="mt-2 text-stone-500">
          Build a manual paper your way, with separate flows for objective drills and written practice.
        </p>
      </div>

      <section className="mb-6">
        <p className="font-bold text-lg mb-5">Choose test format :</p>
        <div className="flex gap-5">
          <div
          role="button"
          tabIndex={0}
          onClick={() => setTestFormat("mcq")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTestFormat("mcq");
            }
          }}
          className="card cursor-pointer p-5 text-left"
          style={
            testFormat === "mcq"
              ? {
                backgroundColor: "var(--primary)",
                color: "white",
                borderColor: "var(--primary)",
              }
              : undefined
          }
        >
          <p className={`text-xs font-extrabold uppercase ${testFormat === "mcq" ? "text-white" : "text-primary"}`}>MCQ Test</p>
          <h2 className="mt-2 text-2xl font-extrabold">Objective practice</h2>
          <p className={`mt-2 text-sm ${testFormat === "mcq" ? "opacity-90" : "opacity-70"}`}>
            Keep the existing multiple-choice authoring flow with four options and one correct answer.
          </p>
        </div>

        <div
          role="button"
          tabIndex={0}
          onClick={() => setTestFormat("subjective")}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === " ") {
              event.preventDefault();
              setTestFormat("subjective");
            }
          }}
          className="card cursor-pointer p-5 text-left"
          style={
            testFormat === "subjective"
              ? {
                backgroundColor: "var(--primary)",
                color: "white",
                borderColor: "var(--primary)",
              }
              : undefined
          }
        >
          <p className={`text-xs font-extrabold uppercase ${testFormat === "subjective" ? "text-white" : "text-primary"}`}>
            Subjective Test
          </p>
          <h2 className="mt-2 text-2xl font-extrabold">Written evaluation</h2>
          <p className={`mt-2 text-sm ${testFormat === "subjective" ? "opacity-90" : "opacity-70"}`}>
            Set marks per question and optionally add model answers plus key points to guide evaluation.
          </p>
        </div>
        </div>
      </section>

      <div className="mb-5 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <p className="mb-2 font-bold">Test Name</p>
          <input placeholder="DSA Mock 1" value={title} onChange={(e) => setTitle(e.target.value)} className="w-full" />
        </div>

        <div>
          <p className="mb-2 font-bold">Difficulty</p>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="w-full">
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        <div>
          <p className="mb-2 font-bold">Time (minutes)</p>
          <input type="number" min={5} value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full" />
        </div>

        <div className="border border-(--border) bg-(--surface) p-4">
          <p className="text-xs font-extrabold uppercase text-primary">Summary</p>
          <p className="mt-2 text-lg font-extrabold">{activeQuestionCount} questions</p>
          <p className="mt-1 text-sm opacity-70">
            {testFormat === "mcq" ? "Single-correct MCQs" : `${subjectiveTotalMarks} total marks`}
          </p>
        </div>
      </div>

      <div className="mb-5">
        <p className="mb-2 font-bold">Description</p>
        <textarea
          placeholder="Add a short description or instructions for this test"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full"
        />
      </div>

      <div className="mb-7">
        <p className="mb-2 font-bold">Subjects</p>

        <div className="mb-3 flex flex-wrap gap-2">
          {subjects.map((subject) => (
            <div key={subject} className="flex items-center gap-2 border-2 border-black bg-secondary px-3 py-1">
              {subject}
              <button onClick={() => removeSubject(subject)} className="h-5! px-1! text-sm">
                x
              </button>
            </div>
          ))}
        </div>

        <div className="mb-3 flex gap-3">
          <input
            placeholder="Add subject"
            value={subjectInput}
            className="w-full"
            onChange={(e) => setSubjectInput(e.target.value)}
          />

          <button className="button-secondary" onClick={addSubject}>
            Add
          </button>
        </div>

        {syllabusSubjects.length > 0 && (
          <div className="mt-3">
            <p className="mb-2 text-xs text-gray-500">Suggested</p>

            <div className="flex flex-wrap gap-2">
              {syllabusSubjects.map((subject) => (
                <span
                  key={subject}
                  onClick={() => addSuggestedSubject(subject)}
                  className="cursor-pointer border px-2 py-1 text-xs hover:bg-secondary"
                >
                  {subject}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {testFormat === "mcq" ? (
        <section>
          <div>
            <h3 className="text-xl">Add questions</h3>
            <p className="mt-2 text-sm text-stone-500">Minimum of 1 question is compulsory</p>
          </div>

          <div className="flex flex-col gap-3">
            {mcqQuestions.map((question, questionIndex) => (
              <div key={questionIndex}>
                <div className="mb-3 flex items-center justify-between">
                  <p className="mt-3 font-bold">Question {questionIndex + 1}</p>

                  <button onClick={() => removeMcqQuestion(questionIndex)} className="button-secondary">
                    Remove
                  </button>
                </div>

                <textarea
                  placeholder="Enter question"
                  value={question.question}
                  onChange={(e) => updateMcqQuestion(questionIndex, e.target.value)}
                  className="mb-4 w-full"
                />

                <div className="grid gap-3 md:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const isCorrect = question.correctIndex === optionIndex;

                    return (
                      <div key={optionIndex} className="flex items-center gap-2">
                        <div
                          onClick={() => setCorrect(questionIndex, optionIndex)}
                          className={`flex h-6 w-6 cursor-pointer items-center justify-center border-2 border-black ${isCorrect ? "bg-primary" : "bg-white"}`}
                        >
                          {isCorrect && <span className="text-xs font-bold text-white">V</span>}
                        </div>

                        <input
                          placeholder={`Option ${optionIndex + 1}`}
                          value={option}
                          onChange={(e) => updateOption(questionIndex, optionIndex, e.target.value)}
                          className="w-full"
                        />
                      </div>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-gray-600">Select green box to mark correct answer</p>
              </div>
            ))}
          </div>

          <div className="mt-5">
            <button onClick={addMcqQuestion} className="button-secondary">
              + Add Question
            </button>
          </div>
        </section>
      ) : (
        <section className="space-y-4">
          <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <h3 className="text-xl font-extrabold">Add written questions</h3>
              <p className="mt-2 text-sm text-stone-500">
                Each question needs marks. Expected answer and key points are optional but recommended for better evaluation.
              </p>
            </div>

            <div className="border border-(--border) bg-(--surface) px-4 py-3 text-sm">
              <p className="font-bold opacity-60">Total marks</p>
              <p className="text-2xl font-extrabold">{subjectiveTotalMarks}</p>
            </div>
          </div>

          <div className="space-y-4">
            {subjectiveQuestions.map((question, index) => (
              <div key={index} className="border border-(--border) bg-(--surface) p-5 shadow-[4px_4px_0px_var(--shadow)]">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-xs font-extrabold uppercase text-primary">Question {index + 1}</p>
                    <h4 className="text-xl font-extrabold mt-2">Written response</h4>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-28">
                      <p className="mb-2 text-sm font-bold">Marks</p>
                      <input
                        type="number"
                        min={1}
                        value={question.marks}
                        onChange={(e) => updateSubjectiveQuestion(index, "marks", Number(e.target.value))}
                        className="w-full"
                      />
                    </div>

                    <button onClick={() => removeSubjectiveQuestion(index)} className="button-secondary mt-6 md:mt-0">
                      Remove
                    </button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="mb-2 font-bold">Question</p>
                    <textarea
                      placeholder="Enter the written question"
                      value={question.question}
                      onChange={(e) => updateSubjectiveQuestion(index, "question", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <p className="mb-2 font-bold">Expected answer</p>
                    <textarea
                      placeholder="Optional model answer or evaluation reference"
                      value={question.expectedAnswer}
                      onChange={(e) => updateSubjectiveQuestion(index, "expectedAnswer", e.target.value)}
                      className="w-full"
                    />
                  </div>

                  <div>
                    <p className="mb-2 font-bold">Key points</p>
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

          <div className="mt-5">
            <button onClick={addSubjectiveQuestion} className="button-secondary">
              + Add Written Question
            </button>
          </div>
        </section>
      )}

      <div className="mt-6">
        <button
          disabled={loading}
          className={`${loading ? "cursor-not-allowed opacity-65" : ""} w-full text-lg`}
          onClick={createTest}
        >
          {loading ? "Creating.." : "Create Test"}
        </button>
      </div>
    </div>
  );
}