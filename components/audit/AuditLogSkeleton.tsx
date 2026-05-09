import { Skeleton } from "@/components/ui/skeleton";

export function AuditLogSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl bg-(--glass-bg-hover)" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-6 w-28 rounded-lg bg-(--glass-bg-hover)" />
            <Skeleton className="h-4 w-64 rounded bg-(--glass-bg-hover)" />
          </div>
        </div>
        <Skeleton className="h-7 w-24 rounded-full bg-(--glass-bg-hover)" />
      </div>

      {/* Toolbar */}
      <div className="glass rounded-xl p-3">
        <div className="flex gap-3">
          <Skeleton className="h-9 flex-1 rounded-lg bg-(--glass-bg-hover)" />
          <Skeleton className="h-9 w-[130px] rounded-lg bg-(--glass-bg-hover)" />
          <Skeleton className="h-9 w-[140px] rounded-lg bg-(--glass-bg-hover)" />
        </div>
      </div>

      {/* Filter pills */}
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <Skeleton key={i} className="h-8 w-20 rounded-full bg-(--glass-bg-hover)" />
        ))}
      </div>

      {/* Table rows */}
      <div className="glass rounded-xl overflow-hidden">
        <div className="glass-raised px-4 py-3">
          <Skeleton className="h-4 w-48 rounded bg-(--glass-bg-hover)" />
        </div>
        <div className="divide-y divide-(--glass-border-subtle)">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 px-4 py-3">
              <Skeleton className="h-4 w-6 rounded bg-(--glass-bg-hover)" />
              <Skeleton className="h-4 w-16 rounded bg-(--glass-bg-hover)" />
              <Skeleton className="h-6 w-20 rounded-full bg-(--glass-bg-hover)" />
              <div className="flex flex-1 flex-col gap-1">
                <Skeleton className="h-4 w-40 rounded bg-(--glass-bg-hover)" />
                <Skeleton className="h-3 w-24 rounded bg-(--glass-bg-hover)" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="size-7 rounded-full bg-(--glass-bg-hover)" />
                <div className="flex flex-col gap-1">
                  <Skeleton className="h-4 w-28 rounded bg-(--glass-bg-hover)" />
                  <Skeleton className="h-3 w-36 rounded bg-(--glass-bg-hover)" />
                </div>
              </div>
              <Skeleton className="h-6 w-20 rounded-full bg-(--glass-bg-hover)" />
              <Skeleton className="h-4 w-32 rounded bg-(--glass-bg-hover)" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
