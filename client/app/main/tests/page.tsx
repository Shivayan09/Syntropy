"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, BookOpen, ClipboardPen, Sparkles } from "lucide-react";
import NotFound from "@/components/NotFound";
import Loader from "@/components/Loader";
import Loader2 from "@/components/Loader2";

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
                const res = await fetch(BACKEND_URL + "/api/test/all", { credentials: "include" });
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

    const filtered = type === "manual" ? tests.filter((t) => t.type === "manual") : tests.filter((t) => t.type === "generated");

    return (
        <div>

            <div className="mb-6">
                <h1 className="text-3xl font-extrabold mb-1">Tests</h1>
                <p className="text-gray-600">Select a test to begin</p>
            </div>

            <div className="flex gap-3 mb-6">

                <button className={type === "manual" ? "" : "button-secondary"} onClick={() => setType("manual")}>
                    Manual Tests
                </button>

                <button className={type === "ai" ? "" : "button-secondary"} onClick={() => setType("ai")}>
                    AI Generated
                </button>

            </div>

            <div className="space-y-3">

                {loading && <Loader2 />}

                {!loading && filtered.length === 0 && (
                    <div>
                        <NotFound/>
                        <div className="w-full flex items-center justify-center">
                            <button onClick={() => router.push('/main/create')} className="mt-10 flex items-center gap-2 group">
                                Create a test
                                <ArrowRight className="mt-0.5 transition-all duration-200 group-hover:translate-x-1"/>
                            </button>
                        </div>
                    </div>
                )}

                {filtered.map((test) => (
                    <div key={test._id} className="card flex flex-col md:flex-row gap-5 md:gap-0 items-center justify-between">
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

                        <button className="button-secondary w-full md:w-fit flex items-center gap-1 group" onClick={() => router.push(`/main/test/preview/${test._id}`)}>
                            Attempt
                            <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
                        </button>
                    </div>
                ))}

            </div>

        </div>
    );
}