"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import {
    ArrowRight,
    Check,
    CircleAlert,
    ClipboardPen,
    CornerDownLeft,
    FileText,
    ListChecks,
    Plus,
    Sparkles,
    TicketCheck,
    X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import AiTokenStatus from "@/components/main/AiTokenStatus";
import {
    BuilderBar,
    ChoiceChip,
    OptionCard,
    PageHeading,
    RangeField,
    SegmentedControl,
    StepSection,
} from "@/components/main/builder/BuilderKit";
import { AiTokenStatus as AiTokenStatusType, useAiTokens } from "@/context/AiTokenContext";
import GenerationLoader from "@/components/utils/GenerationLoader";

type Difficulty = "Easy" | "Medium" | "Hard";
type TestFormat = "mcq" | "subjective";

const normalizeSubjectName = (value: string) => value.trim().replace(/\s+/g, " ");

const hasRepeatedPattern = (value: string) => {
    const compact = value.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (compact.length < 6) return false;
    return /^(.{2,10})\1+$/.test(compact);
};

const obviousGibberishFragments = ["asdf", "qwer", "zxcv", "qwerty", "asdfgh", "poiuy", "lkjh"];

const isLikelyAcronym = (value: string) => /^[A-Z]{2,10}$/.test(value);

// Only checks that the name looks like one. The server decides if it is a real subject.
const isValidSubjectName = (value: string) => {
    const subject = normalizeSubjectName(value);

    if (subject.length < 2 || subject.length > 60) return false;
    if (!/^[A-Za-z0-9][A-Za-z0-9&/+#\-.,()' ]*[A-Za-z0-9)+#]$/.test(subject)) return false;

    const letters = (subject.match(/[A-Za-z]/g) || []).length;
    const digits = (subject.match(/[0-9]/g) || []).length;

    if (letters < 1) return false;
    if (digits > letters) return false;
    if (/(.)\1{3,}/i.test(subject.replace(/\s/g, ""))) return false;
    if (hasRepeatedPattern(subject)) return false;

    const compact = subject.toLowerCase().replace(/[^a-z0-9]/g, "");
    const alphaTokens = subject.match(/[A-Za-z]+/g) || [];

    for (const token of alphaTokens) {
        if (!isLikelyAcronym(token) && /[bcdfghjklmnpqrstvwxz]{6,}/i.test(token)) {
            return false;
        }
    }

    if (compact.length <= 12 && obviousGibberishFragments.some((fragment) => compact.includes(fragment))) {
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
    const [rejectedInput, setRejectedInput] = useState("");
    const [shakeInput, setShakeInput] = useState(false);
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

    const trimmedInput = normalizeSubjectName(input);
    const inputState: "empty" | "valid" | "duplicate" | "invalid" | "rejected" = !trimmedInput
        ? "empty"
        : rejectedInput && rejectedInput === trimmedInput
          ? "rejected"
          : subjects.includes(trimmedInput)
            ? "duplicate"
            : isValidSubjectName(trimmedInput)
              ? "valid"
              : "invalid";

    const rejectInput = () => {
        setRejectedInput(trimmedInput);
        setShakeInput(true);
        window.setTimeout(() => setShakeInput(false), 450);
    };

    const addSubject = () => {
        const val = trimmedInput;
        if (!val) {
            setSubjectError("");
            return;
        }
        if (!isValidSubjectName(val)) {
            rejectInput();
            return;
        }
        if (subjects.includes(val)) {
            rejectInput();
            return;
        }
        setSubjectError("");
        setRejectedInput("");
        setSubjects([...subjects, val]);
        setInput("");
    };

    const removeSubject = (sub: string) => {
        setSubjects(subjects.filter((s) => s !== sub));
    };

    const toggleSuggestion = (sub: string) => {
        setSubjectError("");
        setSubjects((current) =>
            current.includes(sub) ? current.filter((item) => item !== sub) : [...current, sub],
        );
    };

    const canGenerate = subjects.length > 0 && (tokenStatusUnavailable || hasTokens);

    const college = user?.college;
    const semester = user?.semester;

    const secondsPerQuestion = questions > 0 ? Math.round((time * 60) / questions) : 0;

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
        const isMcq = testFormat === "mcq";

        return (
            <GenerationLoader
                eyebrow="AI test generator"
                title={`Building your ${isMcq ? "MCQ" : "subjective"} test`}
                description="The paper is being written and checked right now. You will land on the preview as soon as it is ready."
                summary={[
                    subjects.join(", "),
                    isMcq ? `${questions} questions` : `${totalMarks} marks`,
                    `${time} min`,
                    difficulty,
                ]}
                steps={[
                    { label: "Reading your subjects", detail: subjects.join(", ") },
                    { label: "Planning the paper", detail: `${difficulty} difficulty · ${time} minute limit` },
                    {
                        label: isMcq ? "Writing questions and options" : "Writing descriptive questions",
                        detail: topicFocus.trim() ? `Focus: ${topicFocus.trim()}` : undefined,
                    },
                    { label: isMcq ? "Checking the answer key" : "Setting the marking scheme" },
                    { label: "Finalising your test" },
                ]}
            />
        );
    }

    return (
        <div className="relative pb-2">
            {!user?.onboardingCompleted &&
                <div onClick={() => router.push('/main/profile/education')} className="mb-5 flex w-fit cursor-pointer items-center gap-2 rounded-md bg-yellow-50 px-3 py-2 text-sm text-black transition-all">
                    <div className="h-2 w-2 animate-pulse rounded-full bg-yellow-300"></div>
                    Add your syllabus in profile for personalized tests <ArrowRight className="h-4" />
                </div>
            }

            <PageHeading
                eyebrow="AI Test Generator"
                icon={Sparkles}
                title="Generate a focused practice test."
                description="Pick a format, add the subjects you want covered, and set the paper length. Each generation uses 1 AI credit."
                aside={
                    <div className="soft-panel flex items-center gap-3">
                        <TicketCheck size={20} className="text-primary" />
                        <div>
                            <p className="text-xs font-bold uppercase opacity-55">Credits left</p>
                            <p className="text-lg font-extrabold">{tokenStatus?.remaining ?? "--"}</p>
                        </div>
                    </div>
                }
            />

            {(!tokenStatus || !hasTokens) && <AiTokenStatus status={tokenStatus} showManualAction />}

            <StepSection
                step={1}
                title="Choose test format"
                description="Objective papers are scored instantly. Written papers are evaluated by AI."
            >
                <div className="grid gap-4 md:grid-cols-2">
                    <OptionCard
                        selected={testFormat === "mcq"}
                        onSelect={() => setTestFormat("mcq")}
                        icon={ListChecks}
                        eyebrow="MCQ Test"
                        title="Objective practice"
                        description="A multiple-choice paper with four options and one correct answer per question."
                    />

                    <OptionCard
                        selected={testFormat === "subjective"}
                        onSelect={() => setTestFormat("subjective")}
                        icon={FileText}
                        eyebrow="Subjective Test"
                        title="Written evaluation"
                        description="Descriptive questions with marks-based AI evaluation and feedback per answer."
                    />
                </div>
            </StepSection>

            <StepSection
                step={2}
                title="Add subjects"
                description="Questions are spread across every subject you add."
                error={!subjects.length ? "Add at least one subject to continue." : subjectError}
                action={
                    <span className="soft-panel px-3! py-2! text-xs font-bold">
                        {subjects.length} added
                    </span>
                }
            >
                <div className="flex items-center gap-3">
                    <input
                        placeholder="Type a subject, e.g. Operating Systems"
                        value={input}
                        aria-invalid={inputState === "rejected"}
                        aria-describedby="subject-input-hint"
                        onChange={(e) => {
                            setInput(e.target.value);
                            if (subjectError) {
                                setSubjectError("");
                            }
                        }}
                        onKeyDown={(e) => e.key === "Enter" && addSubject()}
                        className={`w-full ${shakeInput ? "shake" : ""} ${
                            inputState === "rejected"
                                ? "border-(--chart-wrong)! shadow-[0_0_0_4px_color-mix(in_srgb,var(--chart-wrong)_18%,transparent)]!"
                                : ""
                        }`}
                    />
                    <button
                        className="button-secondary gap-2 shrink-0"
                        onClick={addSubject}
                        disabled={inputState === "empty" || inputState === "rejected"}
                    >
                        <Plus size={17} />
                        Add
                    </button>
                </div>

                <div id="subject-input-hint" className="mt-2 min-h-5 text-xs" aria-live="polite">
                    {inputState === "rejected" && !subjects.includes(trimmedInput) && (
                        <div className="mt-1 flex items-start gap-2 rounded-xl border border-(--chart-wrong) bg-[color-mix(in_srgb,var(--chart-wrong)_12%,transparent)] px-3 py-2.5 text-sm">
                            <CircleAlert size={16} className="mt-0.5 shrink-0 text-(--chart-wrong)" />
                            <div>
                                <p className="font-bold">
                                    &ldquo;{trimmedInput}&rdquo; doesn&apos;t look like a subject, so it can&apos;t be added.
                                </p>
                                <p className="mt-0.5 opacity-70">
                                    Use a real academic subject name such as Mathematics, Physics, or DBMS.
                                </p>
                            </div>
                        </div>
                    )}
                    {inputState === "rejected" && subjects.includes(trimmedInput) && (
                        <p className="flex items-center gap-1.5 font-semibold text-(--chart-wrong)">
                            <CircleAlert size={13} />
                            &ldquo;{trimmedInput}&rdquo; is already in your list.
                        </p>
                    )}
                    {inputState === "duplicate" && (
                        <p className="flex items-center gap-1.5 font-semibold opacity-60">
                            <Check size={13} />
                            Already added
                        </p>
                    )}
                    {inputState === "valid" && (
                        <p className="flex items-center gap-1.5 font-semibold text-primary">
                            <CornerDownLeft size={13} />
                            Press Enter to add &ldquo;{trimmedInput}&rdquo;
                        </p>
                    )}
                    {inputState === "invalid" && (
                        <p className="opacity-50">Keep typing a full subject name, then press Enter.</p>
                    )}
                </div>

                {subjects.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                        {subjects.map((sub) => (
                            <span
                                key={sub}
                                className="inline-flex items-center gap-2 rounded-full bg-primary py-1 pl-3 pr-1 text-xs font-bold text-white"
                            >
                                <Check size={13} strokeWidth={3.5} />
                                {sub}
                                <span
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`Remove ${sub}`}
                                    onClick={() => removeSubject(sub)}
                                    onKeyDown={(event) => {
                                        if (event.key === "Enter" || event.key === " ") {
                                            event.preventDefault();
                                            removeSubject(sub);
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
                            {syllabusSubjects.map((sub) => (
                                <ChoiceChip
                                    key={sub}
                                    label={sub}
                                    selected={subjects.includes(sub)}
                                    onSelect={() => toggleSuggestion(sub)}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </StepSection>

            <StepSection
                step={3}
                title="Set the paper"
                description="Difficulty, length and time limit for this test."
            >
                <div className="grid gap-8 md:grid-cols-3">
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

                    {testFormat === "mcq" ? (
                        <RangeField
                            label="Questions"
                            value={questions}
                            min={5}
                            max={MAX_GENERATED_QUESTIONS}
                            onChange={setQuestions}
                        />
                    ) : (
                        <RangeField
                            label="Total marks"
                            value={totalMarks}
                            min={20}
                            max={MAX_SUBJECTIVE_MARKS}
                            onChange={setTotalMarks}
                        />
                    )}

                    <RangeField
                        label="Time limit"
                        value={time}
                        min={10}
                        max={120}
                        step={5}
                        suffix="min"
                        onChange={setTime}
                    />
                </div>

                {testFormat === "mcq" && (
                    <p className="mt-5 text-sm opacity-65">{secondsPerQuestion} sec per question</p>
                )}
            </StepSection>

            <StepSection
                step={4}
                title="Fine-tune (optional)"
                description="Steer the generator towards specific chapters or topics."
            >
                <input
                    placeholder="Focus topics, e.g. Deadlocks, Paging, Scheduling"
                    value={topicFocus}
                    onChange={(e) => setTopicFocus(e.target.value)}
                    className="w-full"
                />
            </StepSection>

            <BuilderBar
                items={[
                    { label: "Format", value: testFormat === "mcq" ? "MCQ" : "Subjective" },
                    { label: "Subjects", value: subjects.length ? `${subjects.length} added` : "None" },
                    {
                        label: "Paper",
                        value:
                            testFormat === "mcq"
                                ? `${questions} Q · ${time} min · ${difficulty}`
                                : `${totalMarks} marks · ${time} min · ${difficulty}`,
                    },
                ]}
            >
                <button
                    className="button-secondary hidden gap-2 sm:inline-flex"
                    onClick={() => router.push("/main/create/manual")}
                >
                    <ClipboardPen size={18} />
                    Manual test
                </button>

                <button
                    onClick={openGenerateConfirm}
                    disabled={!canGenerate || loading}
                    className={`flex-1 gap-2 lg:flex-none ${(!canGenerate || loading) ? "cursor-not-allowed opacity-50" : ""}`}
                >
                    <Sparkles size={18} />
                    {loading
                        ? "Generating..."
                        : tokenStatusUnavailable || hasTokens
                          ? `Generate ${testFormat === "mcq" ? "MCQ" : "Subjective"} test`
                          : "No credits left"}
                </button>
            </BuilderBar>

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
            <div className="relative max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-(--border) bg-(--bg) p-6 shadow-lg" onClick={(event) => event.stopPropagation()}>
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
                    <p className="text-xs font-extrabold uppercase tracking-wide text-primary">Confirm AI Test</p>
                    <h2 className="mt-2 text-2xl font-extrabold">Check your setup before generating.</h2>
                    <p className="mt-2 text-sm opacity-70">
                        Make sure your subjects, duration, and {testFormat === "mcq" ? "total questions" : "total marks"} are correct before using an AI credit.
                    </p>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Format</p>
                        <p className="font-extrabold">{testFormat === "mcq" ? "MCQ Test" : "Subjective Test"}</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Difficulty</p>
                        <p className="font-extrabold">{difficulty}</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">Duration</p>
                        <p className="font-extrabold">{duration} min</p>
                    </div>
                    <div className="soft-panel">
                        <p className="text-xs opacity-60">{testFormat === "mcq" ? "Total Questions" : "Total Marks"}</p>
                        <p className="font-extrabold">{testFormat === "mcq" ? questions : totalMarks}</p>
                    </div>
                </div>

                <div className="soft-panel mt-3">
                    <p className="text-xs opacity-60">Subjects</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                        {subjects.map((subject) => (
                            <span key={subject} className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                                <Check size={12} strokeWidth={3.5} />
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
