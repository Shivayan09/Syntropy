"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Mail,
    MessageSquare,
    HelpCircle,
    ChevronDown,
    Headphones,
    Send,
    User,
    Clock,
} from "lucide-react";
import { toast } from "react-toastify";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function SupportPage() {
    const { user } = useAuth();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const [active, setActive] = useState<number | null>(0);
    const [submitting, setSubmitting] = useState(false);
    const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);

    const faqs = [
        {
            q: "Are these tests actually useful?",
            a: "They show where you waste time, where you guess, and what topics you don’t actually understand.",
        },
        {
            q: "Is this only for competitive exams?",
            a: "No. Placements, semester prep, or any timed practice benefits from structured feedback.",
        },
        {
            q: "How is this different from practice platforms?",
            a: "Practice platforms give questions. This tells you why you keep getting them wrong.",
        },
        {
            q: "Do I need to attempt daily?",
            a: "Consistency helps, but a few serious tests per week are enough.",
        },
        {
            q: "Will this track weak topics automatically?",
            a: "Yes. Accuracy, time spent, and performance trends reveal what you need to fix.",
        },
    ];

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
    });

    useEffect(() => {
        if (!user) {
            return;
        }

        const timeoutId = window.setTimeout(() => {
            setForm((prev) => ({
                ...prev,
                name: prev.name || user.name || "",
                email: prev.email || user.email || "",
            }));
        }, 0);

        return () => window.clearTimeout(timeoutId);
    }, [user]);

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!acceptedPrivacy) {
            toast.warn("Please accept the Privacy Policy to continue");
            return;
        }

        try {
            setSubmitting(true);

            const res = await fetch(BACKEND_URL + "/api/user/contact-support", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "include",
                body: JSON.stringify(form)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.warn(data.message || "Failed to send support message");
                setSubmitting(false);
                return;
            }

            toast.success("Support message sent");
            setForm((prev) => ({ ...prev, message: "" }));
        } catch (error) {
            console.error("Failed to send support message", error);
            toast.error("Could not send your message right now");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="space-y-7">
            <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">
                <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                    <Headphones size={18} />
                    Contact us
                </div>
            </section>

            <div className="card2 -mt-3">
                <p className="text-sm opacity-70 mb-2">WE&apos;RE LISTENING</p>
                <h1 className="text-4xl font-extrabold">Stuck, confused, or found a bug?</h1>
                <p className="opacity-70 mt-3 max-w-2xl">
                    Send us a message and a real person will read it. Check the FAQs below first —
                    there&apos;s a decent chance someone already asked your question.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr] lg:items-start">

                {/* FORM */}
                <div className="card">
                    <h2 className="text-xl font-extrabold mb-1">Send a message</h2>
                    <p className="text-sm opacity-60 mb-5">
                        We read every message that comes in here.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="space-y-2">
                                <span className="flex items-center gap-2 text-sm font-bold opacity-70">
                                    <User size={16} />
                                    Your name
                                </span>
                                <input
                                    name="name"
                                    placeholder="Jane Doe"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                />
                            </label>

                            <label className="space-y-2">
                                <span className="flex items-center gap-2 text-sm font-bold opacity-70">
                                    <Mail size={16} />
                                    Your email
                                </span>
                                <input
                                    name="email"
                                    type="email"
                                    placeholder="jane@example.com"
                                    value={form.email}
                                    onChange={handleChange}
                                    required
                                    className="w-full"
                                />
                            </label>
                        </div>

                        <label className="space-y-2">
                            <span className="flex items-center gap-2 text-sm font-bold opacity-70">
                                <MessageSquare size={16} />
                                Your message
                            </span>
                            <textarea
                                name="message"
                                placeholder="Explain your issue before losing patience..."
                                value={form.message}
                                onChange={handleChange}
                                required
                                rows={5}
                                className="w-full"
                            />
                        </label>

                        <label className="flex items-start gap-3 text-sm opacity-80">
                            <input
                                type="checkbox"
                                className="mt-1 h-4 w-4 shrink-0"
                                checked={acceptedPrivacy}
                                onChange={(e) => setAcceptedPrivacy(e.target.checked)}
                            />
                            <span>
                                I agree that Syntropy may use the details above to respond to this message, as
                                described in the{" "}
                                <Link href="/privacy-policy" target="_blank" className="font-bold text-primary underline">
                                    Privacy Policy
                                </Link>
                                .
                            </span>
                        </label>

                        <button
                            type="submit"
                            disabled={submitting || !acceptedPrivacy}
                            className={`w-full justify-center gap-2 ${submitting || !acceptedPrivacy ? "cursor-not-allowed opacity-70" : ""}`}
                        >
                            {submitting ? "Sending..." : (
                                <>
                                    Send message
                                    <Send size={16} />
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* SIDE INFO */}
                <div className="flex flex-col gap-4">
                    <div className="card flex items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-(--border) bg-(--surface) text-primary shadow-(--shadow-sm)">
                            <Mail size={20} />
                        </span>
                        <div>
                            <p className="font-extrabold">Email us directly</p>
                            <p className="text-sm text-primary font-semibold mt-1">syntropy.tests@gmail.com</p>
                            <p className="mt-1 flex items-center gap-1.5 text-xs opacity-55">
                                <Clock size={13} />
                                Replies within 24–48 hours, usually.
                            </p>
                        </div>
                    </div>

                    <div className="card flex items-start gap-4 opacity-70">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-(--border) bg-(--surface) text-primary shadow-(--shadow-sm)">
                            <MessageSquare size={20} />
                        </span>
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-extrabold">Live chat</p>
                                <span className="rounded-full border border-(--border) bg-(--bg-secondary) px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide opacity-80">
                                    Soon
                                </span>
                            </div>
                            <p className="mt-1 text-sm opacity-70">
                                For when waiting feels like suffering.
                            </p>
                        </div>
                    </div>

                    <div className="card flex items-start gap-4">
                        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl border border-(--border) bg-(--surface) text-primary shadow-(--shadow-sm)">
                            <HelpCircle size={20} />
                        </span>
                        <div>
                            <p className="font-extrabold">Check the FAQs first</p>
                            <p className="mt-1 text-sm opacity-70">
                                Answers to things people ask repeatedly instead of reading.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="card2">
                <div>
                    <div className="mb-4">
                        <p className="text-sm font-bold text-primary">
                            COMMON QUESTIONS
                        </p>

                        <h2 className="text-2xl md:text-3xl font-extrabold mt-2">
                            What users usually ask
                        </h2>
                    </div>

                    <div className="border-t border-black/20">

                        {faqs.map((faq, i) => {
                            const isOpen = active === i;

                            return (
                                <div key={i} className="border-b border-black/20">

                                    <div
                                        onClick={() => setActive(isOpen ? null : i)}
                                        className="flex items-center justify-between py-5 cursor-pointer select-none hover:text-primary transition"
                                    >
                                        <span className="font-semibold text-[1.05rem]">
                                            {faq.q}
                                        </span>

                                        <motion.div
                                            animate={{ rotate: isOpen ? 180 : 0 }}
                                            transition={{ duration: 0.2 }}
                                            className="text-primary"
                                        >
                                            <ChevronDown size={20} strokeWidth={2.5} />
                                        </motion.div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isOpen && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.25 }}
                                                className="overflow-hidden"
                                            >
                                                <p className="pb-5 text-gray-600 pr-10">
                                                    {faq.a}
                                                </p>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                </div>
                            );
                        })}

                    </div>

                </div>
            </div>
        </div>
    );
}
