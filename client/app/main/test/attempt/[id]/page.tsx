"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function AttemptPage() {
  const router = useRouter();
  const { id } = useParams();

  const questions = [
    {
      question: "Which data structure uses FIFO?",
      options: ["Stack", "Queue", "Tree", "Graph"],
      answer: 1,
    },
    {
      question: "Which is O(log n)?",
      options: ["Binary search", "Bubble sort", "DFS", "BFS"],
      answer: 0,
    },
  ];

  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((t) => t - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = t % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  const selectOption = (index: number) => {
    const updated = [...answers];
    updated[current] = index;
    setAnswers(updated);
  };

  const submitTest = () => {
    router.push(`/test/result/${id}`);
  };

  const q = questions[current];

  return (
    <div className="min-h-screen flex">

      {/* LEFT */}
      <div className="flex-1 p-8">

        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <p className="font-bold">
            Question {current + 1} / {questions.length}
          </p>

          <div className="card px-4 py-2">
            {formatTime(timeLeft)}
          </div>
        </div>

        {/* QUESTION */}
        <div className="card mb-6">
          <p className="font-semibold">
            {q.question}
          </p>
        </div>

        {/* OPTIONS */}
        <div className="space-y-4">
          {q.options.map((opt, i) => (
            <div
              key={i}
              onClick={() => selectOption(i)}
              className={`
                card cursor-pointer
                ${answers[current] === i ? "bg-primary text-white" : ""}
              `}
            >
              {opt}
            </div>
          ))}
        </div>

        {/* NAV */}
        <div className="flex justify-between mt-8">

          <button
            className="button-secondary"
            onClick={() => setCurrent((c) => Math.max(0, c - 1))}
          >
            Previous
          </button>

          {current === questions.length - 1 ? (
            <button onClick={submitTest}>
              Submit Test
            </button>
          ) : (
            <button
              onClick={() => setCurrent((c) => c + 1)}
            >
              Next
            </button>
          )}

        </div>

      </div>

      {/* RIGHT NAVIGATOR */}
      <div className="w-64 border-l-2 border-black p-6 bg-secondary">
        <p className="font-bold mb-4">Questions</p>

        <div className="grid grid-cols-5 gap-2">
          {questions.map((_, i) => (
            <div
              key={i}
              onClick={() => setCurrent(i)}
              className={`
                card text-center cursor-pointer
                ${answers[i] !== undefined ? "bg-primary text-white" : ""}
              `}
            >
              {i + 1}
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}