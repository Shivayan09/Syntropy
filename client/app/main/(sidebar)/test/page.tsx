"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";

type Test = {
    _id: string;
    title: string;
    type: "manual" | "generated";
    totalQuestions: number;
    duration: number;
    createdAt: string;
};

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

export default function TestsPage() {
    const router = useRouter();
    const [type, setType] = useState<"manual" | "ai">("manual");
    const [tests, setTests] = useState<Test[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTests = async () => {
            try {
                const res = await fetch(BACKEND_URL + "/api/test/all", { credentials: "include",});
                const data = await res.json();
                if (!res.ok) return;
                setTests(data.tests);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTests();
    }, []);

    const filtered =
        type === "manual"
            ? tests.filter((t) => t.type === "manual")
            : tests.filter((t) => t.type === "generated");

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

                <button
                    className="w-32"
                    onClick={() => router.push("/main/test/generate")}
                >
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

                <button
                    className="w-32"
                    onClick={() => router.push("/main/test/create")}
                >
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

            <div className="space-y-3">

                {loading && <p>Loading tests...</p>}

                {!loading && filtered.length === 0 && (
                    <p className="text-gray-500">
                        No tests found
                    </p>
                )}

                {filtered.map((test) => (
                    <div
                        key={test._id}
                        className="card flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between"
                    >
                        <div>
                            <p className="font-semibold">
                                {test.title}
                            </p>

                            <div className="text-sm text-gray-600 flex gap-6 mt-1">
                                <span>
                                    {test.totalQuestions} Questions
                                </span>
                                <span>
                                    {test.duration} mins
                                </span>
                                <span>
                                    Created{" "}
                                    {new Date(
                                        test.createdAt
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>

                        <button
                            className="button-secondary w-full md:w-fit flex items-center gap-1 group"
                            onClick={() =>
                                router.push(
                                    `/main/test/preview/${test._id}`
                                )
                            }
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