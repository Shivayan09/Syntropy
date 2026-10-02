import Skeleton from "./Skeleton";

/**
 * Mirrors the PageHeading + StepSection + BuilderBar layout used by the
 * AI test and aptitude set builders while their catalog loads.
 */
export default function BuilderSkeleton() {
  return (
    <div className="relative pb-2" aria-busy="true" aria-label="Loading builder">
      {/* Page heading */}
      <section className="mb-6 flex flex-col gap-4 border-b border-(--border) pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-4 w-40" />
          <Skeleton className="mt-4 h-10 w-80 max-w-full" />
          <Skeleton className="mt-3 h-4 w-full max-w-xl" />
        </div>

        <Skeleton className="h-16 w-40 rounded-2xl" />
      </section>

      {/* Step 1: option cards */}
      <section className="mb-8">
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-[10px]" />
          <div>
            <Skeleton className="h-5 w-48" />
            <Skeleton className="mt-2 h-3.5 w-72 max-w-full" />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="select-card is-static">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-6 w-6 rounded-md" />
                    <Skeleton className="h-5 w-40" />
                  </div>
                  <Skeleton className="mt-3 h-3.5 w-full" />
                  <Skeleton className="mt-2 h-3.5 w-2/3" />
                </div>
                <Skeleton className="h-[22px] w-[22px] shrink-0 rounded-[7px]" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Step 2: chips */}
      <section className="mb-8">
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-[10px]" />
          <div>
            <Skeleton className="h-5 w-56" />
            <Skeleton className="mt-2 h-3.5 w-80 max-w-full" />
          </div>
        </div>

        <div className="soft-panel">
          <Skeleton className="mb-4 h-3 w-28" />
          <div className="flex flex-wrap gap-2">
            {[88, 120, 72, 104, 96, 132, 80, 112].map((width, i) => (
              <div key={i} className="skeleton h-8 rounded-full" style={{ width }} />
            ))}
          </div>
        </div>
      </section>

      {/* Step 3: controls */}
      <section className="mb-8">
        <div className="mb-4 flex gap-3">
          <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-[10px]" />
          <div>
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-3.5 w-64 max-w-full" />
          </div>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <div key={i}>
              <div className="mb-3 flex items-center justify-between">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
              <Skeleton className="h-3 w-full rounded-full" />
            </div>
          ))}
        </div>
      </section>

      {/* Builder bar */}
      <div className="builder-bar">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="hidden flex-wrap gap-6 sm:flex">
            {[...Array(3)].map((_, i) => (
              <div key={i}>
                <Skeleton className="h-3 w-16" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))}
          </div>
          <Skeleton className="h-[46px] w-full rounded-xl lg:w-52" />
        </div>
      </div>
    </div>
  );
}
