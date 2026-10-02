import Skeleton from "./Skeleton";

export default function HistoryRowsSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Loading attempts">
      {[...Array(rows)].map((_, i) => (
        <div
          key={i}
          className="card grid gap-4 p-5 lg:grid-cols-[1fr_5rem_7rem_6rem_10rem_11rem] lg:items-center"
        >
          <div className="min-w-0">
            <Skeleton className="mb-3 h-3.5 w-24" />
            <Skeleton className="h-6 w-3/4 max-w-sm" />
          </div>

          <Skeleton className="h-5 w-10" />
          <Skeleton className="h-5 w-12" />
          <Skeleton className="h-5 w-14" />
          <Skeleton className="h-5 w-24" />

          <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
            <Skeleton className="h-11 w-full rounded-xl sm:w-24" />
            <Skeleton className="h-11 w-full rounded-xl sm:w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}
