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
                const res = await fetch(BACKEND_URL + "/api/leaderboard", { credentials: "include" });
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

                <div className="grid grid-cols-5 font-bold border-b px-4 py-3 bg-secondary">
                    <div>Rank</div>
                    <div>User</div>
                    <div>Accuracy</div>
                    <div>Tests</div>
                    <div>Avg Score</div>
                </div>

                {users.map((u, i) => (
                    <div key={u._id} className="grid grid-cols-5 px-4 py-3 items-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors">
                        <div className="font-bold">
                            #{i + 1}
                        </div>

                        <div className="font-semibold">
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
                ))}

            </div>

        </div>
    );
}