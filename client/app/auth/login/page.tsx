"use client";

import { useRouter } from "next/navigation";
import { Target, TrendingUp, BarChart3 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    return (
        <section className="min-h-screen flex">
            <div className="hidden md:flex w-full md:w-[60%] flex-col justify-center px-14 bg-neutral-100 border-r-2 border-black">

                <div className="flex gap-1 mb-5">
                    <img src="/logo.png" alt="" className="h-7" />
                    <p className="text-sm font-bold text-primary">
                        TESTIFY
                    </p>
                </div>

                <h1 className="text-5xl font-extrabold leading-tight mb-6">
                    Stop guessing <br /> <span className="text-primary">Start improving</span>
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
            <div className="flex w-full md:w-[40%] items-center justify-center px-6 py-12">

                <div className="w-full max-w-md relative">
                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">
                        <div className="mb-8 text-center">
                            <p className="text-sm font-bold text-primary mb-2">
                                WELCOME BACK
                            </p>
                            <h2 className="text-2xl font-extrabold">
                                Login to continue
                            </h2>
                        </div>
                        <form className="space-y-5">

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    placeholder="you@example.com"
                                    className="w-full"
                                />
                            </div>

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    Password
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••"
                                    className="w-full"
                                />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span
                                    className="text-primary cursor-pointer font-semibold"
                                    onClick={() => router.push("/forgot-password")}
                                >
                                    Forgot password?
                                </span>
                            </div>

                            <button className="w-full">
                                Login
                            </button>
                        </form>
                        <div className="my-6 border-t-2 border-black"></div>
                        <p className="text-sm text-center">
                            New here?{" "}
                            <span className="text-primary font-bold cursor-pointer" onClick={() => router.push("/auth/register")}>
                                Create account
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}