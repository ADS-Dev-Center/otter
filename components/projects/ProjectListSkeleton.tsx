import { Skeleton } from "@/components/ui/skeleton";

export function ProjectListSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-5">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="glass rounded-xl flex flex-col overflow-hidden">
          <Skeleton className="h-0.5 w-full" />
          <div className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-3/4 rounded" />
                <Skeleton className="h-3 w-1/3 rounded" />
              </div>
            </div>
            <Skeleton className="h-3 w-full rounded" />
            <Skeleton className="h-px w-full" />
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
