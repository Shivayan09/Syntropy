"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function TestPreview() {
    const router = useRouter();
    const { id } = useParams();
    const [test, setTest] = useState<any>(null);
    const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

    useEffect(() => {
        const fetchTest = async () => {
            try {
                const res = await fetch(BACKEND_URL + `/api/test/${id}`, { credentials: "include", });
                const data = await res.json();
                if (!res.ok) return;
                setTest(data.test);
            } catch (err) {
                console.error(err);
            }
        };
        if (id) fetchTest();
    }, [id]);

    if (!test) {
        return null;
    }

    const startTest = async () => {
        try {
            const res = await fetch(BACKEND_URL + "/api/attempt/start",
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ testId: id }),
                }
            );
            const data = await res.json();
            if (!res.ok) {
                return;
            } else {
                router.push(`/main/test/attempt/${data.attemptId}`);
            }
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-secondary">
            <div className="card bg-white max-w-xl w-full">

                <h1 className="text-2xl font-extrabold mb-2">
                    {test.title}
                </h1>

                <p className="text-sm mb-6 text-gray-600">
                    Review test details before starting
                </p>

                <div className="grid grid-cols-2 gap-4 mb-6">

                    <div className="card2">
                        <p className="text-xs">Difficulty</p>
                        <p className="font-bold">
                            {test.difficulty || "Mixed"}
                        </p>
                    </div>

                    <div className="card2">
                        <p className="text-xs">Questions</p>
                        <p className="font-bold">
                            {test.totalQuestions}
                        </p>
                    </div>

                    <div className="card2">
                        <p className="text-xs">Time</p>
                        <p className="font-bold">
                            {test.duration} mins
                        </p>
                    </div>

                    <div className="card2">
                        <p className="text-xs">Subjects</p>
                        <p className="font-bold">
                            {test.subjects?.length || 0}
                        </p>
                    </div>

                </div>

                <div className="mb-6">
                    <p className="font-bold mb-2">Subjects</p>

                    <div className="flex flex-wrap gap-2">
                        {test.subjects?.map((s: string) => (
                            <div key={s} className="card bg-secondary text-sm px-3 py-1">
                                {s}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex justify-between">
                    <button className="button-secondary" onClick={() => router.back()}>
                        Back
                    </button>

                    <button onClick={startTest} >
                        Start Test
                    </button>
                </div>

            </div>
        </div>
    );
}