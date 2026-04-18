"use client";

import { Sparkles, ClipboardPen, ClipboardList, FlaskConical } from "lucide-react";
import { useRouter } from "next/navigation";

export default function CreateTestPage() {
    const router = useRouter();

    return (
        <div className="max-w-5xl mx-auto space-y-8">

            <div className="mb-5 flex items-center gap-2 text-sm font-extrabold uppercase text-primary">
                        <FlaskConical size={18} />
                        Test laboratory
                      </div>

            <div className="card2">
                <p className="text-sm opacity-70 mb-2">CREATE MODE</p>
                <h1 className="text-4xl font-extrabold">
                    Build a test that fits your goal.
                </h1>
                <p className="opacity-70 mt-3 max-w-2xl">
                    Choose between speed and control or use both smartly.
                </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">

                <div className="card flex flex-col justify-between min-h-85">

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <Sparkles size={30} />
                            <p className="text-2xl font-extrabold">
                                AI Test Generator
                            </p>
                        </div>

                        <p className="text-sm opacity-70 mb-6">
                            Generate a ready-to-attempt test instantly using topics, difficulty, and duration.
                        </p>

                        <ul className="space-y-3 text-sm opacity-70 list-disc pl-5">
                            <li>Quick revision before exams</li>
                            <li>Practice multiple subjects fast</li>
                            <li>Daily problem-solving routine</li>
                            <li>Test weak areas instantly</li>
                        </ul>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={() => router.push("/main/create/generate")}>
                            Generate
                        </button>
                    </div>
                </div>

                <div className="card flex flex-col justify-between min-h-85">

                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <ClipboardPen size={30} />
                            <p className="text-2xl font-extrabold">
                                Manual Builder
                            </p>
                        </div>

                        <p className="text-sm opacity-70 mb-6">
                            Create a custom test with full control over questions, structure, and difficulty.
                        </p>

                        <ul className="space-y-3 text-sm opacity-70 list-disc pl-5">
                            <li>Create mock exams</li>
                            <li>Revise specific chapters</li>
                            <li>Practice important questions</li>
                            <li>Test conceptual understanding</li>
                        </ul>
                    </div>

                    <div className="mt-6 flex justify-end">
                        <button onClick={() => router.push("/main/create/manual")}>
                            Create
                        </button>
                    </div>
                </div>

            </div>

            <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="card">Quick to start</div>
                <div className="card">Fits your workflow</div>
                <div className="card">Works with timed attempts</div>
            </div>

        </div>
    );
}