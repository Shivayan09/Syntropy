"use client";

import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import { Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const { getMe } = useAuth();
    const [loading, setLoading] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpVerified, setOtpVerified] = useState(false);
    const [passwordFeedback, setPasswordFeedback] = useState<string[]>([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const getErrorMessage = (err: unknown) => err instanceof Error ? err.message : "Something went wrong";
    const next = () => setStep((s) => Math.min(s + 1, 3));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const validatePassword = (value: string) => {
        let messages: string[] = [];
        if (value.length < 8) messages.push("Minimum 8 characters");
        if (!/[A-Z]/.test(value)) messages.push("Add uppercase letter");
        if (!/[a-z]/.test(value)) messages.push("Add lowercase letter");
        if (!/[0-9]/.test(value)) messages.push("Add a number");
        if (!/[!@#$%^&*]/.test(value)) messages.push("Add special character");
        return messages;
    };

    const handleFormChange = (field: keyof typeof form, value: string) => {
        setForm({ ...form, [field]: value });
        if (field === "email") {
            setOtp("");
            setOtpVerified(false);
        }
        if (field === "password") {
            setPasswordFeedback(validatePassword(value));
        }
    };

    const sendOtp = async () => {
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/auth/register/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message);
                return;
            }
            toast.success(data.message || "OTP sent");
            next();
        } catch (err: unknown) {
            console.error(err);
            toast.error("Failed to send OTP");
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        // try {
        //     setLoading(true);
        //     const res = await fetch(BACKEND_URL + "/api/auth/register/verify-otp", {
        //         method: "POST",
        //         headers: {
        //             "Content-Type": "application/json"
        //         },
        //         credentials: "include",
        //         body: JSON.stringify({
        //             email: form.email,
        //             otp
        //         })
        //     });
        //     const data = await res.json();
        //     if (!res.ok) {
        //         toast.warn(data.message);
        //         return;
        //     }
        //     setOtpVerified(true);
        //     toast.success(data.message || "OTP verified");
        //     next();
        // } catch (err: unknown) {
        //     console.error(err);
        //     toast.error("Failed to verify OTP");
        // } finally {
        //     setLoading(false);
        // }
        next();
    };

    const handleRegister = async () => {
        if (!otpVerified) {
            toast.warn("Please verify your email OTP first");
            return;
        }

        if (form.password !== form.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            setLoading(true);

            const res = await fetch(BACKEND_URL + "/api/auth/register", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber,
                    password: form.password
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message)
                return;
            } else {
                await getMe();
                toast.success("Account created");
                router.push("/onboarding");
            }
        } catch (err: unknown) {
            console.error(err);
            toast.error(getErrorMessage(err))
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-screen flex">

            <div className="hidden md:flex w-full md:w-[60%] flex-col justify-center px-14 bg-secondary border-r-2 border-black">

                <div className="flex gap-1 mb-5">
                    <Image src="/logo.png" alt="Syntropy logo" width={28} height={28} className="h-7 w-auto" />
                    <p className="text-sm font-bold text-primary">
                        syntropy
                    </p>
                </div>

                <h1 className="text-5xl font-extrabold leading-tight mb-6">
                    Stop guessing <br />
                    <span className="text-primary">Start improving</span>
                </h1>

                <p className="text-gray-700 mb-10">
                    Most students practice blindly. syntropy shows you exactly where you stand and what to fix.
                </p>

                <div className="space-y-6">

                    <div className="flex items-center gap-5">
                        <div className="flex items-start gap-4">
                            <Target />
                            <div>
                                <p className="font-bold">Target Weak Areas</p>
                                <p className="text-sm text-gray-600">
                                    Identify exactly where you&apos;re losing marks.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <BarChart3 />
                            <div>
                                <p className="font-bold">Clear Analytics</p>
                                <p className="text-sm text-gray-600">
                                    Understand your performance, not guess it.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 mt-10">
                        <div className="flex items-start gap-4">
                            <Target />
                            <div>
                                <p className="font-bold">Target Weak Areas</p>
                                <p className="text-sm text-gray-600">
                                    Identify exactly where you&apos;re losing marks.
                                </p>
                            </div>
                        </div>

                        <div className="flex items-start gap-4">
                            <BarChart3 />
                            <div>
                                <p className="font-bold">Clear Analytics</p>
                                <p className="text-sm text-gray-600">
                                    Understand your performance, not guess it.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 border-2 border-black p-4 bg-primary max-w-sm">
                    <p className="text-sm font-bold">
                        No shortcuts. Just results.
                    </p>
                </div>
            </div>

            <div className="flex w-full md:w-[40%] items-center justify-center px-6 py-12">

                <div className="w-full max-w-md relative">

                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">

                        <div className="mb-6 text-center">
                            <p className="text-sm font-bold text-primary mb-1">
                                CREATE ACCOUNT
                            </p>
                            <h2 className="text-xl font-extrabold">
                                Step {step} of 3
                            </h2>
                        </div>

                        <div className="w-full h-2 bg-secondary mb-6 border-2 border-black">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        {step === 1 && (
                            <div className="space-y-4">

                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full"
                                    value={form.name}
                                    onChange={(e) => handleFormChange("name", e.target.value)}
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full"
                                    value={form.email}
                                    onChange={(e) => handleFormChange("email", e.target.value)}
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full"
                                    value={form.phoneNumber}
                                    onChange={(e) => handleFormChange("phoneNumber", e.target.value)}
                                />

                                <button
                                    className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                    onClick={sendOtp}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Continue"}
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">

                                <p className="text-sm text-gray-600">
                                    Enter the verification code sent to your email.
                                </p>

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="w-full text-center tracking-widest"
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value)}
                                />

                                <div className="flex gap-3">
                                    <button className="button-secondary w-1/2" onClick={back}>
                                        Back
                                    </button>
                                    <button
                                        className={`w-1/2 ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={verifyOtp}
                                        disabled={loading}
                                    >
                                        {loading ? "Verifying..." : "Verify"}
                                    </button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-4">

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Password"
                                        className="w-full pr-10"
                                        value={form.password}
                                        onChange={(e) => handleFormChange("password", e.target.value)}
                                    />

                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowPassword(!showPassword)}>
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </div>
                                </div>
                                <div className="text-sm mt-2">
                                    {form.password.length > 0 && (
                                        passwordFeedback.length === 0 ? (
                                            <p className="text-green-600 font-medium">
                                                Strong password
                                            </p>
                                        ) : (
                                            passwordFeedback.map((msg, i) => (
                                                <p key={i} className="text-red-500">
                                                    • {msg}
                                                </p>
                                            ))
                                        )
                                    )}
                                </div>

                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        placeholder="Confirm Password"
                                        className="w-full pr-10"
                                        value={form.confirmPassword}
                                        onChange={(e) => handleFormChange("confirmPassword", e.target.value)}
                                    />

                                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                        {showConfirmPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button className="button-secondary w-1/2" onClick={back}>
                                        Back
                                    </button>

                                    <button
                                        className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={handleRegister}
                                        disabled={loading}
                                    >
                                        {loading ? "Creating..." : "Create Account"}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="mt-6 border-t-2 border-black pt-4 text-center text-xs">
                            Already have an account?{" "}
                            <span
                                className="text-primary font-bold cursor-pointer"
                                onClick={() => router.push("/auth/login")}
                            >
                                Login
                            </span>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
}
