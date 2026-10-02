import Skeleton from "./Skeleton";

/** Mirrors the centered two-panel test preview card, padding included. */
export default function PreviewSkeleton() {
  return (
    <div className="flex min-h-screen flex-col px-4 py-5 md:px-8" aria-busy="true" aria-label="Loading test preview">
      <header className="flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-36" />
        <Skeleton className="h-5 w-32" />
      </header>

      <main className="flex flex-1 items-center justify-center py-6">
        <div className="grid w-full max-w-5xl overflow-hidden rounded-[24px] border border-(--border) bg-(--surface) md:grid-cols-[minmax(0,1fr)_19rem]">
          <section className="p-6 md:p-8">
            <div className="flex flex-wrap gap-2">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-20 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <Skeleton className="mt-4 h-10 w-4/5" />
            <Skeleton className="mt-3 h-4 w-72 max-w-full" />

            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="rounded-2xl border border-(--border) bg-(--bg-secondary) p-4">
                  <Skeleton className="h-3.5 w-20" />
                  <Skeleton className="mt-3 h-7 w-16" />
                </div>
              ))}
            </div>

            <div className="mt-6">
              <Skeleton className="h-3.5 w-40" />
              <div className="mt-3 flex flex-wrap gap-2">
                {[112, 88, 136, 96].map((width, i) => (
                  <div key={i} className="skeleton h-9 rounded-full" style={{ width }} />
                ))}
              </div>
            </div>

            <div className="mt-6 grid gap-x-6 gap-y-3 border-t border-(--border) pt-5 sm:grid-cols-2">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <Skeleton className="mt-0.5 h-4 w-4 shrink-0 rounded-sm" />
                  <Skeleton className="h-4 flex-1" />
                </div>
              ))}
            </div>
          </section>

          <aside className="border-t border-(--border) bg-(--bg-secondary) p-6 md:border-l md:border-t-0 md:p-7">
            <Skeleton className="h-3.5 w-32" />
            <div className="mt-3 flex items-end gap-2">
              <Skeleton className="h-14 w-20" />
              <Skeleton className="mb-1 h-5 w-10" />
            </div>
            <Skeleton className="mt-3 h-4 w-40" />

            <div className="mt-6 space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-[30px] w-[30px] shrink-0 rounded-[10px]" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="mt-1.5 h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 border-t border-(--border) pt-6">
              <Skeleton className="h-[46px] w-full rounded-xl" />
              <Skeleton className="mx-auto mt-3 h-3 w-44" />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
