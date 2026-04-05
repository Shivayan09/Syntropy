"use client";

import { ArrowRight } from "lucide-react";

export default function Comparison() {
    return (
        <section className="py-10 px-6">
            {/* Heading */}
            <div className="text-center mx-auto mb-16">
                <p className="text-sm font-bold text-primary mb-3">
                    TRANSFORMATION
                </p>
                <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">
                    Stop guessing. Start <span className="text-primary">improving</span>
                </h2>
                <p className="text-gray-600 mt-4">
                    Most students think they’re improving. They’re not.
                </p>
            </div>

            {/* Main layout */}
            <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                
                {/* BEFORE */}
                <div className="relative w-full md:w-1/2 max-w-md">
                    <div className="absolute top-2 left-2 w-full h-full border-2 border-black bg-secondary"></div>
                    
                    <div className="relative border-2 border-black bg-white p-8">
                        <p className="font-bold text-lg mb-6">
                            🚫 Before Testify
                        </p>

                        <ul className="space-y-4 text-gray-700">
                            <li className="flex items-start gap-3">
                                <span>❌</span>
                                <span>Practicing randomly without direction</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span>❌</span>
                                <span>No idea what you’re improving</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span>❌</span>
                                <span>False confidence from easy problems</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* ARROW */}
                <div className="hidden md:flex items-center justify-center">
                    <div className="border-2 border-black p-4 bg-primary text-white">
                        <ArrowRight size={28} />
                    </div>
                </div>

                {/* AFTER */}
                <div className="relative w-full md:w-1/2 max-w-md">
                    <div className="absolute top-2 left-2 w-full h-full border-2 border-black bg-primary"></div>

                    <div className="relative border-2 border-black bg-primary text-white p-8">
                        <p className="font-bold text-lg mb-6">
                            ✅ With Testify
                        </p>

                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <span>✔</span>
                                <span>Structured test-driven learning</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span>✔</span>
                                <span>Clear performance analytics</span>
                            </li>
                            <li className="flex items-start gap-3">
                                <span>✔</span>
                                <span>Track real, measurable growth</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Bottom punchline */}
            <div className="text-center mt-16">
                <div className="inline-block border-2 border-black px-6 py-3 font-bold bg-white shadow-[4px_4px_0px_black]">
                    Reality hurts. Data helps.
                </div>
            </div>
        </section>
    );
}