"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AttemptPage() {
    const router = useRouter();
    const { id: attemptId } = useParams();

    const [test, setTest] = useState<any>(null);
    const [attempt, setAttempt] = useState<any>(null);

    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const [timeLeft, setTimeLeft] = useState(0);

    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    // ✅ 1. FETCH ATTEMPT
    useEffect(() => {
        const fetchAttempt = async () => {
            try {
                const res = await fetch(
                    BACKEND_URL + `/api/attempt/${attemptId}`,
                    { credentials: "include" }
                );

                const data = await res.json();
                if (!res.ok) return;

                // 🔥 REDIRECT IF NOT ACTIVE
                if (data.attempt.status !== "in_progress") {
                    router.replace(`/main/test/result/${data.attempt._id}`);
                    return;
                }

                setAttempt(data.attempt);
                setTest(data.attempt.test);

            } catch (err) {
                console.error(err);
            }
        };

        if (attemptId) fetchAttempt();
    }, [attemptId, router]);

    // ✅ 2. TIMER
    useEffect(() => {
        if (!attempt) return;

        const start = new Date(attempt.startedAt).getTime();
        const duration = attempt.duration * 60 * 1000;

        const updateTimer = () => {
            const now = Date.now();
            const remaining = start + duration - now;

            if (remaining <= 0) {
                submitTest();
            } else {
                setTimeLeft(Math.floor(remaining / 1000));
            }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
    }, [attempt]);

    // ✅ 3. PREVENT ACCIDENTAL EXIT
    useEffect(() => {
        const handleLeave = (e: BeforeUnloadEvent) => {
            e.preventDefault();
            e.returnValue = "";
        };

        window.addEventListener("beforeunload", handleLeave);
        return () => window.removeEventListener("beforeunload", handleLeave);
    }, []);

    if (!test) return null;

    const questions = test.questions;
    const q = questions[current];

    const selectOption = (index: number) => {
        const updated = [...answers];
        updated[current] = index;
        setAnswers(updated);
    };

    // ✅ SUBMIT FUNCTION (SAFE)
    const submitTest = async () => {
        if (loading) return;

        try {
            setLoading(true);

            const res = await fetch(
                BACKEND_URL + "/api/attempt/submit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        attemptId,
                        answers,
                    }),
                }
            );

            const data = await res.json();
            if (!res.ok) return;

            router.replace(`/main/test/result/${data.attemptId}`);

        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex">

            {/* MAIN */}
            <div className="flex-1 p-8">

                <div className="flex justify-between items-center mb-6">
                    <p className="font-bold">
                        Question {current + 1} / {questions.length}
                    </p>

                    <p className="font-bold">
                        Time Left: {Math.floor(timeLeft / 60)}:
                        {String(timeLeft % 60).padStart(2, "0")}
                    </p>
                </div>

                <div className="card mb-6">
                    <p className="font-semibold">{q.question}</p>
                </div>

                <div className="space-y-4">
                    {q.options.map((opt: string, i: number) => (
                        <div
                            key={i}
                            onClick={() => selectOption(i)}
                            className="card cursor-pointer"
                            style={
                                answers[current] === i
                                    ? { backgroundColor: "var(--primary)", color: "white" }
                                    : {}
                            }
                        >
                            {opt}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-8">

                    <button
                        className="button-secondary"
                        onClick={() => setCurrent((c) => Math.max(0, c - 1))}
                    >
                        Previous
                    </button>

                    {current === questions.length - 1 ? (
                        <button
                            disabled={loading}
                            className={`${loading ? "opacity-65 cursor-not-allowed" : ""}`}
                            onClick={submitTest}
                        >
                            {loading ? "Submitting" : "Submit test"}
                        </button>
                    ) : (
                        <button onClick={() => setCurrent((c) => c + 1)}>
                            Next
                        </button>
                    )}

                </div>

            </div>

            {/* SIDEBAR */}
            <div className="w-64 border-l-2 border-black p-6 bg-secondary overflow-y-auto">
                <p className="font-bold mb-4">Questions</p>

                <div className="grid grid-cols-3 gap-2">
                    {questions.map((_: any, i: number) => (
                        <div
                            key={i}
                            onClick={() => setCurrent(i)}
                            className="card text-center cursor-pointer"
                            style={
                                answers[i] !== undefined
                                    ? { backgroundColor: "var(--primary)", color: "white" }
                                    : {}
                            }
                        >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}