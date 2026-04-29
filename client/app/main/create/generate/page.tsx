"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { ClipboardPen, Sparkles, X } from "lucide-react";
import { useRouter } from "next/navigation";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import { AiTokenStatus as AiTokenStatusType, useAiTokens } from "@/context/AiTokenContext";
import Loader2 from "@/components/utils/Loader2";

type Difficulty = "Easy" | "Medium" | "Hard";
type TestFormat = "mcq" | "subjective";

const normalizeSubjectName = (value: string) => value.trim().replace(/\s+/g, " ");

const academicKeywordStems = [
    "account", "algebra", "algorithm", "anatom", "biology", "biotech", "botany",
    "business", "calculus", "chem", "circuit", "civic", "cloud", "coding",
    "commerce", "computer", "data", "database", "dbms", "design", "digital",
    "dsa", "economic", "electrical", "electronic", "engineering", "english",
    "evs", "finance", "geography", "geometry", "grammar", "history", "hindi",
    "iot", "law", "literature", "machine", "management", "marketing", "math",
    "mathemat", "mechanical", "medicine", "microbiology", "ml", "network",
    "nursing", "operating", "os", "pharmacology", "philosophy", "physics",
    "physiology", "political", "probability", "program", "psychology", "science",
    "security", "software", "spanish", "statistics", "structure", "sanskrit",
    "sociology", "thermo", "trigonometry", "urdu", "zoology"
];

const hasRepeatedPattern = (value: string) => {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (compact.length < 6) return false;
    return /^(.{2,10})\1+$/.test(compact);
};

const obviousGibberishFragments = ["asdf", "qwer", "zxcv", "qwerty", "asdfgh", "poiuy", "lkjh"];

const isLikelyAcronym = (value: string) => /^[A-Z]{2,10}$/.test(value);

const hasAcademicKeyword = (subject: string) => {
    const tokens = subject.toLowerCase().match(/[a-z0-9]+/g) || [];
    return tokens.some((token) =>
        academicKeywordStems.some((keyword) => token.includes(keyword) || keyword.includes(token))
    );
};

const isValidSubjectName = (value: string) => {
    const subject = normalizeSubjectName(value);
    const acronym = isLikelyAcronym(subject);

    if (subject.length < (acronym ? 2 : 3) || subject.length > 60) return false;
    if (!/^[A-Za-z0-9][A-Za-z0-9&/+\-.,()' ]*[A-Za-z0-9)]$/.test(subject)) return false;

    const letters = (subject.match(/[A-Za-z]/g) || []).length;
    const digits = (subject.match(/[0-9]/g) || []).length;

    if (letters < 2) return false;
    if (digits > letters) return false;
    if (/(.)\1{3,}/i.test(subject.replace(/\s/g, ""))) return false;
    if (hasRepeatedPattern(subject)) return false;

    const compact = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alphaTokens = subject.match(/[A-Za-z]+/g) || [];

    for (const token of alphaTokens) {
        if (!isLikelyAcronym(token) && !/[aeiou]/i.test(token)) {
            return false;
        }
        if (!isLikelyAcronym(token) && /[bcdfghjklmnpqrstvwxyz]{5,}/i.test(token)) {
            return false;
        }
    }

    if (compact.length <= 12 && obviousGibberishFragments.some((fragment) => compact.includes(fragment))) {
        return false;
    }

    if (!acronym && !hasAcademicKeyword(subject)) {
        return false;
    }

    return true;
};

type SyllabusResponse = {
    syllabus?: {
        subjects?: {
            name: string;
        }[];
    }[];
};

export default function CreateAITest() {
    const MAX_GENERATED_QUESTIONS = 30;
    const MAX_SUBJECTIVE_MARKS = 100;
    const router = useRouter();
    const { user, getMe } = useAuth();
    const { tokenStatus, refreshTokenStatus, setTokenStatus } = useAiTokens();
    const preferredDifficulty = user?.preferences?.difficulty || "Medium";
    const preferredQuestions = Math.min(user?.preferences?.questionsPerTest || 20, MAX_GENERATED_QUESTIONS);
    const [testFormat, setTestFormat] = useState<TestFormat>("mcq");
    const [totalMarks, setTotalMarks] = useState(MAX_SUBJECTIVE_MARKS);
    const [subjects, setSubjects] = useState<string[]>([]);
    const [syllabusSubjects, setSyllabusSubjects] = useState<string[]>([]);
    const [input, setInput] = useState("");
    const [difficulty, setDifficulty] = useState<Difficulty>(preferredDifficulty);
    const [questions, setQuestions] = useState(preferredQuestions);
    const [time, setTime] = useState(30);
    const [loading, setLoading] = useState(false);
    const [topicFocus, setTopicFocus] = useState("");
    const [subjectError, setSubjectError] = useState("");
    const [confirmOpen, setConfirmOpen] = useState(false);
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

    const addSubject = () => {
        const val = normalizeSubjectName(input);
        if (!val) {
            setSubjectError("");
            return;
        }
        if (!isValidSubjectName(val)) {
            setSubjectError("Enter a real subject name like Mathematics, Physics, or DBMS.");
            return;
        }
        if (subjects.includes(val)) {
            setSubjectError("");
            return;
        }
        setSubjectError("");
        setSubjects([...subjects, val]);
        setInput("");
    };

    const removeSubject = (sub: string) => {
        setSubjects(subjects.filter((s) => s !== sub));
    };

    const addFromSuggestion = (sub: string) => {
        if (!subjects.includes(sub)) {
            setSubjectError("");
            setSubjects([...subjects, sub]);
        }
    };

    const canGenerate = subjects.length > 0 && (tokenStatusUnavailable || hasTokens);

    const college = user?.college;
    const semester = user?.semester;

    const validateBeforeGenerate = () => {
        if (!subjects.length) {
            return false;
        }
        const invalidSubjects = subjects.filter((subject) => !isValidSubjectName(subject));
        if (invalidSubjects.length) {
            setSubjectError(`Invalid subject${invalidSubjects.length > 1 ? "s" : ""}: ${invalidSubjects.join(", ")}`);
            return false;
        }
        if (tokenStatus && !hasTokens) {
            toast.warn("No AI test credits left right now. Manual tests are still unlimited.");
            return false;
        }

        setSubjectError("");
        return true;
    };

    const openGenerateConfirm = () => {
        if (!validateBeforeGenerate()) {
            return;
        }

        setConfirmOpen(true);
    };

    const generateTest = async () => {
        try {
            setLoading(true);
            setSubjectError("");
            setConfirmOpen(false);
            const payload =
                testFormat === "mcq"
                    ? { subjects, difficulty, questions, time, topicFocus, mixedSubjects, college, semester, testFormat }
                    : { subjects, difficulty, totalMarks, time, topicFocus, college, semester, testFormat };

            const res = await fetch(BACKEND_URL + "/api/test/generate", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(payload)
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

    if (loading) {
        return <Loader2 />
    }

    return (
        <div className="relative">

            {!user?.onboardingCompleted &&
                <div className="md:absolute mb-5 md:mb-0 right-0 z-50 bg-yellow-50 flex items-center gap-2 text-sm px-3 py-2 w-fit rounded-md">
                    <div className="h-2 w-2 bg-yellow-300 animate-pulse rounded-full"></div>
                    Add your syllabus in profile for personalized tests
                </div>
            }

            <div className="mb-5">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <Sparkles size={18} />
                    AI Test Generator
                </div>
                <h1 className="text-3xl font-extrabold">Generate a focused practice test.</h1>
            </div>

            <AiTokenStatus status={tokenStatus} showManualAction />

            <section className="mb-6">
                <p className="font-bold text-lg mb-5">Choose test format :</p>
                <div className="flex flex-col md:flex-row gap-5">
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
                            Generate a focused multiple-choice paper with one correct option per question.
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
                        <p className={`text-xs font-extrabold uppercase ${testFormat === "subjective" ? "text-white" : "text-primary"}`}>Subjective Test</p>
                        <h2 className="mt-2 text-2xl font-extrabold">Written evaluation</h2>
                        <p className={`mt-2 text-sm ${testFormat === "subjective" ? "opacity-90" : "opacity-70"}`}>
                            Generate descriptive questions with marks-based evaluation for written answers.
                        </p>
                    </div>
                </div>
            </section>

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

                    {testFormat === "mcq" && (
                        <div>
                            <p className="text-xs text-gray-500">Questions</p>
                            <p className="font-bold">{questions}</p>
                        </div>
                    )}

                    {testFormat === "subjective" && (
                        <div>
                            <p className="text-xs text-gray-500">Total Marks</p>
                            <p className="font-bold">{totalMarks}</p>
                        </div>
                    )}

                    <div>
                        <p className="text-xs text-gray-500">Time</p>
                        <p className="font-bold">{time} min</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500">AI Token</p>
                        <p className="font-bold">
                            {tokenStatusUnavailable
                                ? "Checked on submit"
                                : hasTokens
                                    ? "Ready"
                                    : tokenStatus?.plan === "free"
                                        ? "Monthly quota used"
                                        : "Refill pending"}
                        </p>
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
                    <input
                        placeholder="Add subject"
                        value={input}
                        onChange={(e) => {
                            setInput(e.target.value);
                            if (subjectError) {
                                setSubjectError("");
                            }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && addSubject()}
                        className="w-full"
                    />
                    <button className="button-secondary" onClick={addSubject}>
                        Add
                    </button>
                </div>
                {subjectError && (
                    <p className="mt-2 text-xs text-red-500">{subjectError}</p>
                )}

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

                {testFormat === "mcq" && (
                    <div>
                        <p className="font-bold mb-3">Questions</p>
                        <input type="range" min={5} max={MAX_GENERATED_QUESTIONS} value={questions} onChange={(e) => setQuestions(Number(e.target.value))} className="w-full" />
                        <p className="text-sm mt-2">{questions}</p>
                    </div>
                )}

                {testFormat === "subjective" && (
                    <div>
                        <p className="font-bold mb-3">Total Marks</p>
                        <input type="range" min={20} max={MAX_SUBJECTIVE_MARKS} value={totalMarks} onChange={(e) => setTotalMarks(Number(e.target.value))} className="w-full" />
                        <p className="text-sm mt-2">{totalMarks}</p>
                    </div>
                )}

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

            <button onClick={openGenerateConfirm} disabled={!canGenerate || loading} className={`w-full gap-2 text-lg ${(!canGenerate || loading) ? "opacity-50 cursor-not-allowed" : ""}`}>
                <Sparkles size={20} />
                {loading ? "Generating..." : tokenStatusUnavailable || hasTokens ? `Generate ${testFormat === "mcq" ? "MCQ" : "Subjective"} Test` : "No credits left"}
            </button>

            {tokenStatus && !hasTokens && (
                <button type="button" onClick={() => router.push("/main/create/manual")} className="button-secondary mt-4 w-full gap-2 text-lg">
                    <ClipboardPen size={20} />
                    Create Manual Test Instead
                </button>
            )}

            <GenerateConfirmModal
                open={confirmOpen}
                loading={loading}
                onClose={() => setConfirmOpen(false)}
                onConfirm={generateTest}
                subjects={subjects}
                duration={time}
                difficulty={difficulty}
                testFormat={testFormat}
                questions={questions}
                totalMarks={totalMarks}
            />

        </div>
    );
}

function GenerateConfirmModal({
    open,
    loading,
    onClose,
    onConfirm,
    subjects,
    duration,
    difficulty,
    testFormat,
    questions,
    totalMarks,
}: {
    open: boolean;
    loading: boolean;
    onClose: () => void;
    onConfirm: () => void;
    subjects: string[];
    duration: number;
    difficulty: Difficulty;
    testFormat: TestFormat;
    questions: number;
    totalMarks: number;
}) {
    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === "Escape" && !loading) onClose();
        };

        if (open) {
            window.addEventListener("keydown", handleEsc);
        }

        return () => window.removeEventListener("keydown", handleEsc);
    }, [loading, onClose, open]);

    if (!open) {
        return null;
    }

    const safeClose = () => {
        if (!loading) onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/50" onClick={safeClose} />
            <div className="relative w-full max-w-lg rounded-lg border border-primary bg-surface p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
                <div
                    role="button"
                    tabIndex={loading ? -1 : 0}
                    className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full ${loading ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:opacity-70"}`}
                    onClick={safeClose}
                    onKeyDown={(event) => {
                        if ((event.key === "Enter" || event.key === " ") && !loading) {
                            event.preventDefault();
                            onClose();
                        }
                    }}
                    aria-disabled={loading}
                    aria-label="Close generate confirmation"
                >
                    <X size={18} />
                </div>

                <div className="pr-8">
                    <p className="text-xs font-extrabold uppercase text-primary">Confirm AI Test</p>
                    <h2 className="mt-2 text-2xl font-extrabold">Check your setup before generating.</h2>
                    <p className="mt-2 text-sm opacity-70">
                        Make sure your subjects, duration, and {testFormat === "mcq" ? "total questions" : "total marks"} are correct before using an AI credit.
                    </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="border border-(--border) bg-(--bg-secondary) p-3">
                        <p className="text-xs opacity-60">Format</p>
                        <p className="font-extrabold">{testFormat === "mcq" ? "MCQ Test" : "Subjective Test"}</p>
                    </div>
                    <div className="border border-(--border) bg-(--bg-secondary) p-3">
                        <p className="text-xs opacity-60">Difficulty</p>
                        <p className="font-extrabold">{difficulty}</p>
                    </div>
                    <div className="border border-(--border) bg-(--bg-secondary) p-3">
                        <p className="text-xs opacity-60">Duration</p>
                        <p className="font-extrabold">{duration} min</p>
                    </div>
                    <div className="border border-(--border) bg-(--bg-secondary) p-3">
                        <p className="text-xs opacity-60">{testFormat === "mcq" ? "Total Questions" : "Total Marks"}</p>
                        <p className="font-extrabold">{testFormat === "mcq" ? questions : totalMarks}</p>
                    </div>
                </div>

                <div className="mt-4 border border-(--border) bg-(--bg-secondary) p-4">
                    <p className="text-xs opacity-60">Subjects</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {subjects.map((subject) => (
                            <span key={subject} className="border-2 border-black bg-secondary px-3 py-1 text-sm font-semibold">
                                {subject}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button className="button-secondary" onClick={safeClose} disabled={loading}>
                        Cancel
                    </button>
                    <button onClick={onConfirm} disabled={loading} className={`gap-2 ${loading ? "cursor-not-allowed opacity-70" : ""}`}>
                        <Sparkles size={18} />
                        {loading ? "Generating..." : "Confirm and generate"}
                    </button>
                </div>
            </div>
        </div>
    );
}
