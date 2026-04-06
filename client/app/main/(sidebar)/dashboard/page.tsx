"use client";

import { useRouter } from "next/navigation";
import { AlertTriangle, ArrowRight } from "lucide-react";

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="p-8 pt-20 md:pt-8 py-8">

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold">Dashboard</h1>

        <button onClick={() => router.push("/main/test")}>
          Take Test
        </button>
      </div>

      <div className="card2 bg-white mb-8">
        <div className="flex justify-between items-start">

          <div>
            <p className="text-sm text-gray-600 mb-1">
              Last Test
            </p>

            <h2 className="text-xl font-bold mb-2">
              DSA Mock 3
            </h2>

            <div className="flex gap-8 text-sm">
              <div>
                <p className="text-gray-600">Score</p>
                <p className="font-bold">72%</p>
              </div>

              <div>
                <p className="text-gray-600">Accuracy</p>
                <p className="font-bold">68%</p>
              </div>

              <div>
                <p className="text-gray-600">Time</p>
                <p className="font-bold">24 min</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-right">
            <p className="text-gray-600">Strongest</p>
            <p className="font-bold mb-2">OS</p>

            <p className="text-gray-600">Weakest</p>
            <p className="font-bold">DBMS</p>
          </div>

        </div>
      </div>

      <div className="flex flex-col-reverse md:flex-row gap-10 md:gap-0 justify-between">

        <div className="w-full md:w-2/3">
          <h3 className="font-bold text-2xl mb-4">
            Recent Tests
          </h3>

          <div className="space-y-3 text-sm">

            <div className="flex card justify-between items-center">
              <span>DSA Mock 1</span>
              <span className="font-bold">72%</span>
              <button className="flex items-center gap-1 group">
                Analysis
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
            <div className="flex card justify-between items-center">
              <span>DBMS test</span>
              <span className="font-bold">72%</span>
              <button className="flex items-center gap-1 group">
                Analysis
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
            <div className="flex card justify-between items-center">
              <span>OS  Quiz</span>
              <span className="font-bold">72%</span>
              <button className="flex items-center gap-1 group">
                Analysis
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
            <div className="flex card justify-between items-center">
              <span>DSA Test 2</span>
              <span className="font-bold">72%</span>
              <button className="flex items-center gap-1 group">
                Analysis
                <ArrowRight className="group-hover:translate-x-1 transition-all duration-200" />
              </button>
            </div>
          </div>
        </div>

        <div className="w-full md:w-1/3 md:pl-10">
          <h3 className="font-bold text-2xl mb-4">
            Recent Tests
          </h3>
          <div className="card2 bg-white">
            <p className="text-sm text-gray-600">
              Tests Taken
            </p>
            <p className="text-2xl font-bold">
              24
            </p>
          </div>

          <div className="card2 bg-white mt-5">
            <p className="text-sm text-gray-600">
              Avg Score
            </p>
            <p className="text-2xl font-bold">
              68%
            </p>
          </div>

          <div className="card2 bg-white mt-5">
            <p className="text-sm text-gray-600">
              Rank
            </p>
            <p className="text-2xl font-bold">
              #124
            </p>
          </div>
        </div>

      </div>

    </div>
  );
}