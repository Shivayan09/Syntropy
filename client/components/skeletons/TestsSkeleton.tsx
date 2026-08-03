import Skeleton from "./Skeleton";

export default function TestsSkeleton() {
  return (
    <div className="space-y-7">

      {/* Header */}
      <section className="border-b border-(--border) pb-2">
        <Skeleton className="h-5 w-32 mb-3" />
        <Skeleton className="h-9 w-56" />
      </section>

      {/* Filters */}
      <section className="grid gap-4 lg:grid-cols-[auto_1fr_auto] lg:items-center">

        <div className="flex gap-3">
          <Skeleton className="h-10 w-24 rounded-md" />
          <Skeleton className="h-10 w-32 rounded-md" />
          <Skeleton className="h-10 w-36 rounded-md" />
        </div>

        <Skeleton className="h-11 w-full rounded-xl" />

        <Skeleton className="h-11 w-52 rounded-xl" />

      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 md:grid-cols-3">

        {[...Array(3)].map((_, i) => (
          <div key={i} className="card">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="mt-4 h-10 w-20" />
            <Skeleton className="mt-3 h-3 w-32" />
          </div>
        ))}

      </section>

      {/* Table heading */}
      <div className="hidden grid-cols-[1fr_9rem_8rem_10rem_7rem] gap-4 px-5 lg:grid">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="ml-auto h-4 w-16" />
      </div>

      {/* Test rows */}
      <section className="space-y-3">

        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="border border-(--border) rounded-2xl p-4 grid gap-4 lg:grid-cols-[1fr_9rem_8rem_10rem_7rem] lg:items-center"
          >
            <div>
              <Skeleton className="h-6 w-16 mb-3 rounded-full" />
              <Skeleton className="h-6 w-72" />
            </div>

            <Skeleton className="h-5 w-14" />

            <Skeleton className="h-5 w-16" />

            <Skeleton className="h-5 w-24" />

            <div className="flex justify-end">
              <Skeleton className="h-10 w-28 rounded-xl" />
            </div>
          </div>
        ))}

      </section>

    </div>
  );
}