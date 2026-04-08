"use client";

import { useRouter } from "next/navigation";

export default function ResultPage() {
  const router = useRouter();

  const result = {
    score: 14,
    total: 20,
    accuracy: 70,
    correct: 14,
    wrong: 4,
    skipped: 2,
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary p-6">

      <div className="card bg-white max-w-2xl w-full">

        <h1 className="text-2xl font-extrabold mb-6">
          Test Result
        </h1>

        {/* SCORE */}
        <div className="grid grid-cols-3 gap-4 mb-6">

          <div className="card2 text-center">
            <p className="text-xs">Score</p>
            <p className="font-bold text-xl">
              {result.score}/{result.total}
            </p>
          </div>

          <div className="card2 text-center">
            <p className="text-xs">Accuracy</p>
            <p className="font-bold text-xl">
              {result.accuracy}%
            </p>
          </div>

          <div className="card2 text-center">
            <p className="text-xs">Correct</p>
            <p className="font-bold text-xl">
              {result.correct}
            </p>
          </div>

        </div>

        {/* BREAKDOWN */}
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