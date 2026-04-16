"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3 } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const { getMe } = useAuth();
    const [loading, setLoading] = useState(false);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const next = () => setStep((s) => Math.min(s + 1, 3));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const handleRegister = async () => {
        if (form.password !== form.confirmPassword) {
            alert("Passwords do not match");
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
                toast.success("Account created")
                router.push("/main/dashboard");
            }
        } catch (err: any) {
            console.error(err);
            toast.error(err)
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-screen flex">

            {/* LEFT SIDE */}
            <div className="hidden md:flex w-full md:w-[60%] flex-col justify-center px-14 bg-secondary border-r-2 border-black">

                <div className="flex gap-1 mb-5">
                    <img src="/logo.png" alt="" className="h-7" />
                    <p className="text-sm font-bold text-primary">
                        TESTIFY
                    </p>
                </div>

                <h1 className="text-5xl font-extrabold leading-tight mb-6">
                    Stop guessing <br />
                    <span className="text-primary">Start improving</span>
                </h1>

                <p className="text-gray-700 mb-10">
                    Most students practice blindly. Testify shows you exactly where you stand and what to fix.
                </p>

                <div className="space-y-6">

                    <div className="flex items-center gap-5">
                        <div className="flex items-start gap-4">
                            <Target />
                            <div>
                                <p className="font-bold">Target Weak Areas</p>
                                <p className="text-sm text-gray-600">
                                    Identify exactly where you're losing marks.
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
                                    Identify exactly where you're losing marks.
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

            {/* RIGHT SIDE */}
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

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-4">

                                <input
                                    type="text"
                                    placeholder="Full Name"
                                    className="w-full"
                                    value={form.name}
                                    onChange={(e)=>setForm({...form, name: e.target.value})}
                                />

                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full"
                                    value={form.email}
                                    onChange={(e)=>setForm({...form, email: e.target.value})}
                                />

                                <input
                                    type="tel"
                                    placeholder="Phone Number"
                                    className="w-full"
                                    value={form.phoneNumber}
                                    onChange={(e)=>setForm({...form, phoneNumber: e.target.value})}
                                />

                                <button className="w-full" onClick={next}>
                                    Continue
                                </button>
                            </div>
                        )}

                        {/* STEP 2 */}
                        {step === 2 && (
                            <div className="space-y-4">

                                <p className="text-sm text-gray-600">
                                    Enter the verification code sent to your email.
                                </p>

                                <input
                                    type="text"
                                    placeholder="Enter OTP"
                                    className="w-full text-center tracking-widest"
                                />

                                <div className="flex gap-3">
                                    <button className="button-secondary w-1/2" onClick={back}>
                                        Back
                                    </button>
                                    <button className="w-1/2" onClick={next}>
                                        Verify
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3 */}
                        {step === 3 && (
                            <div className="space-y-4">

                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full"
                                    value={form.password}
                                    onChange={(e)=>setForm({...form, password: e.target.value})}
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="w-full"
                                    value={form.confirmPassword}
                                    onChange={(e)=>setForm({...form, confirmPassword: e.target.value})}
                                />

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