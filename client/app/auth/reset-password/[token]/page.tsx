"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { Target, BarChart3, Eye, EyeOff } from "lucide-react";
import { toast } from "react-toastify";
import axios from "axios";

export default function ResetPasswordPage({
    params,
}: {
    params: Promise<{ token: string }>;
}) {
    const { token } = use(params);
    const router = useRouter();

    const [newPassword, setNewPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!newPassword) {
            toast.warn("Please enter a new password!");
            return;
        }

        // if (newPassword.length < 6) {
        //     toast.warn("Password must be at least 6 characters!");
        //     return;
        // }

        try {
            setLoading(true);

            const { data } = await axios.post(
                BACKEND_URL + "/api/auth/reset-password",
                {
                    resetToken: token,
                    newPassword,
                }
            );

            if (data.success) {
                toast.success("Password reset successful");
                router.push("/auth/login");
            } else {
                toast.error(data.message);
            }
        } catch (error: unknown) {
            if (error instanceof Error) {
                toast.error(error.message);
            } else {
                toast.error("Something went wrong");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="h-screen flex">
            {/* LEFT SIDE (UNCHANGED) */}
            <div className="hidden md:flex w-full md:w-[60%] flex-col justify-center px-14 bg-secondary border-r-2 border-black">

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

                <div className="mt-12 border-2 border-black p-4 bg-primary text-white max-w-sm">
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
                        <div className="mb-8 text-center">
                            <p className="text-sm font-bold text-primary mb-2">
                                PASSWORD RESET
                            </p>
                            <h2 className="text-2xl font-extrabold">
                                Set a new password
                            </h2>
                        </div>

                        <form className="space-y-5" onSubmit={handleSubmit}>

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    New Password
                                </label>

                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter new password"
                                        className="w-full pr-10"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                    />

                                    <span
                                        className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </span>
                                </div>
                            </div>

                            <button
                                disabled={loading}
                                className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                type="submit"
                            >
                                {loading ? "Resetting..." : "Reset Password"}
                            </button>
                        </form>

                        <div className="my-6 border-t-2 border-black"></div>

                        <p className="text-sm text-center">
                            Back to{" "}
                            <span
                                className="text-primary font-bold cursor-pointer"
                                onClick={() => router.push("/auth/login")}
                            >
                                login
                            </span>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}