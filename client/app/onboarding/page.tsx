"use client";

import { useAuth } from "@/context/AuthContext";
import { FileImage, FileText, SkipForward, Sparkles, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useState, ChangeEvent, DragEvent, useRef } from "react";
import { toast } from "react-toastify";

type Preferences = {
    difficulty: "Easy" | "Medium" | "Hard";
    questionsPerTest: number;
    targetRole: string;
};

type FormDataType = {
    name: string;
    username: string;
    college: string;
    semester: number | "";
    preferences: Preferences;
};

const steps = [
    "Basic Info",
    "Education",
    "Preferences",
    "Syllabus",
    "Finish",
];

const syllabusProcessingSteps = [
    "Your file is being processed",
    "Syllabus is being extracted",
    "Syllabus is being saved in your profile",
];

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const totalSteps = steps.length;
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const { user, getMe } = useAuth();

    const [form, setForm] = useState<FormDataType>({
        name: "",
        username: "",
        college: "",
        semester: "",
        preferences: {
            difficulty: "Medium",
            questionsPerTest: 20,
            targetRole: "",
        },
    });

    const [file, setFile] = useState<File | null>(null);
    const [loading, setLoading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [processingStep, setProcessingStep] = useState(0);
    const initializedFromUser = useRef(false);

    useEffect(() => {
        if (!user || initializedFromUser.current) return;

        setForm((current) => ({
            ...current,
            name: user.name || current.name,
            username: user.username || current.username,
            college: user.college || current.college,
            semester: user.semester || current.semester,
            preferences: {
                difficulty: user.preferences?.difficulty || current.preferences.difficulty,
                questionsPerTest: user.preferences?.questionsPerTest || current.preferences.questionsPerTest,
                targetRole: user.preferences?.targetRole || current.preferences.targetRole,
            },
        }));

        initializedFromUser.current = true;
    }, [user]);

    useEffect(() => {
        if (!loading || step !== 4) return;

        const interval = window.setInterval(() => {
            setProcessingStep((current) =>
                current < syllabusProcessingSteps.length - 1 ? current + 1 : current
            );
        }, 1400);

        return () => window.clearInterval(interval);
    }, [loading, step]);

    const next = () => setStep((s) => Math.min(s + 1, totalSteps));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const acceptFile = (nextFile: File | null) => {
        if (!nextFile) return;
        setFile(nextFile);
        setDragActive(false);
    };

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "semester" ? Number(value) : value,
        }));
    };

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        acceptFile(e.target.files?.[0] || null);
    };

    const handleDragState = (event: DragEvent<HTMLLabelElement>, active: boolean) => {
        event.preventDefault();
        event.stopPropagation();
        setDragActive(active);
    };

    const handleDrop = (event: DragEvent<HTMLLabelElement>) => {
        event.preventDefault();
        event.stopPropagation();
        acceptFile(event.dataTransfer.files?.[0] || null);
    };

    const handlePref = (key: keyof Preferences, value: string | number) => {
        setForm((prev) => ({
            ...prev,
            preferences: {
                ...prev.preferences,
                [key]: value,
            },
        }));
    };

    // ---------------- VALIDATION ----------------
    const validateStep = () => {
        if (step === 1) {
            if (!form.name || !form.username) {
                toast.warn("Fill all fields");
                return false;
            }
        }

        if (step === 2) {
            if (!form.college || !form.semester) {
                toast.warn("Fill all fields");
                return false;
            }
        }

        if (step === 3) {
            if (!form.preferences.targetRole || !form.preferences.questionsPerTest) {
                toast.warn("Fill all fields");
                return false;
            }
        }

        if (step === 4) {
            if (!file) {
                toast.warn("Upload syllabus PDF");
                return false;
            }
        }

        return true;
    };

    // ---------------- NEXT HANDLER ----------------
    const handleNext = async () => {
        if (!validateStep()) {
            return;
        }

        if (step === 3) {
            try {
                setLoading(true);
                const res = await fetch(BACKEND_URL + "/api/user/update-profile",
                    {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                        body: JSON.stringify({
                            name: form.name,
                            username: form.username,
                            college: form.college,
                            semester: Number(form.semester),
                            preferences: {
                                targetRole: form.preferences.targetRole,
                                difficulty: form.preferences.difficulty,
                                questionsPerTest: form.preferences.questionsPerTest,
                            },
                        }),
                    }
                );
                const data = await res.json();
                if (!res.ok) {
                    toast.warn(data.message);
                    return;
                }
                toast.success("Profile updated");
            } catch (err) {
                console.error(err);
                toast.error("Profile update failed");
                return;
            } finally {
                setLoading(false);
            }
        }
        if (step === 4) {
            try {
                setProcessingStep(0);
                setLoading(true);

                const fd = new FormData();
                fd.append("file", file!);

                const res = await fetch(
                    BACKEND_URL + "/api/syllabus/upload",
                    {
                        method: "POST",
                        body: fd,
                        credentials: "include",
                    }
                );
                if (!res.ok) {
                    toast.error("Upload failed");
                    return;
                }
                toast.success("Syllabus uploaded");
            } catch (err) {
                console.error(err);
                toast.error("Upload failed");
                return;
            } finally {
                setLoading(false);
            }
        }

        next();
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/user/update-profile",
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include",
                    body: JSON.stringify({
                        onboardingCompleted: true,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message);
                return;
            } else {
                toast.success("Onboarding completed");
                await getMe();
                router.replace('/main/dashboard');
            }
        } catch (err) {
            console.error(err);
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex">

            {/* LEFT PANEL */}
            <div className="hidden md:flex w-[60%] py-5 flex-col justify-center px-14 bg-secondary border-r-2 border-black">

                <div className="flex gap-1 mb-3">
                    <Image src="/logo.png" alt="Syntropy logo" width={28} height={28} className="h-7 w-auto" />
                    <p className="text-sm font-bold text-primary">syntropy</p>
                </div>

                <h1 className="text-5xl font-extrabold leading-tight mb-7">
                    Set things up <span className="text-primary">once, properly</span>
                </h1>

                <div className="space-y-4">
                    {steps.map((label, index) => {
                        const stepIndex = index + 1;
                        const active = step === stepIndex;
                        const completed = step > stepIndex;

                        return (
                            <div
                                key={label}
                                style={{
                                    backgroundColor: active
                                        ? "var(--primary)"
                                        : "var(--bg-secondary)",
                                    color: active ? "white" : "var(--text)",
                                }}
                                className="flex card h-18 items-center gap-4 p-3 border"
                            >
                                <div
                                    style={{
                                        backgroundColor: completed
                                            ? "var(--primary)"
                                            : "transparent",
                                        color: completed ? "white" : "inherit",
                                    }}
                                    className="w-7 h-7 flex items-center justify-center border"
                                >
                                    {completed ? "✓" : stepIndex}
                                </div>

                                <div>
                                    <p className="font-bold">{label}</p>
                                    <p className="text-xs opacity-70">
                                        {stepIndex === 1 && "Tell us about you"}
                                        {stepIndex === 2 && "Your academic details"}
                                        {stepIndex === 3 && "Customize experience"}
                                        {stepIndex === 4 && "Upload syllabus"}
                                        {stepIndex === 5 && "Finalize setup"}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* RIGHT PANEL */}
            <div className="flex w-full md:w-[40%] items-center justify-center px-6 py-12">

                <div className="absolute top-10 bg-yellow-50 dark:bg-white/5 flex items-center gap-2 border border-black/20 rounded-full text-xs px-5 py-1">
                    <div className="h-2 w-2 rounded-full bg-yellow-400 animate-pulse"></div>
                    <p className="opacity-70">You can change these later anytime in Profile Settings</p>
                </div>

                <div className="w-full max-w-md relative">

                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>


                    <div className="card">
                        <div onClick={() => {router.push('/main/dashboard'); toast.warn("Onboarding skipped")}} className="flex items-center gap-1 w-fit ml-auto mb-3 text-yellow-500 px-3 py-1.5 cursor-pointer text-sm">
                            <SkipForward className="h-4"/>
                            Skip onboarding
                        </div>
                        

                        {/* HEADER */}
                        <div className="mb-8 text-center">
                            <p className="text-sm font-bold text-primary mb-2">
                                STEP {step} / {totalSteps}
                            </p>
                            <h2 className="text-2xl font-extrabold">
                                {steps[step - 1]}
                            </h2>
                        </div>

                        {/* FORM */}
                        <div className="space-y-5">

                            {step === 1 && (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Enter your full name:</p>
                                        <input name="name" value={form.name} placeholder="Full Name" onChange={handleChange} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Set a username:</p>
                                        <input name="username" value={form.username} placeholder="username" onChange={handleChange} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Enter your college:</p>
                                        <input name="college" value={form.college} placeholder="College name" onChange={handleChange} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Current semester:</p>
                                        <input name="semester" value={form.semester} placeholder="Semester" type="number" onChange={handleChange} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Enter your target role:</p>
                                        <input value={form.preferences.targetRole} placeholder="Target role" onChange={(e) => handlePref("targetRole", e.target.value)} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Preffered test difficulty:</p>
                                        <select value={form.preferences.difficulty} className="w-full" onChange={(e) => handlePref("difficulty", e.target.value)}>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Preffered questions per test:</p>
                                        <input type="number" value={form.preferences.questionsPerTest} className="w-full" placeholder="Questions" onChange={(e) => handlePref("questionsPerTest", Number(e.target.value))} />
                                    </div>

                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col gap-5">
                                    {loading ? (
                                        <div className="card2 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="grid h-12 w-12 shrink-0 place-items-center border border-black bg-primary text-white">
                                                    <Sparkles size={22} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold uppercase text-primary">Preparing your syllabus</p>
                                                    <h3 className="mt-1 text-xl font-extrabold">
                                                        {syllabusProcessingSteps[processingStep]}
                                                    </h3>
                                                    <p className="mt-2 text-sm opacity-70">
                                                        Sit tight while we turn your upload into a clean, editable syllabus structure.
                                                    </p>
                                                </div>
                                            </div>

                                            <div className="space-y-3">
                                                <div className="h-3 border border-(--border) bg-(--surface)">
                                                    <div
                                                        className="h-full bg-primary transition-all duration-700"
                                                        style={{ width: `${((processingStep + 1) / syllabusProcessingSteps.length) * 100}%` }}
                                                    />
                                                </div>

                                                <div className="grid gap-2">
                                                    {syllabusProcessingSteps.map((message, index) => {
                                                        const completed = index < processingStep;
                                                        const active = index === processingStep;

                                                        return (
                                                            <div
                                                                key={message}
                                                                className={`flex items-center gap-3 border px-3 py-2 text-sm transition ${active
                                                                    ? "border-black bg-primary text-white shadow-[3px_3px_0px_black]"
                                                                    : completed
                                                                        ? "border-(--border) bg-(--bg-secondary)"
                                                                        : "border-(--border) bg-(--surface) opacity-60"
                                                                    }`}
                                                            >
                                                                <span className={`h-2.5 w-2.5 rounded-full ${active ? "bg-white animate-pulse" : completed ? "bg-primary" : "bg-(--border)"}`} />
                                                                <span className="font-semibold">{message}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <label
                                                htmlFor="onboarding-syllabus-upload"
                                                onDragEnter={(event) => handleDragState(event, true)}
                                                onDragOver={(event) => handleDragState(event, true)}
                                                onDragLeave={(event) => handleDragState(event, false)}
                                                onDrop={handleDrop}
                                                className={`block cursor-pointer border p-5 transition ${dragActive
                                                    ? "bg-primary text-white shadow-[6px_6px_0px_black]"
                                                    : "bg-(--bg-secondary) shadow-[4px_4px_0px_black]"
                                                    }`}
                                            >
                                                <input
                                                    id="onboarding-syllabus-upload"
                                                    type="file"
                                                    accept=".pdf,image/*"
                                                    onChange={handleFileChange}
                                                    className="hidden"
                                                />

                                                <div className="flex items-start gap-4">
                                                    <div className={`grid h-12 w-12 shrink-0 place-items-center border ${dragActive ? "border-white bg-white text-black" : "border-(--border) bg-(--surface) text-primary"}`}>
                                                        <UploadCloud size={22} />
                                                    </div>

                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-sm font-bold uppercase opacity-70">Syllabus Upload</p>
                                                        <h3 className="mt-1 text-xl font-extrabold">Drop your PDF or image here</h3>
                                                        <p className="mt-2 text-sm opacity-75">
                                                            Drag and drop your syllabus, or tap to browse files from your device.
                                                        </p>

                                                        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold uppercase">
                                                            <span className={`inline-flex items-center gap-2 border px-3 py-1 ${dragActive ? "border-white/60 bg-white/10" : "border-(--border) bg-(--surface)"}`}>
                                                                <FileText size={14} />
                                                                PDF
                                                            </span>
                                                            <span className={`inline-flex items-center gap-2 border px-3 py-1 ${dragActive ? "border-white/60 bg-white/10" : "border-(--border) bg-(--surface)"}`}>
                                                                <FileImage size={14} />
                                                                Image
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </label>

                                            {file && (
                                                <div className="border border-(--border) bg-(--bg-secondary) p-4 shadow-[4px_4px_0px_black]">
                                                    <p className="text-xs font-bold uppercase text-primary">Selected file</p>
                                                    <p className="mt-1 truncate text-sm font-semibold">{file.name}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {step === 5 && (
                                <div className="text-center bg-primary py-3 text-white rounded-lg">
                                    <p className="font-bold">All set! Good to go</p>
                                </div>
                            )}

                            {/* ACTIONS */}
                            <div className="flex justify-between pt-4">
                                {step > 1 ? (
                                    <button className="button-secondary" onClick={back}>
                                        Back
                                    </button>
                                ) : <div />}

                                {step < totalSteps ? (
                                    <button onClick={handleNext} disabled={loading}>
                                        {loading ? "Processing..." : "Next"}
                                    </button>
                                ) : (
                                    <button onClick={handleSubmit} disabled={loading}>
                                        {loading ? "Processing..." : "Enter"}
                                    </button>
                                )}
                            </div>

                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
