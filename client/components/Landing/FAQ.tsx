"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

export default function FAQSection() {
    const [active, setActive] = useState<number | null>(0);

    const faqs = [
        {
            q: "Can I create tests manually as well as with AI?",
            a: "Yes. You can build manual MCQ or subjective tests yourself, or generate AI tests from selected subjects, difficulty, duration, marks, and student context.",
        },
        {
            q: "Does the platform support semester prep and placement prep?",
            a: "Yes. The product is designed for semester exams, placements, and other timed assessments where you need structured practice plus review.",
        },
        {
            q: "What happens after I upload a syllabus?",
            a: "Your syllabus can be parsed into structured subjects, units, and topics so those subjects are easier to reuse while generating or organizing tests.",
        },
        {
            q: "What kind of analysis do I get after an attempt?",
            a: "You can review submitted answers, see scores and accuracy, track trends in analytics, inspect subject performance, and use history to compare retakes.",
        },
        {
            q: "How do AI credits and plans work?",
            a: "The free plan includes 3 total AI test generations. If you need more, you can upgrade to paid plans or buy top-up credits while manual test creation stays unlimited.",
        },
    ];

    return (
        <section className="py-24 px-5 bg-secondary">
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16">
                <div className="space-y-6">
                    <p className="text-sm font-bold text-primary">
                        CLEAR DOUBTS FAST
                    </p>

                    <h2 className="text-3xl md:text-5xl font-extrabold">
                        Questions before you
                        <br />
                        <span className="text-primary">start your next mock.</span>
                    </h2>

                    <p className="text-gray-600">
                        The product does more than show a few sample questions, so the landing page should answer the practical things students usually want to know first.
                    </p>

                    <p className="text-gray-600">
                        If you want the full picture, the fastest way is still to create a test and move through the actual flow.
                    </p>
                </div>

                <div className="border-t border-black/20">
                    {faqs.map((faq, i) => {
                        const isOpen = active === i;

                        return (
                            <div key={i} className="border-b border-black/20">
                                <div
                                    onClick={() => setActive(isOpen ? null : i)}
                                    className="flex items-center justify-between py-5 cursor-pointer select-none"
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
        </section>
    );
}
