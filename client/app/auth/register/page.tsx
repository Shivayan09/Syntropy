"use client";

import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Globe, X } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";
import AuthAside from "@/components/auth/AuthAside";
import { Eye, EyeOff } from "lucide-react";
import { useEffect, useEffectEvent, useRef, useState } from "react";

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

// Google renders the button at a fixed pixel width, so it has to match the
// container or the button sits off-centre inside it on narrow screens.
const measureGoogleButtonWidth = (element: HTMLElement) => {
    const available = Math.floor(element.getBoundingClientRect().width);
    return Math.min(360, available > 0 ? available : 360);
};

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
    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [googleReady, setGoogleReady] = useState(() => typeof window !== "undefined" && Boolean(window.google));
    const [googleButtonMounted, setGoogleButtonMounted] = useState(false);
    const [googleTermsOpen, setGoogleTermsOpen] = useState(false);
    const [googleTermsAccepted, setGoogleTermsAccepted] = useState(false);
    const [pendingGoogleCredential, setPendingGoogleCredential] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: "",
        email: "",
        phoneNumber: "",
        password: "",
        confirmPassword: ""
    });

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    const googleButtonRef = useRef<HTMLDivElement | null>(null);
    const getErrorMessage = (err: unknown) => {
        if (err instanceof DOMException && err.name === "AbortError") {
            return "OTP request timed out. Please continue using Google to register.";
        }
        return err instanceof Error ? err.message : "Something went wrong";
    };
    const next = () => setStep((s) => Math.min(s + 1, 3));
    const back = () => setStep((s) => Math.max(s - 1, 1));

    const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = 30000) => {
        const controller = new AbortController();
        const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

        try {
            return await fetch(input, {
                ...init,
                signal: controller.signal,
            });
        } finally {
            window.clearTimeout(timeoutId);
        }
    };

    const validatePassword = (value: string) => {
        const messages: string[] = [];
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

    const submitGoogleLogin = async (idToken: string, acceptedTermsForGoogle = false) => {
        const res = await fetch(BACKEND_URL + "/api/auth/google", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ idToken, acceptedTerms: acceptedTermsForGoogle }),
        });
        const data = await res.json();
        return { res, data };
    };

    const completeGoogleLogin = async () => {
        await getMe();
        toast.success("Logged in with Google");
        router.push("/main/dashboard");
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

            await completeGoogleLogin();
        } catch (err: unknown) {
            console.error(err);
            toast.error(getErrorMessage(err));
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
            await completeGoogleLogin();
        } catch (err: unknown) {
            console.error(err);
            toast.error(getErrorMessage(err));
        } finally {
            setGoogleLoading(false);
        }
    };

    useEffect(() => {
        if (step !== 1 || !googleReady || !GOOGLE_CLIENT_ID || !googleButtonRef.current || !window.google) {
            return;
        }

        let renderedWidth = 0;

        const renderGoogleButton = () => {
            if (!googleButtonRef.current || !window.google) {
                return;
            }

            renderedWidth = measureGoogleButtonWidth(googleButtonRef.current);
            setGoogleButtonMounted(false);
            googleButtonRef.current.innerHTML = "";
            window.google.accounts.id.initialize({
                client_id: GOOGLE_CLIENT_ID,
                callback: handleGoogleLogin,
                ux_mode: "popup",
            });
            window.google.accounts.id.renderButton(googleButtonRef.current, {
                type: "standard",
                theme: "outline",
                text: "continue_with",
                shape: "pill",
                size: "large",
                width: renderedWidth,
                logo_alignment: "center",
            });

            requestAnimationFrame(() => setGoogleButtonMounted(true));
        };

        const timeoutId = window.setTimeout(renderGoogleButton, 0);
        const handleWindowFocus = () => renderGoogleButton();
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible") {
                renderGoogleButton();
            }
        };

        const handleResize = () => {
            if (googleButtonRef.current && measureGoogleButtonWidth(googleButtonRef.current) !== renderedWidth) {
                renderGoogleButton();
            }
        };

        window.addEventListener("focus", handleWindowFocus);
        window.addEventListener("resize", handleResize);
        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            window.clearTimeout(timeoutId);
            window.removeEventListener("focus", handleWindowFocus);
            window.removeEventListener("resize", handleResize);
            document.removeEventListener("visibilitychange", handleVisibilityChange);
        };
    }, [GOOGLE_CLIENT_ID, googleReady, step]);

    const sendOtp = async () => {
        try {
            setLoading(true);
            const res = await fetchWithTimeout(BACKEND_URL + "/api/auth/register/send-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: form.name,
                    email: form.email,
                    phoneNumber: form.phoneNumber
                })
            });
            const data = await res.json();
            if (!res.ok || data.success === false) {
                toast.warn(data.message || "OTP email is unavailable. Please continue using Google to register.");
                return;
            }
            toast.success(data.message || "OTP sent");
            next();
        } catch (err: unknown) {
            console.error(err);
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
    };

    const verifyOtp = async () => {
        try {
            setLoading(true);
            const res = await fetchWithTimeout(BACKEND_URL + "/api/auth/register/verify-otp", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    email: form.email,
                    otp
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message);
                return;
            }
            setOtpVerified(true);
            toast.success(data.message || "OTP verified");
            next();
        } catch (err: unknown) {
            console.error(err);
            toast.error(getErrorMessage(err));
        } finally {
            setLoading(false);
        }
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
        if (!acceptedTerms) {
            toast.warn("Please accept the Terms and Conditions to continue");
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
                    password: form.password,
                    acceptedTerms
                })
            });
            const data = await res.json();
            if (!res.ok) {
                toast.warn(data.message)
                return;
            } else {
                await getMe();
                toast.success("Account created");
                router.push("/main/dashboard");
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
            {GOOGLE_CLIENT_ID ? (
                <Script
                    src="https://accounts.google.com/gsi/client"
                    strategy="afterInteractive"
                    onLoad={() => setGoogleReady(true)}
                />
            ) : null}

            <AuthAside variant="register" />

            <div className="flex w-full flex-1 items-center justify-center px-6 py-12">

                <div className="w-full max-w-md relative">

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

                                <div className="flex items-center gap-3">
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
                                                className={`flex min-h-10 w-full justify-center overflow-hidden rounded-full ${googleLoading ? "pointer-events-none opacity-70" : ""} ${googleButtonMounted ? "opacity-100" : "opacity-0"}`}
                                            />
                                        </div>
                                    </div>
                                ) : (
                                    <p className="rounded-3xl border border-dashed border-black/20 bg-secondary px-4 py-3 text-center text-sm text-gray-600">
                                        Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` to enable Google sign-in.
                                    </p>
                                )}
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

                                <label className="flex items-start gap-3 text-sm">
                                    <input
                                        type="checkbox"
                                        className="mt-1 h-4 w-4 shrink-0"
                                        checked={acceptedTerms}
                                        onChange={(e) => setAcceptedTerms(e.target.checked)}
                                    />
                                    <span>
                                        I agree to the{" "}
                                        <Link href="/terms-and-conditions" target="_blank" className="font-bold text-primary underline">
                                            Terms and Conditions
                                        </Link>
                                        .
                                    </span>
                                </label>

                                <div className="flex gap-3">
                                    <button className="button-secondary w-1/2" onClick={back}>
                                        Back
                                    </button>

                                    <button
                                        className={`w-full ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                                        onClick={handleRegister}
                                        disabled={loading || !acceptedTerms}
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

                        <label className="mt-5 flex items-center gap-3 text-sm">
                            <input
                                type="checkbox"
                                checked={googleTermsAccepted}
                                onChange={(e) => setGoogleTermsAccepted(e.target.checked)}
                                className="shrink-0"
                                style={{
                                    width: "16px",
                                    height: "16px",
                                    padding: 0,
                                    margin: 0,
                                    flex: "none",
                                }}
                            />

                            <span>
                                I agree to the{" "}
                                <Link
                                    href="/terms-and-conditions"
                                    target="_blank"
                                    className="font-bold text-primary underline"
                                >
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
