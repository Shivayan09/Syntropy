"use client";

import { useRouter, useParams } from "next/navigation";

export default function TestPreview() {
  const router = useRouter();
  const { id } = useParams();

  const test = {
    title: "SDE Mock Test",
    difficulty: "Medium",
    questions: 20,
    time: 30,
    subjects: ["Arrays", "DBMS", "OS", "CN"],
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
            <p className="font-bold">{test.difficulty}</p>
          </div>

          <div className="card2">
            <p className="text-xs">Questions</p>
            <p className="font-bold">{test.questions}</p>
          </div>

          <div className="card2">
            <p className="text-xs">Time</p>
            <p className="font-bold">{test.time} mins</p>
          </div>

          <div className="card2">
            <p className="text-xs">Subjects</p>
            <p className="font-bold">{test.subjects.length}</p>
          </div>

        </div>

        <div className="mb-6">
          <p className="font-bold mb-2">Subjects</p>
          <div className="flex flex-wrap gap-2">
            {test.subjects.map((s) => (
              <div key={s} className="card bg-secondary text-sm px-3 py-1">
                {s}
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            className="button-secondary"
            onClick={() => router.back()}
          >
            Back
          </button>

          <button
            onClick={() => router.push(`/test/attempt/${id}`)}
          >
            Start Test
          </button>
        </div>

      </div>
    </div>
  );
}