"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AttemptPage() {
    const router = useRouter();
    const { id } = useParams();
    const [test, setTest] = useState<any>(null);
    const [current, setCurrent] = useState(0);
    const [answers, setAnswers] = useState<number[]>([]);
    const [loading, setLoading] = useState(false);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(BACKEND_URL + `/api/test/${id}/attempt`, { credentials: "include" });
                const data = await res.json();
                if (!res.ok) {
                    return;
                } else {
                    setTest(data.test);
                }
            } catch (err) {
                console.error(err);
            }
        };
        if (id) fetchTest();
    }, [id]);

    if (!test) {
        return null;
    }

    const questions = test.questions;
    const q = questions[current];

    const selectOption = (index: number) => {
        const updated = [...answers];
        updated[current] = index;
        setAnswers(updated);
    };

    const submitTest = async () => {
        try {
            setLoading(true);
            const res = await fetch(BACKEND_URL + "/api/attempt/submit",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        testId: id,
                        answers,
                    }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                return;
            } else {
                router.push(`/main/test/result/${data.attemptId}`);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="h-screen overflow-hidden flex">

            <div className="flex-1 p-8">

                <div className="flex justify-between items-center mb-6">
                    <p className="font-bold">
                        Question {current + 1} / {questions.length}
                    </p>
                </div>

                <div className="card mb-6">
                    <p className="font-semibold">
                        {q.question}
                    </p>
                </div>

                <div className="space-y-4">
                    {q.options.map((opt: string, i: number) => (
                        <div key={i} onClick={() => selectOption(i)} className="card cursor-pointer" style={answers[current] === i ? { backgroundColor: "var(--primary)", color: "white" } : {}} >
                            {opt}
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-8">

                    <button className="button-secondary" onClick={() => setCurrent((c) => Math.max(0, c - 1))}>
                        Previous
                    </button>

                    {current === questions.length - 1 ? (
                        <button disabled={loading} className={`${loading ? 'opacity-65 cursor-not-allowed' : ''}`} onClick={submitTest}>
                            {loading ? 'Submitting' : 'Submit test'}
                        </button>
                    ) : (
                        <button onClick={() => setCurrent((c) => c + 1)}>
                            Next
                        </button>
                    )}

                </div>

            </div>

            <div className="w-64 border-l-2 border-black p-6 bg-secondary overflow-y-auto">
                <p className="font-bold mb-4">Questions</p>

                <div className="grid grid-cols-3 gap-2">
                    {questions.map((_: any, i: number) => (
                        <div key={i} onClick={() => setCurrent(i)} className="card text-center cursor-pointer" style={answers[i] !== undefined ? { backgroundColor: "var(--primary)", color: "white" } : {}} >
                            {i + 1}
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}