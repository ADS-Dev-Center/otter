export function CredentialListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="glass rounded-xl p-4 flex items-center justify-between animate-pulse"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-(--glass-bg-raised)" />
            <div className="space-y-1.5">
              <div className="h-4 w-40 rounded bg-(--glass-bg-raised)" />
              <div className="h-3 w-24 rounded bg-(--glass-bg-raised)" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-5 w-16 rounded bg-(--glass-bg-raised)" />
            <div className="h-8 w-8 rounded-lg bg-(--glass-bg-raised)" />
            <div className="h-8 w-8 rounded-lg bg-(--glass-bg-raised)" />
          </div>
        </div>
      ))}
    </div>
  );
}
