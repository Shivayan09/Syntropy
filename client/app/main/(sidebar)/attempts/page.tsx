"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Attempt {
    _id: string;
    title: string;
    subject: string;
    score: number;
    accuracy: number;
    timeTaken: number;
    createdAt: string;
}

export default function AttemptsPage() {
    const [attempts, setAttempts] = useState<Attempt[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // replace with your API
        const fetchAttempts = async () => {
            try {
                // const res = await fetch("/api/attempts");
                // const data = await res.json();

                // mock data
                const data: Attempt[] = [
                    {
                        _id: "1",
                        title: "DSA Mock 1",
                        subject: "DSA",
                        score: 78,
                        accuracy: 82,
                        timeTaken: 42,
                        createdAt: new Date().toISOString(),
                    },
                    {
                        _id: "2",
                        title: "OS Test",
                        subject: "OS",
                        score: 64,
                        accuracy: 71,
                        timeTaken: 38,
                        createdAt: new Date().toISOString(),
                    },
                ];

                setAttempts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchAttempts();
    }, []);

    return (
        <div className="p-6 pt-20 md:pt-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-extrabold">My Attempts</h1>

                <button>Take Test</button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3">
                <input
                    placeholder="Search test..."
                    className="flex-2 min-w-62.5"
                />

                <select className="flex-1 min-w-40">
                    <option>All Subjects</option>
                    <option>DSA</option>
                    <option>OS</option>
                    <option>DBMS</option>
                </select>

                <select className="flex-1 min-w-40">
                    <option>Sort by Latest</option>
                    <option>Highest Score</option>
                    <option>Lowest Score</option>
                </select>
            </div>

            {/* Attempts list */}
            <div className="space-y-4">
                {loading ? (
                    <div className="card">Loading attempts...</div>
                ) : attempts.length === 0 ? (
                    <div className="card">No attempts yet</div>
                ) : (
                    attempts.map((attempt) => (
                        <div
                            key={attempt._id}
                            className="card flex items-center justify-between"
                        >
                            {/* left */}
                            <div>
                                <p className="font-extrabold text-lg">{attempt.title}</p>

                                <div className="flex gap-6 mt-1 text-sm">
                                    <span>Subject: {attempt.subject}</span>
                                    <span>Score: {attempt.score}%</span>
                                    <span>Accuracy: {attempt.accuracy}%</span>
                                    <span>Time: {attempt.timeTaken} min</span>
                                </div>

                                <p className="text-xs mt-2 opacity-70">
                                    {new Date(attempt.createdAt).toLocaleString()}
                                </p>
                            </div>

                            {/* right */}
                            <div className="flex gap-3">
                                <button className="button-secondary">
                                    Review
                                </button>

                                <button>Retake</button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}