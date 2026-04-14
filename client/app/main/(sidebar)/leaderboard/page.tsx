"use client";

import { useEffect, useState } from "react";
import Loader2 from "@/components/Loader2";

export default function LeaderboardPage() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    useEffect(() => {
        const fetchLeaderboard = async () => {
            try {
                const res = await fetch(
                    BACKEND_URL + "/api/leaderboard",
                    { credentials: "include" }
                );

                const data = await res.json();
                setUsers(data.users || []);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchLeaderboard();
    }, []);

    if (loading) {
        return <Loader2 />;
    }

    return (
        <div className="space-y-6">

            <div>
                <h1 className="text-2xl font-extrabold">
                    Leaderboard
                </h1>

                <p className="opacity-70 text-sm">
                    Based on first attempts only
                </p>
            </div>

            <div className="card p-0 overflow-hidden">

                {/* HEADER */}
                <div className="hidden md:grid font-bold border-b px-4 py-3 bg-secondary
                [grid-template-columns:80px_1fr_120px_100px_120px]">
                    <div>Rank</div>
                    <div>User</div>
                    <div>Accuracy</div>
                    <div>Tests</div>
                    <div>Avg Score</div>
                </div>

                {users.map((u, i) => (
                    <div
                        key={u._id}
                        className="border-t md:border-0"
                    >

                        {/* DESKTOP ROW */}
                        <div
                            className="hidden md:grid px-4 py-3 items-center
                            hover:bg-black/5 dark:hover:bg-white/5 transition-colors
                            [grid-template-columns:80px_1fr_120px_100px_120px]"
                        >
                            <div className="font-bold">
                                #{i + 1}
                            </div>

                            <div className="font-semibold truncate">
                                {u.name}
                            </div>

                            <div>
                                {Math.round(u.avgAccuracy)}%
                            </div>

                            <div>
                                {u.testsTaken}
                            </div>

                            <div className="font-bold">
                                {Math.round(u.avgScore)}
                            </div>
                        </div>

                        {/* MOBILE CARD */}
                        <div className="md:hidden px-4 py-3 space-y-2">

                            <div className="flex justify-between">
                                <span className="font-bold">
                                    #{i + 1}
                                </span>

                                <span className="font-bold">
                                    {Math.round(u.avgAccuracy)}%
                                </span>
                            </div>

                            <div className="font-semibold">
                                {u.name}
                            </div>

                            <div className="flex justify-between text-sm opacity-80">
                                <span>
                                    Tests: {u.testsTaken}
                                </span>

                                <span>
                                    Score: {Math.round(u.avgScore)}
                                </span>
                            </div>

                        </div>

                    </div>
                ))}

            </div>

        </div>
    );
}