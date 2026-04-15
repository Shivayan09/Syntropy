"use client";

import { useState, useEffect } from "react";
import { toast } from "react-toastify";

type Question = {
    question: string;
    options: string[];
    correctIndex: number;
};

export default function Create() {
    const [title, setTitle] = useState("");
    const [difficulty, setDifficulty] = useState("Medium");
    const [time, setTime] = useState(30);

    const [subjects, setSubjects] = useState<string[]>([]);
    const [subjectInput, setSubjectInput] = useState("");
    const [loading, setLoading] = useState(false);

    const [questions, setQuestions] = useState<Question[]>([
        { question: "", options: ["", "", "", ""], correctIndex: 0 }
    ]);

    // 🔥 NEW: syllabus suggestions
    const [syllabusSubjects, setsyllabusSubjects] = useState<string[]>([]);

    // 🔥 NEW: fetch syllabus
    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const res = await fetch(
                    process.env.NEXT_PUBLIC_BACKEND_URL + "/api/syllabus/my",
                    { credentials: "include" }
                );

                const data = await res.json();

                const subs =
                    data.syllabus?.[0]?.subjects?.map((s: any) => s.name) || [];

                setsyllabusSubjects(subs);

            } catch (err) {
                console.error("Failed to fetch syllabus", err);
            }
        };

        fetchSyllabus();
    }, []);

    const addSubject = () => {
        if (!subjectInput.trim()) return;
        if (subjects.includes(subjectInput)) return;
        setSubjects([...subjects, subjectInput]);
        setSubjectInput("");
    };

    const removeSubject = (s: string) => {
        setSubjects(subjects.filter((sub) => sub !== s));
    };

    const addQuestion = () => {
        setQuestions([
            ...questions,
            { question: "", options: ["", "", "", ""], correctIndex: 0 },
        ]);
    };

    const removeQuestion = (index: number) => {
        if (questions.length === 1) return;
        setQuestions(questions.filter((_, i) => i !== index));
    };

    const updateQuestion = (index: number, value: string) => {
        const updated = [...questions];
        updated[index].question = value;
        setQuestions(updated);
    };

    const updateOption = (qIndex: number, optIndex: number, value: string) => {
        const updated = [...questions];
        updated[qIndex].options[optIndex] = value;
        setQuestions(updated);
    };

    const setCorrect = (qIndex: number, optIndex: number) => {
        const updated = [...questions];
        updated[qIndex].correctIndex = optIndex;
        setQuestions(updated);
    };

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const createTest = async () => {
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/test/create", {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title,
                    difficulty,
                    duration: time,
                    subjects,
                    type: "manual",
                    questions: questions.map((q) => ({
                        question: q.question,
                        options: q.options,
                        correctAnswer: q.correctIndex,
                    })),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                toast.warn(data.message);
                return;
            }

            toast.success("Test created");
            window.location.href = `/main/test/preview/${data.test._id}`;
        } catch (error: any) {
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>

            <div className="mb-5">
                <h1 className="text-3xl font-extrabold">
                    Create Test
                </h1>
                <p className="text-stone-500 mt-2">
                    Create your own custom test curated by yourself
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-5">

                <div>
                    <p className="font-bold mb-2">Test Name</p>
                    <input
                        placeholder="DSA Mock 1"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full"
                    />
                </div>

                <div>
                    <p className="font-bold mb-2">Difficulty</p>
                    <select
                        value={difficulty}
                        onChange={(e) => setDifficulty(e.target.value)}
                        className="w-full"
                    >
                        <option>Easy</option>
                        <option>Medium</option>
                        <option>Hard</option>
                    </select>
                </div>

                <div>
                    <p className="font-bold mb-2">Time (minutes)</p>
                    <input
                        type="number"
                        min={5}
                        value={time}
                        onChange={(e) => setTime(Number(e.target.value))}
                        className="w-full"
                    />
                </div>

            </div>

            <div className="mb-5">
                <p className="font-bold mb-2">Subjects</p>

                <div className="flex flex-wrap gap-2 mb-3">
                    {subjects.map((s) => (
                        <div
                            key={s}
                            className="border-2 border-black px-3 py-1 flex items-center gap-2 bg-secondary"
                        >
                            {s}

                            <button
                                onClick={() => removeSubject(s)}
                                className="h-5! px-1! text-sm"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex gap-3 mb-3">
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

                {/* 🔥 NEW: suggestions */}
                {syllabusSubjects.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Suggested</p>

                        <div className="flex flex-wrap gap-2">
                            {syllabusSubjects.map((sub) => (
                                <span
                                    key={sub}
                                    onClick={() => {
                                    if (!subjects.includes(sub)) {
                                        setSubjects([...subjects, sub]);
                                    }
                                }}
                                    className="text-xs border px-2 py-1 cursor-pointer hover:bg-secondary"
                                >
                                    {sub}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                
            </div>

            <div>
                <div>
                    <h3 className="text-xl">Add questions</h3>
                    <p className="mt-2 text-sm text-stone-500">
                        Minimum of 1 question is compulsory
                    </p>
                </div>

                <div className="flex flex-col gap-3">
                    {questions.map((q, qIndex) => (
                        <div key={qIndex}>

                            <div className="flex items-center justify-between mb-3">
                                <p className="font-bold mt-3">
                                    Question {qIndex + 1}
                                </p>

                                <button
                                    onClick={() => removeQuestion(qIndex)}
                                    className="button-secondary"
                                >
                                    Remove
                                </button>
                            </div>

                            <textarea
                                placeholder="Enter question"
                                value={q.question}
                                onChange={(e) =>
                                    updateQuestion(qIndex, e.target.value)
                                }
                                className="w-full mb-4"
                            />

                            <div className="grid md:grid-cols-2 gap-3">
                                {q.options.map((opt, optIndex) => {
                                    const isCorrect =
                                        q.correctIndex === optIndex;
                                    return (
                                        <div
                                            key={optIndex}
                                            className="flex gap-2 items-center"
                                        >
                                            <div
                                                onClick={() =>
                                                    setCorrect(qIndex, optIndex)
                                                }
                                                className={`w-6 h-6 border-2 border-black cursor-pointer flex items-center justify-center ${isCorrect
                                                        ? "bg-primary"
                                                        : "bg-white"
                                                    }`}
                                            >
                                                {isCorrect && (
                                                    <span className="text-white text-xs font-bold">
                                                        ✓
                                                    </span>
                                                )}
                                            </div>

                                            <input
                                                placeholder={`Option ${optIndex + 1
                                                    }`}
                                                value={opt}
                                                onChange={(e) =>
                                                    updateOption(
                                                        qIndex,
                                                        optIndex,
                                                        e.target.value
                                                    )
                                                }
                                                className="w-full"
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <p className="text-xs text-gray-600 mt-3">
                                Select green box to mark correct answer
                            </p>

                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-5">
                <button
                    onClick={addQuestion}
                    className="button-secondary"
                >
                    + Add Question
                </button>
            </div>

            <div className="mt-5">
                <button
                    disabled={loading}
                    className={`${loading ? "opacity-65 cursor-not-allowed" : ""
                        } w-full text-lg`}
                    onClick={createTest}
                >
                    {loading ? "Creating.." : "Create Test"}
                </button>
            </div>

        </div>
    );
}