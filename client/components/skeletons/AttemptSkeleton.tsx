import Skeleton from "./Skeleton";

/**
 * Full-screen skeleton for the timed attempt interface. The attempt route
 * renders without the sidebar or page padding, so this owns its own layout.
 */
export default function AttemptSkeleton() {
  return (
    <div
      className="min-h-screen bg-(--bg-secondary) text-(--text) xl:grid xl:h-screen xl:overflow-hidden xl:grid-cols-[minmax(0,1fr)_22rem]"
      aria-busy="true"
      aria-label="Loading attempt"
    >
      <section className="flex min-h-0 flex-col">
        {/* Mobile header */}
        <div className="border-b border-(--border) bg-(--surface) px-4 py-3 xl:hidden">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <Skeleton className="h-3 w-28" />
              <Skeleton className="mt-2 h-5 w-3/4" />
              <Skeleton className="mt-2 h-3 w-24" />
            </div>
            <Skeleton className="h-14 w-24 shrink-0" />
          </div>

          <div className="mt-3 flex items-center gap-3">
            <Skeleton className="h-2 flex-1 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-hidden px-4 py-5 pb-36 md:px-8 xl:pb-5">
          <div className="mx-auto max-w-5xl space-y-5">
            {/* Question card */}
            <div className="border border-(--border) bg-(--surface) px-5 py-5 md:px-7 md:py-6">
              <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-40 rounded-md" />
                  <Skeleton className="h-7 w-24 rounded-md" />
                </div>
                <Skeleton className="h-4 w-28" />
              </div>

              <Skeleton className="h-7 w-full" />
              <Skeleton className="mt-3 h-7 w-11/12" />
              <Skeleton className="mt-3 h-7 w-2/3" />
            </div>

            {/* Options */}
            <div className="space-y-3 pb-4">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="flex min-h-16 items-start gap-4 rounded-xl border border-(--border) bg-(--surface) p-4 md:p-5"
                >
                  <Skeleton className="h-9 w-9 shrink-0 rounded-md" />
                  <Skeleton className="mt-2 h-5 w-3/5" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom action bar */}
        <div className="sticky bottom-0 shrink-0 border-t border-(--border) bg-(--surface) px-4 py-4 md:px-8 xl:static xl:border-t-0 xl:bg-transparent xl:px-4 xl:py-5">
          <div className="mx-auto flex max-w-5xl flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:flex">
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-36" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-40" />
            </div>
            <div className="grid grid-cols-2 gap-3 sm:flex sm:justify-end">
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-32" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-36" />
            </div>
          </div>
        </div>
      </section>

      {/* Desktop palette */}
      <aside className="hidden min-h-0 border-l border-(--border) bg-(--surface) p-5 xl:block">
        <div className="mb-5 border-b border-(--border) pb-5">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="mt-2 h-6 w-4/5" />
          <Skeleton className="mt-4 h-20 w-full" />
          <div className="mt-4">
            <div className="mb-2 flex items-center justify-between">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-3 w-10" />
            </div>
            <Skeleton className="h-2 w-full rounded-full" />
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="mt-2 h-7 w-28" />
          </div>
          <Skeleton className="h-6 w-6 rounded-md" />
        </div>

        <div className="mb-5 grid grid-cols-3 gap-2">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-16" />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2">
          {[...Array(20)].map((_, i) => (
            <Skeleton key={i} className="h-11 rounded-md" />
          ))}
        </div>

        <div className="mt-5 border-t border-(--border) py-5">
          <Skeleton className="h-[46px] w-full rounded-xl" />
        </div>
      </aside>
    </div>
  );
}
