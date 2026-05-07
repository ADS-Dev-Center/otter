import type { ReactNode } from "react";

const highlights = [
  "Encrypted credentials with division-level access control",
  "OTP-first sign in with a clean, focused workflow",
  "Simple audit visibility without the clutter",
];

export default function AuthPageShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-svh" style={{ color: "var(--text-primary)" }}>
      <div className="grid min-h-svh lg:grid-cols-[minmax(0,1fr)_minmax(0,1.08fr)]">
        <aside
          className="hidden lg:flex lg:flex-col lg:justify-between px-10 py-12"
          style={{
            background: "var(--glass-bg)",
            backdropFilter: "var(--glass-blur)",
            WebkitBackdropFilter: "var(--glass-blur)",
            borderRight: "1px solid var(--glass-border)",
          }}
        >
          <div className="space-y-10">
            <div className="flex items-center gap-3">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold"
                style={{
                  background: "var(--glass-bg-raised)",
                  border: "1px solid var(--glass-border)",
                  color: "var(--text-primary)",
                }}
              >
                O
              </div>
              <div>
                <p
                  className="text-sm font-semibold tracking-[0.24em] uppercase"
                  style={{ color: "var(--text-muted)" }}
                >
                  Otter
                </p>
                <p className="text-xs" style={{ color: "var(--text-muted)" }}>
                  Organized Token & Trusted Environment Repository
                </p>
              </div>
            </div>

            <div className="max-w-sm space-y-4">
              <p
                className="text-3xl font-semibold tracking-tight"
                style={{ color: "var(--text-primary)" }}
              >
                {title}
              </p>
              <p
                className="text-sm leading-6"
                style={{ color: "var(--text-subtle)" }}
              >
                {description}
              </p>
            </div>
          </div>

          <ul
            className="space-y-3 text-sm"
            style={{ color: "var(--text-subtle)" }}
          >
            {highlights.map((item) => (
              <li key={item} className="flex gap-3">
                <span
                  className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ background: "var(--accent-primary)" }}
                />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>

        <main className="flex items-center justify-center px-6 py-10 sm:px-10 lg:px-14">
          <div className="w-full max-w-110">{children}</div>
        </main>
      </div>
    </div>
  );
}
