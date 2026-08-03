import Skeleton from './Skeleton'

export default function AnalyticsSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-(--border) pb-3">
        <div>
          <Skeleton className="h-4 w-24 mb-3" />
          <Skeleton className="h-10 w-52" />
        </div>

        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      {/* Hero */}
      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <div className="card2 p-6 space-y-5">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-14 w-32" />
          <Skeleton className="h-4 w-52" />

          <div className="grid gap-3">
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
            <Skeleton className="h-20" />
          </div>
        </div>

        <div className="card p-6">
          <Skeleton className="h-5 w-32 mb-2" />
          <Skeleton className="h-8 w-56 mb-6" />
          <Skeleton className="h-72 w-full" />
        </div>
      </div>

      {/* Focus cards */}
      <div className="space-y-4">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-8 w-64" />

        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
          <Skeleton className="h-44" />
        </div>
      </div>

      {/* Subject + Outcomes */}
      <div className="grid gap-6 xl:grid-cols-[1fr_0.7fr]">
        <div className="card p-6">
          <Skeleton className="h-6 w-44 mb-6" />

          <div className="space-y-5">
            {[1,2,3,4].map((i) => (
              <div key={i}>
                <div className="flex justify-between mb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-10" />
                </div>

                <Skeleton className="h-4 w-full rounded-full" />
              </div>
            ))}
          </div>
        </div>

        <div className="card p-6">
          <Skeleton className="h-6 w-36 mb-6" />

          <div className="space-y-4">
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
            <Skeleton className="h-16" />
          </div>
        </div>
      </div>

      {/* Recent attempts */}
      <div className="card p-6">
        <Skeleton className="h-6 w-44 mb-6" />

        <div className="space-y-3">
          {[1,2,3,4,5].map((i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      </div>
    </div>
  );
}