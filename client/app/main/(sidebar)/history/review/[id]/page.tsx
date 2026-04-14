"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Loader2 from "@/components/Loader2";

export default function AttemptReviewPage() {
  const { id } = useParams();
  const router = useRouter();

  const [attempt, setAttempt] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const fetchAttempt = async () => {
      try {
        const res = await fetch(
          process.env.NEXT_PUBLIC_BACKEND_URL + `/api/attempt/${id}`,
          { credentials: "include" }
        );

        const data = await res.json();
        setAttempt(data.attempt);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempt();
  }, [id]);

  if (loading) return <Loader2 />;
  if (!attempt) return null;

  const questions = attempt.test?.questions || [];
  const answers = attempt.answers || [];

  const q = questions[active];
  const selected = answers[active];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold">
            {attempt.test?.title}
          </h1>

          <p className="text-sm opacity-70">
            Attempted on {new Date(attempt.createdAt).toLocaleString()}
          </p>
        </div>

        <button onClick={() => router.push(`/main/test/preview/${attempt.test._id}`)}>
          Retake test
        </button>
      </div>

      {/* SUMMARY */}
      <div className="card2 flex justify-between items-center">
        <div className="flex gap-20">

          <div>
            <p className="text-sm opacity-70">
              Score
            </p>
            <p className="text-2xl font-bold">
              {attempt.score}
            </p>
          </div>

          <div>
            <p className="text-sm opacity-70">
              Accuracy
            </p>
            <p className="text-2xl font-bold">
              {Math.round(attempt.accuracy)}%
            </p>
          </div>

          <div>
            <p className="text-sm opacity-70">
              Time
            </p>
            <p className="text-2xl font-bold">
              {Math.round((attempt.timeTaken || 0) / 60)} min
            </p>
          </div>

        </div>

        <div className="text-right">
          <p className="text-sm opacity-70">
            Questions
          </p>
          <p className="text-2xl font-bold">
            {questions.length}
          </p>
        </div>
      </div>

      {/* PERFORMANCE */}
      <div className="flex gap-6">
        <div className="card flex-1">
          <p className="text-sm opacity-70">
            Correct
          </p>
          <p className="text-2xl font-bold text-primary">
            {attempt.correct}
          </p>
        </div>

        <div className="card flex-1">
          <p className="text-sm opacity-70">
            Wrong
          </p>
          <p className="text-2xl font-bold text-[#ef4444]">
            {attempt.wrong}
          </p>
        </div>

        <div className="card flex-1">
          <p className="text-sm opacity-70">
            Skipped
          </p>
          <p className="text-2xl font-bold">
            {attempt.skipped}
          </p>
        </div>
      </div>

      {/* QUESTION NAV */}
      <div>
        <h2 className="text-xl font-extrabold">
          Questions
        </h2>
      </div>

      {/* QUESTION */}
      {q && (
        <div className="card space-y-4">

          <h3 className="font-bold">
            Question {active + 1}
          </h3>

          <p>{q.question}</p>

          <div className="space-y-2">
            {q.options.map((opt: string, i: number) => {

              const correct = q.correctAnswer;
              const isSelected = selected === i;
              const isCorrect = correct === i;
              const isSkipped = selected === undefined;

              let cls = "p-3 border flex items-center justify-between";

              if (isSelected && isCorrect) {
                cls += " bg-primary text-white";
              }
              else if (isSelected && !isCorrect) {
                cls += " bg-[#ef4444] text-white";
              }
              else if (!isSkipped && isCorrect) {
                cls += " border-green-600 border-2";
              }
              else if (isSkipped && isCorrect) {
                cls += " bg-yellow-400";
              }

              return (
                <div key={i} className={cls}>
                  <span>{opt}</span>

                  {isSelected && isCorrect && (
                    <span className="font-bold">
                      ✓
                    </span>
                  )}

                  {isSelected && !isCorrect && (
                    <span className="font-bold">
                      ✕
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* NAV BUTTONS */}
          <div className="flex justify-between items-center pt-4">

            <button
              className="button-secondary"
              disabled={active === 0}
              onClick={() => setActive((p) => p - 1)}
            >
              ← Previous
            </button>

            <div className="text-sm opacity-70">
              {active + 1} / {questions.length}
            </div>

            <button
              disabled={active === questions.length - 1}
              onClick={() => setActive((p) => p + 1)}
            >
              Next →
            </button>

          </div>

        </div>
      )}

    </div>
  );
}