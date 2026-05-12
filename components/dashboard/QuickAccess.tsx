import Link from "next/link";
import { CaretRight, FolderLock } from "@phosphor-icons/react/dist/ssr";

export type QuickProject = {
  id: string;
  name: string;
  slug: string;
  divisionName: string;
  credentialCount: number;
};

type Props = { projects: QuickProject[] };

export function QuickAccess({ projects }: Props) {
  return (
    <div className="glass rounded-xl p-5">
      <h2
        className="text-sm font-semibold uppercase tracking-wider mb-4"
        style={{ color: "var(--text-muted)" }}
      >
        Quick Access
      </h2>

      {projects.length === 0 ? (
        <div className="py-4 text-center">
          <p className="text-sm" style={{ color: "var(--text-muted)" }}>
            No projects yet.
          </p>
          <Link
            href="/projects"
            className="text-xs mt-1 inline-block"
            style={{ color: "var(--accent-primary)" }}
          >
            Create one →
          </Link>
        </div>
      ) : (
        <div>
          {projects.map((proj, idx) => {
            const isLast = idx === projects.length - 1;
            return (
              <Link
                key={proj.id}
                href={`/projects/${proj.slug}`}
                className="flex items-center gap-3 py-2.5 cursor-pointer transition-opacity hover:opacity-80"
                style={
                  !isLast
                    ? { borderBottom: "1px solid var(--glass-border-subtle)" }
                    : undefined
                }
              >
                <div
                  className="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
                  style={{ background: "var(--glass-bg-raised)" }}
                >
                  <FolderLock
                    weight="duotone"
                    size={14}
                    color="var(--text-subtle)"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-semibold truncate"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {proj.name}
                  </p>
                  <p
                    className="text-[10px]"
                    style={{ color: "var(--text-muted)" }}
                  >
                    {proj.divisionName} · {proj.credentialCount} credentials
                  </p>
                </div>
                <CaretRight
                  weight="duotone"
                  size={12}
                  color="var(--text-muted)"
                />
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
