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

    const visibleAttempts = attempts.slice(0, visible);

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
                <input placeholder="Search test..." className="flex-2 min-w-62.5" />

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
                ) : attempts.length === 0 ? (
                    <div className="flex flex-col items-center py-16">
                        <NotFound />

                        <p className="opacity-70 text-sm mt-1">
                            Your test history will appear here
                        </p>
                    </div>
                ) : (
                    <>
                        {visibleAttempts.map((attempt) => (
                            <div key={attempt._id} className="card flex items-center justify-between">
                                <div>
                                    <p className="font-extrabold text-lg">
                                        {attempt.test?.title || "AI Test"}
                                    </p>

                                    <div className="flex gap-6 mt-1 text-sm">
                                        <span>
                                            Subject: {attempt.test?.subjects?.[0] || "-"}
                                        </span>

                                        <span>
                                            Score: {Math.round(attempt.score)}%
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

                                {/* right */}
                                <div className="flex gap-3">
                                    <button className="button-secondary" onClick={() => router.push(`/main/attempt/${attempt._id}`)}>
                                        Review
                                    </button>

                                    <button onClick={() => router.push(`/main/test/${attempt.test?._id}`)} >
                                        Retake
                                    </button>
                                </div>
                            </div>
                        ))}

                        {visible < attempts.length && (
                            <div className="flex justify-end">
                                <button className="button-secondary" onClick={() => setVisible((prev) => prev + 10)} >
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