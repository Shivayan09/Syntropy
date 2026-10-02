import Skeleton from "./Skeleton";

function FieldSkeleton() {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-12 w-full rounded-[14px]" />
    </div>
  );
}

export default function ProfileSkeleton() {
  return (
    <div className="mx-auto space-y-7" aria-busy="true" aria-label="Loading profile settings">
      {/* Header */}
      <section className="flex items-center justify-between border-b border-(--border) pb-2">
        <Skeleton className="h-5 w-28" />
        <Skeleton className="h-10 w-36 rounded-xl" />
      </section>

      <section className="space-y-6">
        {/* Identity + status */}
        <div className="flex flex-col gap-5 md:flex-row">
          <div className="card2 w-full p-6 md:w-1/2 md:p-7">
            <div className="flex items-center gap-5">
              <Skeleton className="h-24 w-24 shrink-0 rounded-full" />
              <div className="min-w-0 w-full">
                <div className="flex justify-end">
                  <Skeleton className="mb-3 h-4 w-24" />
                </div>
                <Skeleton className="h-8 w-48 max-w-full" />
                <Skeleton className="mt-3 h-4 w-56 max-w-full" />
                <Skeleton className="mt-4 h-[46px] w-28 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="card2 w-full p-5 md:w-1/2">
            <Skeleton className="h-4 w-28" />
            <div className="mt-5 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between gap-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-28" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Personal information */}
        <section className="card p-6 md:p-7">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="mt-2 h-8 w-64" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[...Array(4)].map((_, i) => (
              <FieldSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Academic details */}
        <section className="card p-6 md:p-7">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-8 w-56" />
            </div>
            <Skeleton className="h-[46px] w-32 rounded-xl" />
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <FieldSkeleton key={i} />
            ))}
          </div>
        </section>

        {/* Practice preferences */}
        <section className="card p-6 md:p-7">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="mt-2 h-8 w-64" />
          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <FieldSkeleton key={i} />
            ))}
          </div>
          <div className="mt-6">
            <Skeleton className="h-5 w-40" />
            <div className="mt-3 flex flex-col gap-3 sm:flex-row">
              <Skeleton className="h-12 flex-1 rounded-[14px]" />
              <Skeleton className="h-[46px] w-full rounded-xl sm:w-24" />
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-9 w-28" />
              ))}
            </div>
          </div>
        </section>

        {/* Subscription */}
        <section className="card p-6 md:p-7">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-9 w-48" />
              <Skeleton className="mt-3 h-4 w-80 max-w-full" />
            </div>
            <Skeleton className="h-[46px] w-32 rounded-xl" />
          </div>
          <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
            <Skeleton className="h-56 rounded-2xl" />
            <Skeleton className="h-56 rounded-2xl" />
          </div>
        </section>
      </section>
    </div>
  );
}
