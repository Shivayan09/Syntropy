"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3 } from "lucide-react";

export default function RegisterPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);

    const next = () => setStep((s) => Math.min(s + 1, 3));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    return (
        <section className="min-h-screen flex">

            {/* LEFT SIDE — SAME AS LOGIN */}
            <div className="hidden md:flex w-full md:w-[60%] flex-col justify-center px-14 bg-neutral-100 border-r-2 border-black">

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

                <div className="mt-12 border-2 border-black p-4 bg-white max-w-sm">
                    <p className="text-sm font-bold">
                        No shortcuts. Just results.
                    </p>
                </div>
            </div>

            {/* RIGHT SIDE — MULTI STEP REGISTER */}
            <div className="flex w-full md:w-[40%] items-center justify-center px-6 py-12">

                <div className="w-full max-w-md relative">

                    {/* Offset shadow */}
                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">

                        {/* Header */}
                        <div className="mb-6 text-center">
                            <p className="text-sm font-bold text-primary mb-1">
                                CREATE ACCOUNT
                            </p>
                            <h2 className="text-xl font-extrabold">
                                Step {step} of 3
                            </h2>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-secondary mb-6 border-2 border-black">
                            <div
                                className="h-full bg-primary"
                                style={{ width: `${(step / 3) * 100}%` }}
                            />
                        </div>

                        {/* STEP 1 */}
                        {step === 1 && (
                            <div className="space-y-4">
                                <input type="text" placeholder="Full Name" className="w-full" />
                                <input type="email" placeholder="Email" className="w-full" />
                                <input type="tel" placeholder="Phone Number" className="w-full" />

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
                                />

                                <input
                                    type="password"
                                    placeholder="Confirm Password"
                                    className="w-full"
                                />

                                <div className="flex gap-3">
                                    <button className="button-secondary w-1/2" onClick={back}>
                                        Back
                                    </button>
                                    <button className="w-1/2">
                                        Create Account
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Footer */}
                        <div className="mt-6 border-t-2 border-black pt-4 text-center text-xs">
                            Already have an account?{" "}
                            <span
                                className="text-primary font-bold cursor-pointer"
                                onClick={() => router.push("/login")}
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