"use client";

import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  BookOpen,
  BarChart3,
  LogOut,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="h-screen flex">

      {/* SIDEBAR */}
      <aside className="w-60 border-r-2 border-black bg-white p-6 flex flex-col justify-between">

        <div>
          <p className="font-extrabold text-lg mb-8 text-primary">
            TESTIFY
          </p>

          <nav className="space-y-4 text-sm font-bold">
            <div className="flex items-center gap-3 cursor-pointer">
              <LayoutDashboard size={18} />
              Dashboard
            </div>

            <div className="flex items-center gap-3 cursor-pointer">
              <BookOpen size={18} />
              Tests
            </div>

            <div className="flex items-center gap-3 cursor-pointer">
              <BarChart3 size={18} />
              Analytics
            </div>
          </nav>
        </div>

        <div
          className="flex items-center gap-3 text-sm font-bold cursor-pointer"
          onClick={() => router.push("/login")}
        >
          <LogOut size={18} />
          Logout
        </div>
      </aside>

      {/* MAIN */}
      <main className="flex-1 bg-secondary p-8 overflow-y-auto">

        {/* TOP BAR */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-extrabold">
            Dashboard
          </h1>

          <button onClick={() => router.push("/tests")}>
            Take Test
          </button>
        </div>

        {/* STATS */}
        <div className="grid md:grid-cols-3 gap-6 mb-10">

          <div className="relative">
            <div className="absolute top-2 left-2 w-full h-full bg-primary border-2 border-black"></div>
            <div className="relative bg-white border-2 border-black p-5">
              <p className="text-sm text-gray-600">Tests Taken</p>
              <p className="text-2xl font-extrabold">24</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-2 left-2 w-full h-full bg-primary border-2 border-black"></div>
            <div className="relative bg-white border-2 border-black p-5">
              <p className="text-sm text-gray-600">Avg Score</p>
              <p className="text-2xl font-extrabold">68%</p>
            </div>
          </div>

          <div className="relative">
            <div className="absolute top-2 left-2 w-full h-full bg-primary border-2 border-black"></div>
            <div className="relative bg-white border-2 border-black p-5">
              <p className="text-sm text-gray-600">Rank</p>
              <p className="text-2xl font-extrabold">#124</p>
            </div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-8">

          {/* RECENT TESTS */}
          <div className="relative">
            <div className="absolute top-2 left-2 w-full h-full bg-white border-2 border-black"></div>

            <div className="relative bg-white border-2 border-black p-6">
              <h2 className="font-bold mb-4">Recent Tests</h2>

              <div className="space-y-4 text-sm">

                {[
                  { name: "DSA Mock 1", score: "72%" },
                  { name: "DBMS Test", score: "54%" },
                  { name: "OS Quiz", score: "81%" },
                ].map((t, i) => (
                  <div key={i} className="flex justify-between">
                    <span>{t.name}</span>
                    <span className="font-bold">{t.score}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WEAK AREAS */}
          <div className="relative">
            <div className="absolute top-2 left-2 w-full h-full bg-white border-2 border-black"></div>

            <div className="relative bg-white border-2 border-black p-6">
              <h2 className="font-bold mb-4">Focus Areas</h2>

              <div className="space-y-4 text-sm">

                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} />
                  <span>DBMS - Normalization</span>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} />
                  <span>OS - Deadlocks</span>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle size={16} />
                  <span>CN - Protocols</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* PROGRESS */}
        <div className="mt-10 relative">
          <div className="absolute top-2 left-2 w-full h-full bg-primary border-2 border-black"></div>

          <div className="relative bg-white border-2 border-black p-6">
            <h2 className="font-bold mb-4">Progress Trend</h2>

            <div className="flex items-center gap-4 text-sm">
              <TrendingUp />
              <span>+12% improvement in last 7 days</span>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}