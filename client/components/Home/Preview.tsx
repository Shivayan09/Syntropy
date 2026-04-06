"use client";

import { useRouter } from "next/navigation";
import { Check, Clock, TrendingUp, Target, AlertTriangle } from "lucide-react";

export default function Preview() {
    const router = useRouter();

    return (
        <section className="py-10 px-5 md:px-10">

            <div className="text-center max-w-2xl mx-auto mb-10 md:mb-16">
                <p className="text-sm font-bold text-primary mb-3">
                    LIVE EXPERIENCE
                </p>
                <h2 className="text-3xl md:text-5xl font-extrabold leading-tight">
                    Test. Analyze. Improve.
                </h2>
                <p className="text-gray-600 mt-4">
                    Not just practice. A system that shows you exactly where you stand.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-10 items-start">

                <div className="relative">

                    <div className="absolute top-4 left-4 w-full h-full border-2 border-black bg-primary -z-10"></div>

                    <div className="card bg-surface">

                        {/* Top bar */}
                        <div className="flex justify-between items-center mb-6">
                            <p className="font-bold">DSA Mock Test</p>

                            <div className="flex items-center gap-2 text-sm border-2 border-black px-3 py-1 bg-secondary">
                                <Clock size={14} />
                                12:34
                            </div>
                        </div>

                        {/* Question */}
                        <h3 className="font-semibold mb-5">
                            What is the time complexity of binary search?
                        </h3>

                        {/* Options */}
                        <div className="space-y-3">
                            <div className="border-2 border-black p-3 bg-white transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                                O(n)
                            </div>

                            <div className="border-2 border-black p-3 bg-primary text-white relative cursor-pointer">
                                O(log n)
                                <Check size={16} className="absolute right-3 top-3" />
                            </div>

                            <div className="border-2 border-black p-3 bg-white transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                                O(n log n)
                            </div>

                            <div className="border-2 border-black p-3 bg-white transition-all duration-200 hover:bg-gray-100 cursor-pointer">
                                O(1)
                            </div>
                        </div>

                        {/* Feedback */}
                        <div className="mt-6 border-2 border-black p-4 bg-secondary">
                            <p className="font-bold text-sm mb-1">Correct Answer</p>
                            <p className="text-sm text-gray-700">
                                Binary search halves the search space each step.
                            </p>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center gap-5 h-full">

                    {/* Card 1 */}
                    <div className="card bg-surface flex gap-4 items-start">
                        <Target className="mt-1" />
                        <div>
                            <p className="font-bold">Pinpoint Weak Areas</p>
                            <p className="text-sm text-gray-600">
                                Instantly see which topics are holding you back.
                            </p>
                        </div>
                    </div>

                    {/* Card 2 */}
                    <div className="card bg-surface flex gap-4 items-start">
                        <AlertTriangle className="mt-1" />
                        <div>
                            <p className="font-bold">Brutally Honest Feedback</p>
                            <p className="text-sm text-gray-600">
                                No fake confidence. Just real performance insights.
                            </p>
                        </div>
                    </div>

                    {/* Card 3 */}
                    <div className="card bg-surface flex gap-4 items-start">
                        <TrendingUp className="mt-1" />
                        <div>
                            <p className="font-bold">Track Real Growth</p>
                            <p className="text-sm text-gray-600">
                                Measure improvement over time, not guesses.
                            </p>
                        </div>
                    </div>

                    {/* CTA */}
                    <button
                        className="w-full mt-4"
                        onClick={() => router.push("/dashboard")}
                    >
                        Start Your First Test
                    </button>
                </div>
            </div>
        </section>
    );
}