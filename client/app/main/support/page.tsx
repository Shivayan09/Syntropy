"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, MessageSquare, HelpCircle, ChevronDown } from "lucide-react";

export default function SupportPage() {

    const [active, setActive] = useState<number | null>(0);

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

    const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        // TODO: connect backend
        console.log(form);

        alert("Message sent. Now pray someone reads it.");
        setForm({ name: "", email: "", message: "" });
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

            <div className="flex gap-5">


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

                        <button type="submit">Send Message</button>
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
                        <h3 className="font-bold text-lg mb-1">Email Support</h3>
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
