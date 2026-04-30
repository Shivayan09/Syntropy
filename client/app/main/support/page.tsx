"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, HelpCircle, ChevronDown } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "@/context/AuthContext";

export default function SupportPage() {
    const { user } = useAuth();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    const [active, setActive] = useState<number | null>(0);
    const [submitting, setSubmitting] = useState(false);

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
                <div>
                    <div className="mb-3 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <MessageSquare size={18} />
                        Support
                    </div>
                </div>
            </section>

            <div className="flex flex-col md:flex-row gap-5">


                {/* FORM */}
                <div className="card max-w-2xl">
                    <h2 className="text-xl font-bold mb-4">Contact us</h2>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            name="name"
                            placeholder="Your name"
                            value={form.name}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />

                        <input
                            name="email"
                            type="email"
                            placeholder="Your email"
                            value={form.email}
                            onChange={handleChange}
                            required
                            className="w-full"
                        />

                        <textarea
                            name="message"
                            placeholder="Explain your issue before losing patience..."
                            value={form.message}
                            onChange={handleChange}
                            required
                            rows={5}
                            className="w-full"
                        />

                        <button type="submit" disabled={submitting} className={submitting ? "cursor-not-allowed opacity-70" : ""}>
                            {submitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>
                <div className="flex flex-col gap-3">
                    <div className="card hover:-translate-x-0.5 hover:-translate-y-0.5 transition">
                        <HelpCircle className="mb-3 text-primary" />
                        <h3 className="font-bold text-lg mb-1">FAQs</h3>
                        <p className="text-sm text-gray-500">
                            Answers to things people ask repeatedly instead of reading.
                        </p>
                    </div>

                    <div className="card">
                        <Mail className="mb-3 text-primary" />
                        <p className="font-extrabold text-lg mb-1">Our email : <span className="font-semibold text-gray-500 text-sm">syntropy.tests@gmail.com</span></p>
                        <p className="text-sm text-gray-500">
                            Get a response within 24–48 hours. Usually.
                        </p>
                    </div>

                    <div className="card">
                        <MessageSquare className="mb-3 text-primary" />
                        <h3 className="font-bold text-lg mb-1">Live Chat (Soon)</h3>
                        <p className="text-sm text-gray-500">
                            For when waiting feels like suffering.
                        </p>
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
