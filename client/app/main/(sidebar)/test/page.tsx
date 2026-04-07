"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

export default function TestsPage() {
    const router = useRouter();
    const [type, setType] = useState<"manual" | "ai">("manual");

    const aiTests = [
        { id: 1, name: "Adaptive DSA", questions: 20, marks: 100, created: "2 hrs ago" },
        { id: 2, name: "Core CS Mixed", questions: 25, marks: 100, created: "Yesterday" },
    ];

    const manualTests = [
        { id: 11, name: "DSA Mock 1", questions: 20, marks: 100, created: "3 days ago" },
        { id: 12, name: "DBMS Test", questions: 15, marks: 75, created: "1 week ago" },
    ];

    const tests = type === "manual" ? manualTests : aiTests;

    return (
        <div className="p-8 pt-20 md:pt-8">

            <div className="mb-6">
                <h1 className="text-3xl font-extrabold mb-1">Tests</h1>
                <p className="text-gray-600">Select a test to begin</p>
            </div>
            <div className="card2 mb-6 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Sparkles size={16} />
                        <p className="font-bold">AI Test Generator</p>
                    </div>
                    <p className="text-sm text-gray-600">
                        Generate test using difficulty and topics
                    </p>
                </div>

                <button className="w-32" onClick={() => router.push("/main/test/generate")}>
                    Generate
                </button>
            </div>
            <div className="card2 mb-6 flex justify-between items-center">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <BookOpen size={16} />
                        <p className="font-bold">Manual Test Builder</p>
                    </div>
                    <p className="text-sm text-gray-600">
                        Create a custom test with your own questions
                    </p>
                </div>

                <button className="w-32" onClick={() => router.push("/main/test/create")}>
                    Create
                </button>
            </div>

            <div className="flex gap-3 mb-6 mt-10">

                <button
                    className={type === "manual" ? "" : "button-secondary"}
                    onClick={() => setType("manual")}
                >
                    Manual Tests
                </button>

                <button
                    className={type === "ai" ? "" : "button-secondary"}
                    onClick={() => setType("ai")}
                >
                    AI Generated
                </button>

            </div>

            {/* TEST LIST */}
            <div className="space-y-3">

                {tests.map((test) => (
                    <div
                        key={test.id}
                        className="card flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between"
                    >
                        <div>
                            <p className="font-semibold">{test.name}</p>

                            <div className="text-sm text-gray-600 flex gap-6 mt-1">
                                <span>{test.questions} Questions</span>
                                <span>{test.marks} Marks</span>
                                <span>Created {test.created}</span>
                            </div>
                        </div>

                        <button
                            className="button-secondary w-full md:w-fit flex items-center gap-1 group"
                            onClick={() => router.push(`/main/tests/${test.id}`)}
                        >
                            Attempt
                            <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
                        </button>
                    </div>
                ))}

            </div>
        </div>
    );
}