"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader2 from "@/components/Loader2";
import NotFound from "@/components/NotFound";

export default function AttemptsPage() {
    const router = useRouter();
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
    const [attempts, setAttempts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [visible, setVisible] = useState(5);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchAttempts = async () => {
            try {
                const res = await fetch(BACKEND_URL + "/api/attempt/my", { credentials: "include" });
                const data = await res.json();
                setAttempts(data.attempts || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttempts();
    }, []);

    const filteredAttempts = attempts.filter((a) => {
        const title = (a.test?.title || "AI Test").toLowerCase();
        const subject = (a.test?.subjects?.[0] || "").toLowerCase();
        const q = search.toLowerCase();
        return title.includes(q) || subject.includes(q);
    });

    const visibleAttempts = filteredAttempts.slice(0, visible);

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">
                    My Attempts
                </h1>

                <button onClick={() => router.push("/main/tests")} >
                    Take Test
                </button>
            </div>

            <div className="flex flex-wrap gap-3">
                <input
                    placeholder="Search test..."
                    value={search}
                    onChange={(e) => {
                        setSearch(e.target.value);
                        setVisible(5);
                    }}
                    className="flex-2 min-w-62.5"
                />

                <select className="flex-1 min-w-40">
                    <option>All Subjects</option>
                </select>

                <select className="flex-1 min-w-40">
                    <option>Sort by Latest</option>
                    <option>Highest Score</option>
                    <option>Lowest Score</option>
                </select>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <Loader2 />
                ) : filteredAttempts.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <NotFound />

                        <p className="opacity-70 text-sm mt-1">
                            No matching attempts found
                        </p>
                    </div>
                ) : (
                    <>
                        {visibleAttempts.map((attempt) => (
                            <div
                                key={attempt._id}
                                className="card2 flex flex-col md:flex-row md:items-center justify-between gap-4"
                            >
                                <div>
                                    <p className="font-extrabold text-lg">
                                        {attempt.test?.title || "AI Test"}
                                    </p>

                                    <div className="flex flex-wrap gap-x-10 gap-y-1 mt-2 text-sm">
                                        <span>
                                            Subject: {attempt.test?.subjects?.[0] || "-"}
                                        </span>

                                        <span>
                                            Score: {Math.round(attempt.score)}
                                        </span>

                                        <span>
                                            Accuracy: {Math.round(attempt.accuracy)}%
                                        </span>

                                        <span>
                                            Time: {Math.round(attempt.timeTaken / 60)} min
                                        </span>
                                    </div>

                                    <p className="text-xs mt-2 opacity-70">
                                        {new Date(attempt.createdAt).toLocaleString()}
                                    </p>
                                </div>

                                <div className="flex gap-3 w-full md:w-auto justify-end">
                                    <button
                                        className="button-secondary"
                                        onClick={() => router.push(`/main/history/review/${attempt._id}`)}
                                    >
                                        Review
                                    </button>

                                    <button
                                        onClick={() => router.push(`/main/test/preview/${attempt.test?._id}`)}
                                    >
                                        Retake
                                    </button>
                                </div>
                            </div>
                        ))}

                        {visible < filteredAttempts.length && (
                            <div className="flex justify-end">
                                <button
                                    className="button-secondary"
                                    onClick={() => setVisible((prev) => prev + 10)}
                                >
                                    Load more
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}