import Skeleton from "./Skeleton";

export default function LeaderboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-7">

      {/* Header */}
      <section className="flex flex-col gap-5 border-b border-(--border) pb-2 lg:flex-row lg:items-end lg:justify-between">

        <div>
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-9 w-56" />
        </div>

        <Skeleton className="h-11 w-full lg:w-80 rounded-xl" />

      </section>

      {/* Summary cards */}
      <section className="grid gap-4 md:grid-cols-3">

        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${i === 0 ? "card2" : "card"} p-5`}>
            <Skeleton className="h-6 w-6 rounded-full mb-4" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="mt-4 h-8 w-40" />
            <Skeleton className="mt-3 h-3 w-28" />
          </div>
        ))}

      </section>

      {/* Desktop table header */}
      <div className="hidden lg:grid grid-cols-[6rem_1fr_8rem_8rem_8rem] gap-4 px-5">
        <Skeleton className="h-4 w-12" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
        <Skeleton className="h-4 w-20" />
      </div>

      {/* Leaderboard rows */}
      <section className="space-y-3">

        {[...Array(8)].map((_, i) => (
          <div key={i} className="card p-5">

            {/* Desktop */}
            <div className="hidden lg:grid lg:grid-cols-[6rem_1fr_8rem_8rem_8rem] lg:items-center gap-4">

              <div className="flex items-center gap-3">
                <Skeleton className="h-8 w-8 rounded-md" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              <div>
                <Skeleton className="h-6 w-48" />
                <Skeleton className="mt-2 h-3 w-60" />
              </div>

              <Skeleton className="h-5 w-14" />
              <Skeleton className="h-5 w-10" />
              <Skeleton className="h-5 w-14" />
            </div>

            {/* Mobile */}
            <div className="flex justify-between lg:hidden">

              <div className="flex gap-3">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-10 w-10 rounded-full" />
              </div>

              <Skeleton className="h-8 w-8 rounded-full" />

            </div>

            <div className="mt-4 lg:hidden space-y-3">
              <Skeleton className="h-6 w-44" />
              <Skeleton className="h-3 w-56" />
            </div>

          </div>
        ))}

      </section>

    </div>
  );
}