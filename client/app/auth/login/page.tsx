"use client";

import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Target, BarChart3, Globe, X } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { toast } from "react-toastify";

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
    const [googleReady, setGoogleReady] = useState(() => typeof window !== "undefined" && Boolean(window.google));
    const [googleButtonMounted, setGoogleButtonMounted] = useState(false);
    const [googleTermsOpen, setGoogleTermsOpen] = useState(false);
    const [googleTermsAccepted, setGoogleTermsAccepted] = useState(false);
    const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : "Something went wrong";

    const submitGoogleLogin = async (idToken: string, acceptedTerms = false) => {
        const res = await fetch(BACKEND_URL + "/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ idToken, acceptedTerms }),
        });
        const data = await res.json();
        return { res, data };
    };

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
                router.push("/main/dashboard");
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
            const { res, data } = await submitGoogleLogin(credentialResponse.credential);
            if (!res.ok) {
                if (data.requiresTermsAcceptance) {
                    setPendingGoogleCredential(credentialResponse.credential);
                    setGoogleTermsAccepted(false);
                    setGoogleTermsOpen(true);
                    return;
                }
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

    const handleGoogleTermsConfirm = async () => {
        if (!pendingGoogleCredential) {
            setGoogleTermsOpen(false);
            return;
        }
        if (!googleTermsAccepted) {
            toast.warn("Please accept the Terms and Conditions to continue");
            return;
        }

        try {
            setGoogleLoading(true);
            const { res, data } = await submitGoogleLogin(pendingGoogleCredential, true);
            if (!res.ok) {
                toast.warn(data.message || "Google sign-in failed");
                return;
            }

            setGoogleTermsOpen(false);
            setPendingGoogleCredential(null);
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
    };

    useEffect(() => {
        if (!googleReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current || !window.google) {
            return;
        }

        setGoogleButtonMounted(false);
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

        requestAnimationFrame(() => setGoogleButtonMounted(true));
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
                                <div className="relative mx-auto w-full max-w-90 rounded-[28px] border border-black/10 bg-white shadow-[3px_3px_0px_rgba(0,0,0,0.08)]">
                                    {!googleButtonMounted && (
                                        <div
                                            aria-hidden="true"
                                            className="absolute inset-0 flex min-h-10 items-center justify-center rounded-full text-sm font-semibold text-gray-700"
                                        >
                                            <div className="flex h-10 w-full items-center justify-center gap-3 rounded-full border border-black/10 bg-white px-4">
                                                <Globe size={18} className="text-gray-700" />
                                                <span>{googleReady ? "Preparing Google sign-in..." : "Loading Google sign-in..."}</span>
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        ref={googleButtonRef}
                                        className={`min-h-10 w-full overflow-hidden rounded-full ${googleLoading ? "pointer-events-none opacity-70" : ""} ${googleButtonMounted ? "opacity-100" : "opacity-0"}`}
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
            {googleTermsOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setGoogleTermsOpen(false)} />
                    <div className="relative w-full max-w-md border border-primary bg-surface p-6 shadow-lg" onClick={(e) => e.stopPropagation()}>
                        <div
                            onClick={() => setGoogleTermsOpen(false)}
                            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center cursor-pointer"
                            aria-label="Close terms prompt"
                        >
                            <X size={20} />
                        </div>

                        <div className="pr-10">
                            <p className="text-sm font-bold text-primary">NEW GOOGLE ACCOUNT</p>
                            <h3 className="mt-2 text-xl font-extrabold">Accept terms to create your account</h3>
                            <p className="mt-2 text-sm text-gray-600">
                                Your Google sign-in looks like a first-time account creation. Please review and accept the terms before we continue.
                            </p>
                        </div>

                        <label className="mt-5 gap-3 text-sm">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 shrink-0"
                                checked={googleTermsAccepted}
                                onChange={(e) => setGoogleTermsAccepted(e.target.checked)}
                            />
                            <span>
                                I agree to the{" "}
                                <Link href="/terms-and-conditions" target="_blank" className="font-bold text-primary underline">
                                    Terms and Conditions
                                </Link>
                                .
                            </span>
                        </label>

                        <div className="mt-6 flex gap-3">
                            <button
                                type="button"
                                onClick={() => setGoogleTermsOpen(false)}
                                className="button-secondary w-1/2"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleGoogleTermsConfirm}
                                disabled={googleLoading || !googleTermsAccepted}
                                className={`w-1/2 ${googleLoading || !googleTermsAccepted ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                {googleLoading ? "Continuing..." : "Continue"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}
