"use client";

import Image from "next/image";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Target, BarChart3 } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";
import { div } from "framer-motion/client";

type GoogleCredentialResponse = {
    credential?: string;
};

declare global {
    interface Window {
        google?: {
            accounts: {
                id: {
                    initialize: (options: {
                        client_id: string;
                        callback: (response: GoogleCredentialResponse) => void;
                        ux_mode?: "popup";
                    }) => void;
                    renderButton: (
                        element: HTMLElement,
                        options: {
                            type?: "standard";
                            theme?: "outline" | "filled_blue" | "filled_black";
                            text?: "signin_with" | "signup_with" | "continue_with" | "signin";
                            shape?: "pill" | "rectangular";
                            size?: "large" | "medium" | "small";
                            width?: number;
                            logo_alignment?: "left" | "center";
                        }
                    ) => void;
                    prompt: () => void;
                };
            };
        };
    }
}

export default function LoginPage() {

    const router = useRouter();
    const { user, getMe } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong";

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, password }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message)
                return;
            } else {
                await getMe();
                toast.success("Logged in successfully");
                if (!user?.onboardingCompleted) {
                    router.push('/onboarding');
                } else {
                    router.push("/main/dashboard");
                }
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useEffectEvent(async (credentialResponse: GoogleCredentialResponse) => {
        if (!credentialResponse.credential) {
            toast.error("Google sign-in did not return a valid credential.");
            return;
        }
        try {
            setGoogleLoading(true);
            const res = await fetch(BACKEND_URL + "/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ idToken: credentialResponse.credential }),
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message || "Google sign-in failed");
                return;
            }
            await getMe();
            toast.success("Logged in with Google");
            if (!user?.onboardingCompleted) {
                router.push('/onboarding');
            } else {
                router.push("/main/dashboard");
            }
        } catch (error: unknown) {
            console.error(error);
            toast.error(getErrorMessage(error));
        } finally {
            setGoogleLoading(false);
        }
    });

    useEffect(() => {
        if (!googleReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current || !window.google) {
            return;
        }

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
            client_id: GOOGLE_CLIENT_ID,
            callback: handleGoogleLogin,
            ux_mode: "popup",
        });
        const buttonWidth = Math.min(360, googleButtonRef.current.clientWidth || 360);
        window.google.accounts.id.renderButton(googleButtonRef.current, {
            type: "standard",
            theme: "outline",
            text: "continue_with",
            shape: "pill",
            size: "large",
            width: buttonWidth,
            logo_alignment: "left",
        });
    }, [GOOGLE_CLIENT_ID, googleReady]);

    return (
        <section className="h-screen flex">
            {GOOGLE_CLIENT_ID ? (
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onLoad={() => setGoogleReady(true)}
                />
            ) : null}
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
                <div className="mt-12 border-2 border-black p-4 bg-primary text-white max-w-sm">
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
                        <form className="space-y-5" onSubmit={handleLogin}>

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    Email
                                </label>
                                <input type="email" placeholder="you@example.com" className="w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
                            </div>

                            <div>
                                <label className="text-sm font-bold mb-1 block">
                                    Password
                                </label>
                                <input type="password" placeholder="••••••••" className="w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
                            </div>

                            <div className="flex justify-between text-sm">
                                <span className="text-primary cursor-pointer font-semibold" onClick={() => router.push("/auth/forgot-password")}>
                                    Forgot password?
                                </span>
                            </div>

                            <button disabled={loading} className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`} type="submit">
                                Login
                            </button>
                        </form>
                        <div className="mt-6 mb-4 flex items-center gap-3">
                            <div className="h-px flex-1 bg-black"></div>
                            <span className="text-xs font-bold tracking-[0.24em] text-gray-500">OR</span>
                            <div className="h-px flex-1 bg-black"></div>
                        </div>
                        {GOOGLE_CLIENT_ID ? (
                            <div className="flex items-center justify-center">
                                <div className="rounded-[28px] border border-black/10 bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.08)]">
                                    <div
                                        ref={googleButtonRef}
                                        className={`min-h-10 w-full overflow-hidden rounded-full ${googleLoading ? "pointer-events-none opacity-70" : ""}`}
                                    />
                                </div>
                            </div>
                        ) : (
                            <p className="rounded-3xl border border-dashed border-black/20 bg-secondary px-4 py-3 text-center text-sm text-gray-600">
                                Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to enable Google sign-in.
                            </p>
                        )}
                        <p className="text-sm text-center mt-5">
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
