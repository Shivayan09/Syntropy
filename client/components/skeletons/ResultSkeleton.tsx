import Skeleton from "./Skeleton";

export default function ResultSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-7" aria-busy="true" aria-label="Loading result">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-(--border) pb-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0 flex-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="mt-3 h-10 w-3/4 max-w-xl" />
          <Skeleton className="mt-3 h-4 w-80 max-w-full" />
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-[46px] w-28 rounded-xl" />
          <Skeleton className="h-[46px] w-40 rounded-xl" />
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        {/* Performance */}
        <div className="card2 p-6 md:p-7">
          <div className="flex items-start justify-between">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="h-7 w-7 rounded-full" />
          </div>

          <div className="mt-6 flex flex-col items-center gap-6 sm:flex-row">
            <Skeleton className="h-44 w-44 shrink-0 rounded-full" />
            <div className="w-full">
              <Skeleton className="h-9 w-56 max-w-full" />
              <Skeleton className="mt-3 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-5/6" />
              <Skeleton className="mt-4 h-4 w-48" />
            </div>
          </div>

          <div className="mt-7 grid grid-cols-3 gap-3 border-t border-(--border) pt-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-(--border) bg-(--surface) p-4">
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-3 h-8 w-12" />
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          {/* Distribution */}
          <div className="card p-6 md:p-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="mt-2 h-7 w-52" />
              </div>
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="mt-6 h-4 w-full rounded-[4px]" />
            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-2xl" />
              ))}
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="card p-5">
                <Skeleton className="h-5 w-5 rounded-md" />
                <Skeleton className="mt-4 h-3 w-20" />
                <Skeleton className="mt-2 h-7 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Question map */}
      <section className="card p-6 md:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-7 w-64" />
          </div>
          <Skeleton className="h-[46px] w-36 rounded-xl" />
        </div>
        <div className="mt-6 grid grid-cols-[repeat(auto-fill,minmax(2.75rem,1fr))] gap-2">
          {[...Array(20)].map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-lg" />
          ))}
        </div>
      </section>

      {/* Next steps */}
      <section className="grid gap-4 md:grid-cols-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className={`${i === 0 ? "card2" : "card"} p-5`}>
            <Skeleton className="h-6 w-6 rounded-md" />
            <Skeleton className="mt-4 h-6 w-44" />
            <Skeleton className="mt-2 h-4 w-full" />
          </div>
        ))}
      </section>
    </div>
  );
}
