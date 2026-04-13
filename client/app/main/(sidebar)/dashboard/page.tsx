"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";
import Loader2 from "@/components/Loader2";

export default function Dashboard() {
  const router = useRouter();
  const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL!;
  const [attempts, setAttempts] = useState<any[]>([]);
  const [visibleCount, setVisibleCount] = useState(3);
  const [loading, setLoading] = useState(true);

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

  const last = attempts[0];

  const avgScore = attempts.length > 0 ? Math.round(attempts.reduce((a, b) => a + b.accuracy, 0) / attempts.length) : 0;

  if (loading) {
    return <Loader2 />
  }

  if (attempts.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold">
            Dashboard
          </h1>

          <button onClick={() => router.push("/main/tests")}>
            Take Test
          </button>
        </div>

        <div className="flex flex-col items-center justify-center py-16 text-center">
          <img src="/NotFound2.png" className="w-65 mb-6" />

          <h2 className="text-xl font-extrabold mb-2">
            No tests attempted yet
          </h2>

          <p className="opacity-70 mb-6 max-w-md">
            Start your first test to unlock analytics,
            performance tracking and insights
          </p>

          <div className="flex gap-3">
            <button className="w-full md:w-48" onClick={() => router.push("/main/tests")} >
              Take a Test
            </button>

            <button className="button-secondary w-full md:w-48" onClick={() => router.push("/main/create/generate")} >
              Generate AI Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold">
          Dashboard
        </h1>

        <button onClick={() => router.push("/main/tests")}>
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
              {last?.test?.title}
            </h2>

            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-600">
                  Score
                </p>
                <p className="font-bold">
                  {Math.round(last.score)}%
                </p>
              </div>

              <div>
                <p className="text-gray-600">
                  Accuracy
                </p>
                <p className="font-bold">
                  {Math.round(last.accuracy)}%
                </p>
              </div>

              <div>
                <p className="text-gray-600">
                  Time
                </p>
                <p className="font-bold">
                  {Math.round(
                    last.timeTaken / 60
                  )}{" "}
                  min
                </p>
              </div>
            </div>
          </div>

          <div className="text-sm text-right">
            <p className="text-gray-600">
              Strongest
            </p>
            <p className="font-bold mb-2">
              {last?.test?.subjects?.[0] ||
                "-"}
            </p>

            <p className="text-gray-600">
              Weakest
            </p>
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

      <div>
        <h3 className="font-bold text-2xl mb-4">
          Recent Tests
        </h3>

        <div className="space-y-3 text-sm">
          {attempts.slice(0, visibleCount).map((a) => (
            <div key={a._id} className="flex flex-col md:flex-row gap-5 card items-center">
              <div className="flex w-full md:w-2/3">
                <div className="w-full md:w-1/2">
                  <span>
                    {a.test?.title ||
                      "AI Test"}
                  </span>
                </div>

                <div className="w-full md:w-1/2 flex items-center justify-end md:justify-center">
                  <span className="font-bold">
                    {Math.round(a.accuracy)}
                    %
                  </span>
                </div>
              </div>

              <div className="w-full md:w-1/3 flex justify-center md:justify-end">
                <button onClick={() => router.push(`/main/attempt/${a._id}`)} className="w-1/2 md:w-fit flex items-center gap-1 group" >
                  Analysis
                  <ArrowRight className="hidden md:flex group-hover:translate-x-1 transition-all duration-200" />
                </button>
              </div>
            </div>
          ))}

          {visibleCount <
            attempts.length && (
              <div className="w-full flex justify-end">
                <button onClick={() => setVisibleCount((prev) => prev + 10)} className="button-secondary mt-2">
                  Load more tests
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}