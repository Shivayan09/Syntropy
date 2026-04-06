"use client";

export default function Analytics() {
  return (
    <div className="px-4 md:px-8 py-20 md:py-8 max-w-7xl">

      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold">Analytics</h1>
        <p className="text-sm text-gray-600">
          Detailed performance insights
        </p>
      </div>

      {/* STAT STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">

        <div className="card2 bg-white">
          <p className="text-xs text-gray-600">Tests</p>
          <p className="text-2xl font-bold">24</p>
        </div>

        <div className="card2 bg-white">
          <p className="text-xs text-gray-600">Average</p>
          <p className="text-2xl font-bold">68%</p>
        </div>

        <div className="card2 bg-white">
          <p className="text-xs text-gray-600">Best</p>
          <p className="text-2xl font-bold">81%</p>
        </div>

        <div className="card2 bg-white">
          <p className="text-xs text-gray-600">Improvement</p>
          <p className="text-2xl font-bold text-primary">+12%</p>
        </div>

      </div>

      {/* GRID */}
      <div className="grid md:grid-cols-2 gap-8">

        {/* SUBJECT RANKING */}
        <div className="card bg-white">
          <h2 className="font-bold mb-4">
            Subject Ranking
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>OS</span>
              <span className="font-semibold">81%</span>
            </div>

            <div className="flex justify-between">
              <span>DSA</span>
              <span className="font-semibold">72%</span>
            </div>

            <div className="flex justify-between">
              <span>CN</span>
              <span className="font-semibold">64%</span>
            </div>

            <div className="flex justify-between">
              <span>DBMS</span>
              <span className="font-semibold">54%</span>
            </div>

          </div>
        </div>

        {/* DIFFICULTY */}
        <div className="card bg-white">
          <h2 className="font-bold mb-4">
            Difficulty Breakdown
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Easy</span>
              <span className="font-semibold">92%</span>
            </div>

            <div className="flex justify-between">
              <span>Medium</span>
              <span className="font-semibold">71%</span>
            </div>

            <div className="flex justify-between">
              <span>Hard</span>
              <span className="font-semibold">38%</span>
            </div>

          </div>
        </div>

        {/* TIME */}
        <div className="card bg-white">
          <h2 className="font-bold mb-4">
            Time Metrics
          </h2>

          <div className="space-y-3 text-sm">

            <div className="flex justify-between">
              <span>Avg / Question</span>
              <span className="font-semibold">42s</span>
            </div>

            <div className="flex justify-between">
              <span>Slowest</span>
              <span className="font-semibold">DBMS</span>
            </div>

            <div className="flex justify-between">
              <span>Fastest</span>
              <span className="font-semibold">OS</span>
            </div>

          </div>
        </div>

        {/* WEAK TOPICS */}
        <div className="card bg-white">
          <h2 className="font-bold mb-4">
            Weak Topics
          </h2>

          <div className="space-y-3 text-sm">

            <div>DBMS — Normalization</div>
            <div>OS — Deadlocks</div>
            <div>CN — Congestion</div>
            <div>DSA — Graphs</div>

          </div>
        </div>

      </div>

    </div>
  );
}