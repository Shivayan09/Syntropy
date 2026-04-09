"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

export default function CreateAITest() {
    const { user } = useAuth();

    const [subjects, setSubjects] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
    const [questions, setQuestions] = useState(20);
    const [time, setTime] = useState(30);

    const [topicFocus, setTopicFocus] = useState("");
    const [includeTheory, setIncludeTheory] = useState(false);
    const [mixedSubjects, setMixedSubjects] = useState(true);

    useEffect(() => {
        if (user?.preferences) {
            setSubjects(user.preferences.subjects || []);
            setDifficulty(user.preferences.difficulty || "Medium");
            setQuestions(user.preferences.questionsPerTest || 20);
        }
    }, [user]);

    const addSubject = () => {
        if (!input.trim()) return;
        if (subjects.includes(input)) return;
        setSubjects([...subjects, input]);
        setInput("");
    };

    const removeSubject = (sub: string) => {
        setSubjects(subjects.filter((s) => s !== sub));
    };

    const canGenerate = subjects.length > 0;

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const generateTest = async () => {
        if (!subjects.length) return;

        try {
            const res = await fetch(BACKEND_URL + "/api/test/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    subjects,
                    difficulty,
                    questions,
                    time,
                    topicFocus,
                    mixedSubjects
                })
            });
            const data = await res.json();
            console.log("AI TEST:", data);
            if (!res.ok) {
                toast.warn(data.message)
                return;
            }
            toast.success("Test created")
            window.location.href = `/main/test/preview/${data.testId}`;

        } catch (err) {
            console.error("Failed to generate test", err);
        }
    };

    return (
        <div className="mx-auto px-4 md:px-10 py-20 md:py-8">

            {/* HEADER */}
            <div className="mb-5">
                <h1 className="text-3xl font-extrabold">
                    AI Test Generator
                </h1>
            </div>

            {/* PREVIEW BAR */}
            <div className="mb-7 border-2 border-black px-5 py-4 flex flex-wrap items-center justify-between gap-4">

                <div className="flex flex-wrap gap-6 text-sm">

                    <div>
                        <p className="text-xs text-gray-500">Subjects</p>
                        <p className="font-bold">
                            {subjects.length ? subjects.join(", ") : "None"}
                        </p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Difficulty</p>
                        <p className="font-bold">{difficulty}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Questions</p>
                        <p className="font-bold">{questions}</p>
                    </div>

                    <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-bold">{time} min</p>
                    </div>

                </div>

            </div>

            {/* SUBJECTS */}
            <div className="mb-7">
                <p className="font-bold">Subjects</p>

                <div className="flex flex-wrap gap-2 my-3">
                    {subjects.map((sub) => (
                        <div key={sub} className="border-2 border-black px-3 py-1 flex items-center gap-2 bg-white">
                            {sub}

                            <button onClick={() => removeSubject(sub)} className="h-5! px-1! text-sm">
                                ×
                            </button>
                        </div>
                    ))}
                </div>

                <div className="flex items-center gap-3">
                    <input placeholder="Add subject" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addSubject()} className="w-full" />

                    <button className="button-secondary" onClick={addSubject}>
                        Add
                    </button>
                </div>

                {!subjects.length && (
                    <p className="text-xs text-red-500 mt-3">
                        Select at least one subject
                    </p>
                )}
            </div>

            {/* CONTROLS */}
            <div className="grid md:grid-cols-3 gap-10 mb-5">

                {/* DIFFICULTY DROPDOWN */}
                <div>
                    <p className="font-bold mb-3">Difficulty</p>

                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as any)} className="w-full">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                {/* QUESTIONS */}
                <div>
                    <p className="font-bold mb-3">Questions</p>

                    <input type="range" min={5} max={50} value={questions} onChange={(e) => setQuestions(Number(e.target.value))} className="w-full" />

                    <p className="text-sm mt-2">
                        {questions}
                    </p>
                </div>

                {/* TIME */}
                <div>
                    <p className="font-bold mb-3">Time</p>

                    <input type="range" min={10} max={120} step={5} value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full" />

                    <p className="text-sm mt-2">
                        {time} min
                    </p>
                </div>

            </div>

            {/* ADDITIONAL CUSTOMIZATION */}
            <div className="mb-7 space-y-5">

                <p className="font-bold">
                    Additional Customization
                </p>

                <input placeholder="Focus topics (optional) e.g. graphs, dp, trees" value={topicFocus} onChange={(e) => setTopicFocus(e.target.value)} className="w-full" />

            </div>

            {/* GENERATE */}
            <button onClick={generateTest} disabled={!canGenerate} className={`w-full text-lg ${!canGenerate && "opacity-50 cursor-not-allowed"}`}>
                Generate AI Test
            </button>

        </div>
    );
}