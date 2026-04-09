"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ResultPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const fetchResult = async () => {
      try {
        const res = await fetch(
          `${BACKEND_URL}/api/attempt/${id}`,
          { credentials: "include" }
        );
        const data = await res.json();
        console.log("RESULT DATA:", data);
        if (!res.ok) {
          setLoading(false);
          return;
        }
        setResult(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchResult();
  }, [id]);

  if (loading) {
    return <div className="p-10">Loading result...</div>;
  }

  if (!result) {
    return <div className="p-10">Result not found</div>;
  }

  const total =
    result.correct + result.wrong + result.skipped;

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-6">
      <div className="card bg-white max-w-2xl w-full">

        <h1 className="text-2xl font-extrabold mb-6">
          Test Result
        </h1>

        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="card2 text-center">
            <p className="text-xs">Score</p>
            <p className="font-bold text-xl">
              {result.score}/{total}
            </p>
          </div>

          <div className="card2 text-center">
            <p className="text-xs">Accuracy</p>
            <p className="font-bold text-xl">
              {Math.round(result.accuracy)}%
            </p>
          </div>

          <div className="card2 text-center">
            <p className="text-xs">Correct</p>
            <p className="font-bold text-xl">
              {result.correct}
            </p>
          </div>

        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="card">
            Wrong: {result.wrong}
          </div>

          <div className="card">
            Skipped: {result.skipped}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            className="button-secondary"
            onClick={() => router.push("/main/test")}
          >
            Back to Tests
          </button>

          <button>
            Review Answers
          </button>
        </div>

      </div>
    </div>
  );
}