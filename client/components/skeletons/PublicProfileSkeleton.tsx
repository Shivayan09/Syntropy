import Skeleton from "./Skeleton";

export default function PublicProfileSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-7" aria-busy="true" aria-label="Loading profile">
      {/* Header */}
      <section className="flex items-center justify-between gap-4 border-b border-(--border) pb-2">
        <Skeleton className="mb-3 h-5 w-40" />
        <Skeleton className="mb-3 h-5 w-32" />
      </section>

      {/* Identity + overview */}
      <section className="-mt-3 grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="card2 p-6 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Skeleton className="h-28 w-28 shrink-0 rounded-full" />

            <div className="min-w-0 flex-1">
              <Skeleton className="h-9 w-64 max-w-full" />
              <Skeleton className="mt-3 h-4 w-36" />

              <div className="mt-4 flex flex-wrap gap-2">
                <Skeleton className="h-8 w-40 rounded-full" />
                <Skeleton className="h-8 w-44 rounded-full" />
              </div>
            </div>
          </div>

          <div className="mt-6 border-t border-(--border) pt-5">
            <div className="flex items-end justify-between gap-4">
              <div>
                <Skeleton className="h-3.5 w-36" />
                <Skeleton className="mt-3 h-10 w-24" />
              </div>
              <Skeleton className="h-3.5 w-28" />
            </div>
            <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
          </div>
        </div>

        <div className="card p-6">
          <Skeleton className="h-3.5 w-20" />
          <div className="mt-5 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between gap-3">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-24" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card p-5">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-3 h-9 w-20" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
        ))}
      </section>

      {/* Breakdown */}
      <section className="card p-6">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
        <Skeleton className="mt-6 h-4 w-full rounded-[4px]" />
        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-2xl" />
          ))}
        </div>
      </section>
    </div>
  );
}
