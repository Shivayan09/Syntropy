import Skeleton from "./Skeleton";

/** Dashed drop-zone + button, matching SyllabusUpload. */
export function SyllabusUploadSkeleton() {
  return (
    <div className="space-y-4">
      <div className="border-2 border-dashed border-(--border) bg-(--surface) p-5">
        <div className="flex items-start gap-4">
          <Skeleton className="h-12 w-12 shrink-0 rounded-md" />
          <div className="flex-1">
            <Skeleton className="h-3.5 w-28" />
            <Skeleton className="mt-2 h-6 w-48" />
            <div className="mt-3 flex gap-2">
              <Skeleton className="h-7 w-16 rounded-md" />
              <Skeleton className="h-7 w-20 rounded-md" />
            </div>
          </div>
        </div>
      </div>
      <Skeleton className="h-[46px] w-40 rounded-xl" />
    </div>
  );
}

/** Subject cards with units, matching the SyllabusManager editor. */
export function SyllabusManagerSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading syllabus">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <Skeleton className="h-5 w-52" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <Skeleton className="hidden h-[46px] w-36 rounded-xl md:block" />
      </div>

      <div className="my-5">
        <Skeleton className="mb-3 h-3.5 w-80 max-w-full" />
        <SyllabusUploadSkeleton />
      </div>

      {[...Array(2)].map((_, i) => (
        <div key={i} className="card mb-5">
          <div className="flex items-center justify-between">
            <Skeleton className="h-6 w-48" />
            <div className="flex items-center gap-3">
              <Skeleton className="h-[46px] w-32 rounded-xl" />
              <Skeleton className="h-4 w-4 rounded-sm" />
            </div>
          </div>

          <div className="mt-5 flex flex-wrap gap-5">
            {[...Array(3)].map((_, j) => (
              <div key={j} className="min-w-56 flex-1">
                <Skeleton className="h-5 w-40" />
                <Skeleton className="mt-2 ml-5 h-3.5 w-full" />
                <Skeleton className="mt-1.5 ml-5 h-3.5 w-3/4" />
              </div>
            ))}
          </div>
        </div>
      ))}

      <Skeleton className="h-[46px] w-36 rounded-xl" />
    </div>
  );
}

/** The education settings page: heading, three fields, then the manager. */
export function EducationSkeleton() {
  return (
    <div aria-busy="true" aria-label="Loading educational info">
      <div className="mb-5">
        <Skeleton className="h-8 w-56" />
        <Skeleton className="mt-3 h-4 w-96 max-w-full" />
      </div>

      <section>
        <Skeleton className="mb-4 h-5 w-44" />
        <div className="mb-10 grid gap-4 md:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-[14px]" />
          ))}
        </div>

        <SyllabusManagerSkeleton />
      </section>
    </div>
  );
}

/** Rows in the syllabus page list, also shown while an upload is processing. */
export function SyllabusListSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading syllabus list">
      {[...Array(rows)].map((_, i) => (
        <div key={i} className="card flex flex-col justify-between gap-3 md:flex-row md:items-center">
          <div>
            <Skeleton className="h-5 w-56 max-w-full" />
            <Skeleton className="mt-2 h-4 w-20" />
          </div>
          <Skeleton className="h-[46px] w-full rounded-xl md:w-24" />
        </div>
      ))}
    </div>
  );
}

/** The whole syllabus page on first load. */
export function SyllabusPageSkeleton() {
  return (
    <div className="space-y-8" aria-busy="true" aria-label="Loading syllabus">
      <div>
        <Skeleton className="h-8 w-36" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      </div>

      <div className="card space-y-4">
        <Skeleton className="h-12 w-full rounded-[14px]" />
        <Skeleton className="h-[46px] w-44 rounded-xl" />
      </div>

      <SyllabusListSkeleton rows={3} />
    </div>
  );
}
