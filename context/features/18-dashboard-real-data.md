# Feature 18 — Dashboard Real Data

## Status

Pending implementation.

## Problem

`app/(app)/dashboard/page.tsx` is entirely static. Every number, name, and
activity entry is hardcoded mock data. The greeting says "Good morning, Rizky",
stats show made-up counts, division cards show fake divisions, and activity rows
show fake actors. The page currently makes zero API calls and zero Prisma queries.

## Goal

Replace all mock data with real, division-scoped data fetched server-side on
every request. The page must stay a Server Component; no `"use client"` at the
page level.

---

## Sections and Their Real Data Sources

### 1. Greeting

**Current:** `"Good morning, Rizky 👋"` (hardcoded)

**Real:** Clerk user's first name, resolved server-side.

```ts
import { currentUser } from "@clerk/nextjs/server";

const user = await currentUser();
const firstName = user?.firstName ?? "there";
```

Time-of-day prefix ("Good morning / afternoon / evening") derived from
`new Date().getHours()` in server context.

---

### 2. Stats Cards

**Current:** Four cards with hardcoded values `3`, `12`, `47`, `128`.

**Real:** Four parallel Prisma `count()` queries, all scoped to the user's
division IDs.

```ts
const userDivisionIds = await getUserDivisionIds(userId);
const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

const [divisionCount, projectCount, credentialCount, auditCount] =
  await Promise.all([
    prisma.divisionMembership.count({ where: { clerkId: userId } }),
    prisma.project.count({
      where: { divisionId: { in: userDivisionIds } },
    }),
    prisma.credential.count({
      where: { project: { divisionId: { in: userDivisionIds } } },
    }),
    prisma.auditLog.count({
      where: {
        divisionId: { in: userDivisionIds },
        timestamp: { gte: sevenDaysAgo },
      },
    }),
  ]);
```

Subtext changes accordingly:
- "My Divisions" subtext: list first 3 division names joined by `, ` (e.g. `"QA, Dev, DevOps"`)
- "Total Projects": `"across all divisions"` (static)
- "Credentials": `"stored & encrypted"` (static)
- "Audit Events": `"last 7 days"` (static)

---

### 3. My Divisions

**Current:** Three hardcoded `mockDivisions` objects with fake counts.

**Real:** Query memberships with division data and counts in one Prisma call.

```ts
const memberships = await prisma.divisionMembership.findMany({
  where: { clerkId: userId },
  include: {
    division: {
      include: {
        _count: { select: { memberships: true, projects: true } },
      },
    },
  },
  orderBy: { createdAt: "asc" },
});
```

For each division, the credential count requires an extra query because Prisma
cannot count across two hops in a single `_count`. Use a grouped aggregate:

```ts
const credentialCounts = await prisma.credential.groupBy({
  by: ["projectId"],
  where: {
    project: { divisionId: { in: userDivisionIds } },
  },
  _count: { id: true },
});

// Then join by divisionId via the Project table
const projectsWithDivision = await prisma.project.findMany({
  where: { divisionId: { in: userDivisionIds } },
  select: { id: true, divisionId: true },
});
```

Or simpler: fetch `credentialCount` per division directly:

```ts
const divisionCredentialCounts = await Promise.all(
  userDivisionIds.map((divId) =>
    prisma.credential.count({
      where: { project: { divisionId: divId } },
    })
  )
);
```

Palette (accent colors) per division is already handled by `getDivisionPalette(index)`
from `lib/divisions.ts` — same as `GET /api/divisions` does today.

**Fields per division card:**
- `name` — `m.division.name`
- `role` — human-readable from `m.role` enum value (`DIVISION_OWNER` → `"Owner"`, etc.)
- `projectCount` — `m.division._count.projects`
- `memberCount` — `m.division._count.memberships`
- `credentialCount` — from the per-division count query above
- accent palette — `getDivisionPalette(index)`

---

### 4. Recent Activity

**Current:** Seven hardcoded `mockActivity` rows with fake actor names and actions.

**Real:** Fetch the 7 most recent audit log entries across all user divisions
directly from Prisma (not via HTTP), resolve actor names from the `User` table.

```ts
const recentLogs = await prisma.auditLog.findMany({
  where: { divisionId: { in: userDivisionIds } },
  include: { division: { select: { name: true } } },
  orderBy: { timestamp: "desc" },
  take: 7,
});

// Resolve actors from User table (same pattern as GET /api/audit)
const actorIds = [...new Set(recentLogs.map((l) => l.actorId))];
const dbUsers = await prisma.user.findMany({
  where: { clerkId: { in: actorIds } },
  select: { clerkId: true, name: true, imageUrl: true },
});
const actorMap = new Map(dbUsers.map((u) => [u.clerkId, u]));
```

**Mapping `AuditAction` to display data:**  
Reuse the `ACTION_META` map already defined in
`components/audit/AuditLogRow.tsx`. Extract it to a shared file (e.g.
`lib/audit-meta.ts`) so both the audit log table and the dashboard can import it
without duplicating the icon/color/label config.

**`timeAgo` formatting:** Use a small helper (no external lib needed):

```ts
function timeAgo(date: Date): string {
  const diff = Date.now() - date.getTime();
  if (diff < 60_000) return "Just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)} min ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)} hr ago`;
  if (diff < 172_800_000) return "Yesterday";
  return `${Math.floor(diff / 86_400_000)} days ago`;
}
```

---

### 5. Quick Access

**Current:** Five hardcoded project names and credential counts.

**Real:** The 5 most recently created projects across all user's divisions, with
their credential count.

```ts
const recentProjects = await prisma.project.findMany({
  where: { divisionId: { in: userDivisionIds } },
  include: {
    _count: { select: { credentials: true } },
    division: { select: { name: true } },
  },
  orderBy: { createdAt: "desc" },
  take: 5,
});
```

**Fields per quick-access row:**
- `projectName` — `p.name`
- `division` — `p.division.name`
- `credCount` — `p._count.credentials`
- `href` — `/projects/${p.slug}` (project slug already exists)

Quick Access rows should be `<Link>` elements so users can click through to the
project directly.

---

## Data Fetching Strategy

All queries run in a single `Promise.all()` at the top of the Server Component
to minimize total latency. Do not call the HTTP API routes from within the page —
query Prisma directly to avoid the network round-trip.

```ts
export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const user = await currentUser();
  const userDivisionIds = await getUserDivisionIds(userId);

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

  const [
    memberships,
    projectCount,
    credentialCount,
    auditCount,
    recentLogs,
    recentProjects,
  ] = await Promise.all([
    prisma.divisionMembership.findMany({ /* ... */ }),
    prisma.project.count({ /* ... */ }),
    prisma.credential.count({ /* ... */ }),
    prisma.auditLog.count({ /* ... */ }),
    prisma.auditLog.findMany({ /* ... */ }),
    prisma.project.findMany({ /* ... */ }),
  ]);

  // credential counts per division (parallel, after memberships resolved)
  const divisionCredCounts = await Promise.all(
    memberships.map((m) =>
      prisma.credential.count({
        where: { project: { divisionId: m.divisionId } },
      })
    )
  );

  // actor resolution for recent logs
  // ...

  return <DashboardView ... />;
}
```

Because actor resolution involves N Clerk/DB lookups, extract that block into
a server-only helper function (similar to `resolveActor` in `GET /api/audit`).

---

## Component Structure

The page itself stays a Server Component. Pass all resolved data as props to
presentational sub-components:

```
app/(app)/dashboard/page.tsx        ← Server Component, all data fetching
  └── components/dashboard/
        DashboardStats.tsx          ← 4 stat cards (receives counts)
        DivisionCards.tsx           ← My Divisions grid (receives division array)
        RecentActivity.tsx          ← Activity feed (receives resolved log array)
        QuickAccess.tsx             ← Project shortcuts (receives project array)
```

All four sub-components are presentational only — no `"use client"` unless a
specific interactive element requires it (none currently do).

---

## Empty States

| Section          | Empty condition                        | Display                                 |
| ---------------- | -------------------------------------- | --------------------------------------- |
| Stats            | All zeros on first day                 | Show `0` — valid state                  |
| My Divisions     | `memberships.length === 0`             | Layout redirect to `/onboarding` handles this (in `app/(app)/layout.tsx`) |
| Recent Activity  | `recentLogs.length === 0`              | "No activity yet" row in the feed panel |
| Quick Access     | `recentProjects.length === 0`          | "No projects yet — create one" empty state with link to `/projects` |

---

## Role Label Mapping

The `Role` enum values in the DB need to be displayed as readable labels in
the division cards:

```ts
const ROLE_LABELS: Record<string, string> = {
  DIVISION_OWNER: "Owner",
  DIVISION_ADMIN: "Admin",
  MEMBER: "Member",
  SUPER_ADMIN: "Super Admin",
};
```

---

## Files to Change

| File | Change |
| ---- | ------ |
| `app/(app)/dashboard/page.tsx` | Replace all mock arrays with server-side Prisma queries; use `currentUser()` for greeting |
| `components/audit/AuditLogRow.tsx` | Extract `ACTION_META` to `lib/audit-meta.ts` |
| `lib/audit-meta.ts` | New file — shared `ACTION_META` map (icon, color, label) |
| `components/dashboard/DashboardStats.tsx` | New — presentational stat cards |
| `components/dashboard/DivisionCards.tsx` | New — My Divisions grid |
| `components/dashboard/RecentActivity.tsx` | New — activity feed |
| `components/dashboard/QuickAccess.tsx` | New — project shortcuts with `<Link>` |

---

## What Does NOT Change

- Page remains a Server Component — no `"use client"` at the page level.
- Accent palette system (`getDivisionPalette`) is already correct — reuse as-is.
- Glass card markup, layout grid, and Tailwind v4 class patterns are preserved.
- No new API routes needed — all data fetched directly from Prisma on the server.
- No localStorage reads on the dashboard — the user's full division set comes
  from the DB session, not from client-side storage.
