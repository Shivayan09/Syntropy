import Skeleton from "./Skeleton";

export default function DashboardSkeleton() {
  return (
    <div className="space-y-7">

      {/* Header */}
      <section className="flex flex-col gap-6 border-b border-(--border) pb-4 lg:flex-row lg:justify-between">
        <div className="space-y-3">
          <Skeleton className="h-10 w-80" />
          <Skeleton className="h-5 w-56" />
        </div>

        <div className="card w-full max-w-sm">
          <Skeleton className="h-5 w-32 mb-3" />
          <Skeleton className="h-10 w-40" />
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-5 md:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="card min-h-36">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-5 h-10 w-24" />
            <Skeleton className="mt-3 h-3 w-full" />
          </div>
        ))}
      </section>

      {/* Readiness + Subject */}
      <section className="grid gap-6 xl:grid-cols-[0.7fr_1.3fr]">

        <div className="card space-y-6">
          <div className="flex justify-between">
            <div>
              <Skeleton className="h-4 w-28 mb-2" />
              <Skeleton className="h-8 w-40" />
            </div>

            <Skeleton className="h-8 w-8 rounded-full" />
          </div>

          <div className="flex justify-center">
            <Skeleton className="h-48 w-48 rounded-full" />
          </div>

          <Skeleton className="h-11 w-full rounded-xl" />
        </div>

        <div className="card">
          <div className="mb-6 flex justify-between">
            <div>
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-56" />
            </div>

            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>

          <div className="space-y-5">
            {[...Array(4)].map((_, i) => (
              <div key={i}>
                <div className="mb-2 flex justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-8" />
                </div>

                <Skeleton className="h-4 w-full rounded-full" />

                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            ))}
          </div>
        </div>

      </section>

      {/* Recent Attempts */}
      <section>
        <div className="mb-5 flex justify-between">
          <div>
            <Skeleton className="h-4 w-28 mb-2" />
            <Skeleton className="h-8 w-72" />
          </div>

          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>

        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="card grid gap-5 p-5 md:grid-cols-[1fr_auto_auto]"
            >
              <div>
                <Skeleton className="h-6 w-56 mb-3" />
                <Skeleton className="h-4 w-64" />
              </div>

              <div className="grid grid-cols-2 gap-4 md:w-48">
                <div>
                  <Skeleton className="h-3 w-10 mb-2" />
                  <Skeleton className="h-6 w-14" />
                </div>

                <div>
                  <Skeleton className="h-3 w-14 mb-2" />
                  <Skeleton className="h-6 w-14" />
                </div>
              </div>

              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}