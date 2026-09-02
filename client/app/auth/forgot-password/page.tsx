"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Target, BarChart3 } from "lucide-react";
import { useState } from "react";
import { toast } from "react-toastify";

export default function ForgotPassword() {

    const router = useRouter();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong";

    const handleForgotPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/auth/forgot-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message);
                return;
            }
            toast.success("Password reset link sent to your email");
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
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
                    Stop guessing <br /> <span className="text-primary">Start improving</span>
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

            </div>

            <div className="flex w-full md:w-[40%] items-center justify-center px-6 py-12">
                <div className="w-full max-w-md relative">
                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">
                        <div className="mb-8 text-center">
                            <p className="text-sm font-bold text-primary mb-2">
                                PASSWORD RECOVERY
                            </p>
                            <h2 className="text-2xl font-extrabold">
                                Reset your password
                            </h2>
                        </div>

                        <form className="space-y-5" onSubmit={handleForgotPassword}>

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    Email
                                </label>
                                <input type="email" placeholder="you@example.com" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <button disabled={loading} className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} type="submit">
                                {loading ? "Sending..." : "Send Reset Link"}
                            </button>
                        </form>

                        <div className="my-6 border-t-2 border-black"></div>

                        <p className="text-sm text-center">
                            Remembered your password?{" "}
                            <span className="text-primary font-bold cursor-pointer" onClick={() => router.push("/auth/login")}>
                                Back to login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
