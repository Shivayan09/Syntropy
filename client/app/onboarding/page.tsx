"use client";

import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, ChangeEvent } from "react";
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

export default function Onboarding() {
    const [step, setStep] = useState(1);
    const totalSteps = steps.length;
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const { getMe } = useAuth();

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

    const next = () => setStep((s) => Math.min(s + 1, totalSteps));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: name === "semester" ? Number(value) : value,
        }));
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
                    <img src="/logo.png" className="h-7" />
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
                                        <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Set a username:</p>
                                        <input name="username" placeholder="username" onChange={handleChange} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {step === 2 && (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Enter your college:</p>
                                        <input name="college" placeholder="College name" onChange={handleChange} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Current semester:</p>
                                        <input name="semester" placeholder="Semester" type="number" onChange={handleChange} className="w-full" />
                                    </div>
                                </div>
                            )}

                            {step === 3 && (
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Enter your target role:</p>
                                        <input placeholder="Target role" onChange={(e) => handlePref("targetRole", e.target.value)} className="w-full" />
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Preffered test difficulty:</p>
                                        <select className="w-full" onChange={(e) => handlePref("difficulty", e.target.value)}>
                                            <option>Easy</option>
                                            <option>Medium</option>
                                            <option>Hard</option>
                                        </select>
                                    </div>
                                    <div>
                                        <p className="font-semibold mb-2 text-lg">Preffered questions per test:</p>
                                        <input type="number" className="w-full" placeholder="Questions" onChange={(e) => handlePref("questionsPerTest", Number(e.target.value))} />
                                    </div>

                                </div>
                            )}

                            {step === 4 && (
                                <div className="flex flex-col gap-5">
                                    <input type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} />
                                    {file && <p className="text-sm">{file.name}</p>}
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