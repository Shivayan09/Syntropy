import Skeleton from "./Skeleton";

export default function ReviewSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6" aria-busy="true" aria-label="Loading answer review">
      {/* Header */}
      <section className="border-b border-(--border) pb-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-5 w-36" />
          <Skeleton className="h-5 w-32" />
        </div>
        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 flex-1">
            <Skeleton className="h-10 w-3/4 max-w-xl" />
            <Skeleton className="mt-3 h-4 w-80 max-w-full" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-[46px] w-36 rounded-xl" />
            <Skeleton className="h-[46px] w-32 rounded-xl" />
          </div>
        </div>
      </section>

      {/* Summary */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className={`${i === 0 ? "card2" : "card"} p-5`}>
            <Skeleton className="h-5 w-5 rounded-md" />
            <Skeleton className="mt-4 h-3 w-20" />
            <Skeleton className="mt-2 h-9 w-24" />
            <Skeleton className="mt-2 h-3 w-28" />
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]">
        {/* Question */}
        <article className="card p-6 md:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-7 w-28 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
            <Skeleton className="h-4 w-16" />
          </div>

          <Skeleton className="mt-6 h-7 w-full" />
          <Skeleton className="mt-3 h-7 w-11/12" />
          <Skeleton className="mt-3 h-7 w-2/3" />

          <div className="mt-6 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="flex min-h-16 items-start gap-4 rounded-2xl border border-(--border) bg-(--surface) p-4 md:p-5"
              >
                <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
                <Skeleton className="mt-2 h-5 w-2/3" />
              </div>
            ))}
          </div>

          <div className="mt-6 rounded-2xl border border-(--border) bg-(--bg-secondary) p-5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="mt-3 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-4/5" />
          </div>

          <div className="mt-6 flex items-center justify-between gap-3 border-t border-(--border) pt-5">
            <Skeleton className="h-[46px] w-32 rounded-xl" />
            <Skeleton className="hidden h-3 w-52 sm:block" />
            <Skeleton className="h-[46px] w-28 rounded-xl" />
          </div>
        </article>

        {/* Aside */}
        <aside className="space-y-5 xl:sticky xl:top-6 xl:self-start">
          <div className="card p-5">
            <Skeleton className="h-3.5 w-20" />
            <div className="mt-4 grid grid-cols-3 gap-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16 rounded-xl" />
              ))}
            </div>
          </div>

          <div className="card p-5">
            <div className="flex items-center justify-between">
              <div>
                <Skeleton className="h-3.5 w-24" />
                <Skeleton className="mt-2 h-6 w-32" />
              </div>
              <Skeleton className="h-6 w-6 rounded-md" />
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {[...Array(4)].map((_, i) => (
                <Skeleton key={i} className="h-8 w-16 rounded-full" />
              ))}
            </div>
            <div className="mt-4 grid grid-cols-5 gap-2">
              {[...Array(20)].map((_, i) => (
                <Skeleton key={i} className="h-11 rounded-lg" />
              ))}
            </div>
          </div>
        </aside>
      </section>
    </div>
  );
}
