"use client";

import { useRouter } from "next/navigation";
import {
    BrainCircuit,
    Check,
    Clock,
    Target,
    TrendingUp,
    X,
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Preview() {
    const router = useRouter();

    const [active, setActive] = useState(-1);

    const options = [
        { text: "When n is always small", correct: false },
        { text: "When the data is sorted and the search space halves each step", correct: true },
        { text: "When every element must still be checked once", correct: false },
        { text: "When the algorithm never compares middle elements", correct: false },
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            setActive((prev) => {
                if (prev === options.length - 1) return -1;
                return prev + 1;
            });
        }, 900);

        return () => clearInterval(interval);
    }, [options.length]);

    return (
        <section className="py-10 px-5 md:px-10">
            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
                <p className="text-sm font-bold text-primary mb-3">
                    LIVE EXPERIENCE
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                    Attempt. Review. Adjust.
                </h2>
                <p className="text-gray-600 mt-4">
                    This section now mirrors the actual product flow: a timed question on one side, and the study signals you get back on the other.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-start">
                <div className="relative">
                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-bold">Generated DSA Mock Test</p>

                            <div className="flex items-center gap-2 text-sm border-2 border-black px-3 py-1 bg-secondary">
                                <Clock size={14} />
                                12:34
                            </div>
                        </div>

                        <h3 className="font-semibold mb-5">
                            Binary search works in O(log n). Which explanation best justifies that result?
                        </h3>

                        <div className="space-y-3">
                            {options.map((opt, i) => {
                                const isActive = i === active;
                                const isCorrect = isActive && opt.correct;
                                const isWrong = isActive && !opt.correct;

                                return (
                                    <motion.div
                                        key={i}
                                        animate={{
                                            backgroundColor: isCorrect
                                                ? "var(--primary)"
                                                : isWrong
                                                    ? "#ef4444"
                                                    : "",
                                            color:
                                                isCorrect || isWrong
                                                    ? "#ffffff"
                                                    : "",
                                            scale: isActive ? 1.02 : 1,
                                            opacity: isActive ? 1 : 0.9,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                            ease: "easeInOut",
                                        }}
                                        className="border-2 border-black p-3 relative"
                                    >
                                        {opt.text}

                                        {isCorrect && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.6 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.25 }}
                                                className="absolute right-3 top-3"
                                            >
                                                <Check size={16} />
                                            </motion.div>
                                        )}

                                        {isWrong && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.6 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ duration: 0.25 }}
                                                className="absolute right-3 top-3"
                                            >
                                                <X size={16} />
                                            </motion.div>
                                        )}
                                    </motion.div>
                                );
                            })}
                        </div>

                        <div className="mt-6 border-2 border-black p-4 bg-secondary">
                            <p className="font-bold text-sm mb-1">
                                Review insight
                            </p>
                            <p className="text-sm text-gray-700">
                                The strongest explanations connect the answer to halving the search space each step, not just memorizing a complexity label.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-5 h-full">
                    <div className="card bg-surface flex gap-4 items-start">
                        <Target className="mt-1" />
                        <div>
                            <p className="font-bold">Subject-aware practice</p>
                            <p className="text-sm text-gray-600">
                                Build tests from selected subjects and reuse parsed syllabus data instead of starting from scratch every time.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-surface flex gap-4 items-start">
                        <BrainCircuit className="mt-1" />
                        <div>
                            <p className="font-bold">
                                AI where it matters
                            </p>
                            <p className="text-sm text-gray-600">
                                Generate full tests faster and evaluate subjective answers with feedback when manual checking would slow you down.
                            </p>
                        </div>
                    </div>

                    <div className="card bg-surface flex gap-4 items-start">
                        <TrendingUp className="mt-1" />
                        <div>
                            <p className="font-bold">Track real growth</p>
                            <p className="text-sm text-gray-600">
                                Dashboard, analytics, history, and retakes make progress visible across attempts instead of leaving it to memory.
                            </p>
                        </div>
                    </div>

                    <button
                        className="w-full mt-4"
                        onClick={() => router.push("/main/tests")}
                    >
                        Browse available tests
                    </button>
                </div>
            </div>
        </section>
    );
}
