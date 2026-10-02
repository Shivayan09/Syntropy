import Skeleton from "./Skeleton";

export default function PracticeSkeleton() {
  return (
    <div className="space-y-5" aria-busy="true" aria-label="Loading practice set">
      {/* Header */}
      <section className="flex flex-col gap-4 border-b border-(--border) pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-[46px] w-24 rounded-xl" />
          <div>
            <Skeleton className="h-3.5 w-40" />
            <Skeleton className="mt-2 h-7 w-64 max-w-full" />
          </div>
        </div>

        <div className="flex gap-4">
          <Skeleton className="h-14 w-24 rounded-xl" />
          <Skeleton className="h-14 w-24 rounded-xl" />
        </div>
      </section>

      {/* Progress */}
      <Skeleton className="h-2 w-full rounded-full" />

      {/* Question card */}
      <article className="card">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-7 w-24 rounded-full" />
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-7 w-20 rounded-full" />
          </div>
          <Skeleton className="h-4 w-16" />
        </div>

        <Skeleton className="mt-6 h-7 w-full" />
        <Skeleton className="mt-3 h-7 w-5/6" />
        <Skeleton className="mt-3 h-7 w-1/2" />

        <div className="mt-6 space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="flex min-h-16 items-start gap-4 rounded-xl border border-(--border) bg-(--surface) p-4 md:p-5"
            >
              <Skeleton className="h-9 w-9 shrink-0 rounded-lg" />
              <Skeleton className="mt-2 h-5 w-2/3" />
            </div>
          ))}
        </div>

        <div className="mt-6 flex flex-col gap-3 border-t border-(--border) pt-5 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-[46px] w-full rounded-xl sm:w-32" />
          <Skeleton className="hidden h-4 w-56 sm:block" />
          <Skeleton className="h-[46px] w-full rounded-xl sm:w-28" />
        </div>
      </article>
    </div>
  );
}
