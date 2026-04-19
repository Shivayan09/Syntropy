"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { ClipboardPen, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import { AiTokenStatus as AiTokenStatusType, useAiTokens } from "@/context/AiTokenContext";
import Loader2 from "@/components/utils/Loader2";

type Difficulty = "Easy" | "Medium" | "Hard";

type SyllabusResponse = {
    syllabus?: {
        subjects?: {
            name: string;
        }[];
    }[];
};

export default function CreateAITest() {
    const router = useRouter();
    const { user, getMe } = useAuth();
    const { tokenStatus, refreshTokenStatus, setTokenStatus } = useAiTokens();
    const [subjects, setSubjects] = useState<string[]>([]);
    const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>("Medium");
    const [questions, setQuestions] = useState(20);
    const [time, setTime] = useState(30);
    const [loading, setLoading] = useState(false);
    const [topicFocus, setTopicFocus] = useState("");
    const [mixedSubjects] = useState(true);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const hasTokens = tokenStatus?.hasTokens ?? false;
    const tokenStatusUnavailable = !tokenStatus;

    useEffect(() => {
        const fetchSyllabus = async () => {
            try {
                const res = await fetch(BACKEND_URL + "/api/syllabus/my", { credentials: "include" });
                const data = (await res.json()) as SyllabusResponse;
                const subs = data.syllabus?.[0]?.subjects?.map((subject) => subject.name) || [];
                setSyllabusSubjects(subs);

            } catch (err) {
                console.error("Failed to fetch syllabus", err);
            }
        };
        fetchSyllabus();
    }, [BACKEND_URL]);

    useEffect(() => {
        if (user?.preferences) {
            setDifficulty(user.preferences.difficulty || "Medium");
            setQuestions(user.preferences.questionsPerTest || 20);
        }
    }, [user]);

    const addSubject = () => {
        const val = input.trim();
        if (!val || subjects.includes(val)) {
            return;
        }
        setSubjects([...subjects, val]);
        setInput("");
    };

    const removeSubject = (sub: string) => {
        setSubjects(subjects.filter((s) => s !== sub));
    };

    const addFromSuggestion = (sub: string) => {
        if (!subjects.includes(sub)) {
            setSubjects([...subjects, sub]);
        }
    };

    const canGenerate = subjects.length > 0 && (tokenStatusUnavailable || hasTokens);

    const college = user?.college;
    const semester = user?.semester;

    const generateTest = async () => {
        if (!subjects.length) {
            return;
        }
        if (tokenStatus && !hasTokens) {
            toast.warn("No AI tokens left today. Manual tests are still unlimited.");
            return;
        }
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/test/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({ subjects, difficulty, questions, time, topicFocus, mixedSubjects, college, semester })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message);
                if (data.aiTokenStatus) {
                    setTokenStatus(data.aiTokenStatus as AiTokenStatusType);
                } else {
                    await refreshTokenStatus();
                }
                setLoading(false);
                return;
            } else {
                toast.success("Test created");
                await getMe();
                if (data.aiTokenStatus) {
                    setTokenStatus(data.aiTokenStatus as AiTokenStatusType);
                } else {
                    await refreshTokenStatus();
                }
                window.location.href = `/main/test/preview/${data.testId}`;
            }
        } catch (err) {
            console.error("Failed to generate test", err);
            setLoading(false);
        }
    };

    if(loading) {
        return <Loader2/>
    }

    return (
        <div className="mx-auto max-w-5xl">
            <div className="mb-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <Sparkles size={18} />
                    AI Test Generator
                </div>
                <h1 className="text-3xl font-extrabold">Generate a focused practice test.</h1>
            </div>

            <AiTokenStatus status={tokenStatus} showManualAction />

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
                    <div>
                        <p className="text-xs text-gray-500">AI Token</p>
                        <p className="font-bold">{tokenStatusUnavailable ? "Checked on submit" : hasTokens ? "Ready" : "Resets tomorrow"}</p>
                    </div>

                </div>
            </div>

            <div className="mb-7">
                <p className="font-bold">Subjects</p>
                {!subjects.length && (
                    <p className="text-xs text-red-500 mt-3">
                        Select at least one subject
                    </p>
                )}
                <div className="flex flex-wrap gap-2 my-3">
                    {subjects.map((sub) => (
                        <div key={sub} className="border-2 border-black px-3 py-1 flex items-center gap-2 bg-secondary">
                            {sub}
                            <button onClick={() => removeSubject(sub)} className="h-5! px-1! text-sm">
                                x
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

                {syllabusSubjects.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Suggested</p>
                        <div className="flex flex-wrap gap-2">
                            {syllabusSubjects.map((sub) => (
                                <span key={sub} onClick={() => addFromSuggestion(sub)} className="text-xs border px-2 py-1 cursor-pointer hover:bg-secondary">
                                    {sub}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

            </div>

            <div className="grid md:grid-cols-3 gap-10 mb-3">

                <div>
                    <p className="font-bold mb-3">Difficulty</p>
                    <select value={difficulty} onChange={(e) => setDifficulty(e.target.value as Difficulty)} className="w-full">
                        <option value="Easy">Easy</option>
                        <option value="Medium">Medium</option>
                        <option value="Hard">Hard</option>
                    </select>
                </div>

                <div>
                    <p className="font-bold mb-3">Questions</p>
                    <input type="range" min={5} max={50} value={questions} onChange={(e) => setQuestions(Number(e.target.value))} className="w-full" />
                    <p className="text-sm mt-2">{questions}</p>
                </div>

                <div>
                    <p className="font-bold mb-3">Time</p>
                    <input type="range" min={10} max={120} step={5} value={time} onChange={(e) => setTime(Number(e.target.value))} className="w-full" />
                    <p className="text-sm mt-2">{time} min</p>
                </div>

            </div>

            <div className="mb-7 space-y-5">
                <p className="font-bold">Additional Customization</p>
                <input placeholder="Focus topics (optional)" value={topicFocus} onChange={(e) => setTopicFocus(e.target.value)} className="w-full" />
            </div>

            <button onClick={generateTest} disabled={!canGenerate || loading} className={`w-full gap-2 text-lg ${(!canGenerate || loading) ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Sparkles size={20} />
                {loading ? "Generating..." : tokenStatusUnavailable || hasTokens ? "Generate AI Test" : "No tokens left"}
            </button>

            {tokenStatus && !hasTokens && (
                <button type="button" onClick={() => router.push("/main/create/manual")} className="button-secondary mt-4 w-full gap-2 text-lg">
                    <ClipboardPen size={20} />
                    Create Manual Test Instead
                </button>
            )}
        </div>
    );
}
