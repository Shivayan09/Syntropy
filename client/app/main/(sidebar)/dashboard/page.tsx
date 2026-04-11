"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;

  const [attempts, setAttempts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(3); // start with 3

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        const res = await fetch(
          BACKEND_URL + "/api/attempt/my",
          { credentials: "include" }
        );

        const data = await res.json();
        setAttempts(data.attempts || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchAttempts();
  }, []);

  const last = attempts[0];

  const avgScore =
    attempts.length > 0
      ? Math.round(
        attempts.reduce((a, b) => a + b.accuracy, 0) /
        attempts.length
      )
      : 0;

  return (
    <div className="p-8 pt-20 md:pt-8 py-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>

        <button onClick={() => router.push("/main/test")}>
          Take Test
        </button>
      </div>

      <div className="card2 mb-8">

        <div className="flex justify-between items-start">

          <div>
            <p className="text-sm text-gray-600 mb-1">
              Last Test
            </p>

            <h2 className="text-xl font-bold mb-2">
              {last?.test?.title || "-"}
            </h2>

            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-600">Score</p>
                <p className="font-bold">
                  {last ? Math.round(last.score) : 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-600">Accuracy</p>
                <p className="font-bold">
                  {last ? Math.round(last.accuracy) : 0}%
                </p>
              </div>

              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-bold">
                  {last?.timeTaken
                    ? Math.round(last.timeTaken / 60)
                    : 0} min
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-right">
            <p className="text-gray-600">Strongest</p>
            <p className="font-bold mb-2">
              {last?.test?.subjects?.[0] || "-"}
            </p>

            <p className="text-gray-600">Weakest</p>
            <p className="font-bold">
              -
            </p>
          </div>

        </div>
      </div>
      <div className="my-7">
        <h3 className="font-bold text-2xl mb-4">
          Overall Stats
        </h3>
        <div className="flex flex-col md:flex-row gap-10">
          <div className="card2 w-full md:w-1/3">
            <p className="text-sm text-gray-600">
              Tests Taken
            </p>
            <p className="text-2xl font-bold">
              {attempts.length}
            </p>
          </div>

          <div className="card2 w-full md:w-1/3">
            <p className="text-sm text-gray-600">
              Avg Score
            </p>
            <p className="text-2xl font-bold">
              {avgScore}%
            </p>
          </div>

          <div className="card2 w-full md:w-1/3">
            <p className="text-sm text-gray-600">
              Rank
            </p>
            <p className="text-2xl font-bold">
              #124
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-10 md:gap-0 justify-between">


        <div className="w-full">
          <h3 className="font-bold text-2xl mb-4">
            Recent Tests
          </h3>

          <div className="space-y-3 text-sm">

            {attempts.slice(0, visibleCount).map((a) => (
              <div
                key={a._id}
                className="flex card justify-between items-center"
              >
                <span>{a.test?.title || "AI Test"}</span>

                <span className="font-bold">
                  {Math.round(a.accuracy)}%
                </span>

                <button
                  onClick={() =>
                    router.push(`/main/attempt/${a._id}`)
                  }
                  className="flex items-center gap-1 group"
                >
                  Analysis
                  <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
                </button>
              </div>
            ))}

            {visibleCount < attempts.length && (
              <div className="w-full flex justify-end">
                <button onClick={() => setVisibleCount((prev) => prev + 10) } className="button-secondary flex items-center gap-1 group mt-2">
                Load more tests
              </button>
              </div>
            )}

          </div>
        </div>



      </div>

    </div>
  );
}