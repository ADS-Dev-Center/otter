## goals

Implement real audit log persistence and wire the `/auditlog` page to live data.
Redesign the page UI so every surface uses the full liquid glassmorphism system
(all 5 effects: frost, splay, refraction, depression, depth) and matches the
visual language established in the credentials and projects pages.

---

## what needs to change

### 1 — schema extension

The current `AuditLog` model only tracks credential actions (`CREDENTIAL_CREATE`,
`CREDENTIAL_UPDATE`, `CREDENTIAL_DELETE`, `CREDENTIAL_VIEW`). The UI already
expects project/member/division events. Extend the enum and model.

**New `AuditAction` enum values:**

```prisma
enum AuditAction {
  CREDENTIAL_CREATE
  CREDENTIAL_UPDATE
  CREDENTIAL_DELETE
  CREDENTIAL_VIEW
  CREDENTIAL_COPY
  PROJECT_CREATE
  PROJECT_UPDATE
  PROJECT_DELETE
  MEMBER_INVITE
  MEMBER_ROLE_CHANGE
  MEMBER_REMOVE
  DIVISION_CREATE
  DIVISION_RENAME
  DIVISION_DELETE
}
```

**Extended `AuditLog` model:**

```prisma
model AuditLog {
  id           String      @id @default(cuid())
  actorId      String      // Clerk user ID — resolve name/email at read time
  action       AuditAction
  resourceType String      // "CREDENTIAL" | "PROJECT" | "MEMBER" | "DIVISION"
  resourceId   String?     // ID of the affected record
  resourceName String      // human-readable name at time of event (snapshot)
  credentialId String?
  divisionId   String?
  metadata     Json?       // { oldValue?, newValue?, changeDescription? }
  timestamp    DateTime    @default(now())
  credential   Credential? @relation(fields: [credentialId], references: [id], onDelete: SetNull)
  division     Division?   @relation(fields: [divisionId], references: [id], onDelete: SetNull)
}
```

Add a `Division` back-relation in the `Division` model:
```prisma
auditLogs AuditLog[]
```

Run migration:
```bash
npx prisma migrate dev --name extend-audit-log
```

---

### 2 — api route

Create `app/api/audit/route.ts` — `GET` only (audit logs are append-only).

**Auth / scoping:**
- Resolve Clerk session → `clerkId`
- Call `getUserDivisionIds(clerkId)` → scope query to those divisions only
- `SUPER_ADMIN` may pass `divisionId=all` to bypass scope filter

**Query params (all optional):**
| param | type | default |
|-------|------|---------|
| `divisionId` | string \| `all` | `all` |
| `action` | AuditAction \| `ALL` | `ALL` |
| `resourceType` | string \| `ALL` | `ALL` |
| `dateRange` | `24h` \| `7d` \| `30d` \| `all` | `30d` |
| `q` | string | — |
| `page` | number | `1` |
| `perPage` | number | `15` |

**Response shape:**

```ts
{
  data: {
    entries: AuditEntryDTO[]
    total: number
    page: number
    pages: number
  }
}
```

**`AuditEntryDTO`** — resolve actor identity from Clerk at query time using
`clerkClient().users.getUser(actorId)`:

```ts
type AuditEntryDTO = {
  id: string
  timestamp: string        // ISO string
  action: AuditAction
  resourceType: string
  resourceId: string | null
  resourceName: string
  actorId: string
  actorName: string        // firstName + lastName from Clerk
  actorEmail: string       // primaryEmailAddress from Clerk
  divisionId: string | null
  divisionName: string | null
  metadata: {
    oldValue?: string
    newValue?: string
    changeDescription?: string
  } | null
}
```

Cache Clerk user lookups in a `Map<string, { name; email }>` within the request
handler — a single audit page response may contain multiple entries for the same
actor, avoid duplicate Clerk API calls.

---

### 3 — write audit events in existing routes

Every mutation route must write to `AuditLog` before returning. Audit writes
are fire-and-forget within the request — do not block the response on them, but
do await them inside the handler so errors are logged.

**Where to add writes:**

| Route | Event |
|-------|-------|
| `POST /api/credentials` | `CREDENTIAL_CREATE` |
| `PUT /api/credentials/[id]` | `CREDENTIAL_UPDATE` |
| `DELETE /api/credentials/[id]` | `CREDENTIAL_DELETE` |
| `GET /api/credentials/[id]/reveal` | `CREDENTIAL_VIEW` |
| `POST /api/projects` | `PROJECT_CREATE` |
| `PATCH /api/projects/[id]` | `PROJECT_UPDATE` |
| `DELETE /api/projects/[id]` | `PROJECT_DELETE` |
| `POST /api/divisions` | `DIVISION_CREATE` |
| `PATCH /api/divisions/[id]` | `DIVISION_RENAME` |
| `DELETE /api/divisions/[id]` | `DIVISION_DELETE` |

**Helper to create audit entries** — add to `lib/audit.ts`:

```ts
import { prisma } from "@/lib/prisma"
import { AuditAction } from "@/app/generated/prisma"

type AuditPayload = {
  actorId: string
  action: AuditAction
  resourceType: string
  resourceId?: string
  resourceName: string
  credentialId?: string
  divisionId?: string
  metadata?: {
    oldValue?: string
    newValue?: string
    changeDescription?: string
  }
}

export async function writeAuditLog(payload: AuditPayload) {
  await prisma.auditLog.create({ data: payload })
}
```

---

### 4 — ui redesign

The current page at `app/(app)/auditlog/page.tsx` uses mock data and some
surface-level glass classes. Replace mock data with real API calls and fix
the liquid glass rendering to match the established system.

#### 4a — convert to hybrid server/client component

- Extract the `"use client"` interactive shell into
  `components/audit/AuditLogTable.tsx`
- The page itself becomes a Server Component that passes initial data and
  division list as props
- This eliminates the 400ms artificial delay and avoids a client-side waterfall

```
app/(app)/auditlog/page.tsx          ← Server Component, fetches initial page
components/audit/AuditLogTable.tsx   ← Client Component, handles filter state
components/audit/AuditLogRow.tsx     ← pure presentational row
components/audit/AuditLogSkeleton.tsx
```

#### 4b — glass surfaces: what to fix

Current code applies `bg-(--glass-bg)` + `backdrop-blur-md` directly via
Tailwind utilities. This produces only the frost effect and misses splay,
refraction, depression, and depth.

Replace Tailwind one-off glass classes with the `.glass` and `.glass-raised`
CSS classes from `globals.css`:

| Element | Before | After |
|---------|--------|-------|
| Toolbar container | `rounded-xl border border-(--glass-border) bg-(--glass-bg) backdrop-blur-md` | `glass rounded-xl` |
| Table wrapper | `border border-(--glass-border) bg-(--glass-bg) backdrop-blur-md` | `glass rounded-xl overflow-hidden` |
| Pagination bar | `border border-(--glass-border) bg-(--glass-bg) backdrop-blur-md` | `glass rounded-xl` |
| Empty state | `border border-(--glass-border) bg-(--glass-bg)` | `glass rounded-xl` |
| Mobile cards | `border border-(--glass-border) bg-(--glass-bg)` | `glass rounded-xl` |

Table header row must use `.glass-raised` as its background strip — add the
class to a wrapper `<div>` or set it as an inline style override on
`<TableHeader>`:

```tsx
<TableHeader className="glass-raised">
```

#### 4c — header redesign

Replace the plain icon+title with a stat bar matching the projects page style:

```tsx
{/* Page header */}
<div className="flex items-center justify-between">
  <div className="flex items-center gap-3">
    <div className="flex size-10 items-center justify-center rounded-xl bg-[rgba(77,142,255,0.15)] shadow-[inset_0_1px_0_rgba(255,255,255,0.15)]">
      <ClipboardText weight="duotone" size={22} color="var(--accent-primary)" />
    </div>
    <div>
      <h1 className="text-xl font-bold tracking-tight text-(--text-primary)">Audit Log</h1>
      <p className="text-sm text-(--text-subtle)">Track all actions across credentials, projects, and members.</p>
    </div>
  </div>
  {/* Stats chips */}
  <div className="flex items-center gap-2">
    <span className="glass rounded-full px-3 py-1 text-xs font-semibold text-(--text-primary)">
      {total} entries
    </span>
    {hasActiveFilters && <ClearFiltersButton />}
  </div>
</div>
```

#### 4d — action badge colors

Map new `AuditAction` enum values to the badge style system. Add entries for
`CREDENTIAL_COPY`, `PROJECT_*`, `MEMBER_*`, `DIVISION_*`:

```ts
const ACTION_META: Record<AuditAction, { label: string; icon: ...; badgeClass: string }> = {
  CREDENTIAL_VIEW:      { label: "View",        icon: Eye,          badgeClass: "border-[rgba(77,142,255,0.2)]   bg-[rgba(77,142,255,0.12)]   text-(--accent-primary)" },
  CREDENTIAL_COPY:      { label: "Copy",        icon: CopySimple,   badgeClass: "border-[rgba(154,170,196,0.18)] bg-[rgba(154,170,196,0.1)]   text-(--text-subtle)" },
  CREDENTIAL_CREATE:    { label: "Create",      icon: PlusCircle,   badgeClass: "border-[rgba(18,183,106,0.2)]   bg-[rgba(18,183,106,0.12)]   text-(--state-success)" },
  CREDENTIAL_UPDATE:    { label: "Update",      icon: PencilSimple, badgeClass: "border-[rgba(245,166,35,0.2)]   bg-[rgba(245,166,35,0.12)]   text-(--accent-amber)" },
  CREDENTIAL_DELETE:    { label: "Delete",      icon: Trash,        badgeClass: "border-[rgba(240,68,56,0.2)]    bg-[rgba(240,68,56,0.12)]    text-(--state-error)" },
  PROJECT_CREATE:       { label: "New Project", icon: FolderLock,   badgeClass: "border-[rgba(18,183,106,0.2)]   bg-[rgba(18,183,106,0.12)]   text-(--state-success)" },
  PROJECT_UPDATE:       { label: "Edit Project",icon: PencilSimple, badgeClass: "border-[rgba(245,166,35,0.2)]   bg-[rgba(245,166,35,0.12)]   text-(--accent-amber)" },
  PROJECT_DELETE:       { label: "Del Project", icon: Trash,        badgeClass: "border-[rgba(240,68,56,0.2)]    bg-[rgba(240,68,56,0.12)]    text-(--state-error)" },
  MEMBER_INVITE:        { label: "Invite",      icon: UsersThree,   badgeClass: "border-[rgba(45,212,191,0.2)]   bg-[rgba(45,212,191,0.1)]    text-(--accent-teal)" },
  MEMBER_ROLE_CHANGE:   { label: "Role Change", icon: PencilSimple, badgeClass: "border-[rgba(245,166,35,0.2)]   bg-[rgba(245,166,35,0.12)]   text-(--accent-amber)" },
  MEMBER_REMOVE:        { label: "Remove",      icon: Trash,        badgeClass: "border-[rgba(240,68,56,0.2)]    bg-[rgba(240,68,56,0.12)]    text-(--state-error)" },
  DIVISION_CREATE:      { label: "New Division",icon: Buildings,    badgeClass: "border-[rgba(139,92,246,0.2)]   bg-[rgba(139,92,246,0.12)]   text-(--accent-purple)" },
  DIVISION_RENAME:      { label: "Rename Div.", icon: PencilSimple, badgeClass: "border-[rgba(245,166,35,0.2)]   bg-[rgba(245,166,35,0.12)]   text-(--accent-amber)" },
  DIVISION_DELETE:      { label: "Del Division",icon: Trash,        badgeClass: "border-[rgba(240,68,56,0.2)]    bg-[rgba(240,68,56,0.12)]    text-(--state-error)" },
}
```

#### 4e — row hover state

The current `!hover:bg-(--glass-bg-hover)` syntax is wrong — Tailwind v4 does
not support `!` prefix on hover variants this way. Fix with:

```tsx
className="group border-b border-(--glass-border-subtle) transition-colors hover:bg-(--glass-bg-hover)"
```

#### 4f — actor avatar

Add a small avatar circle before the actor name in the Actor column. Pull
the user's Clerk `imageUrl` (already on the `AuditEntryDTO`):

```tsx
<TableCell className="py-3">
  <div className="flex items-center gap-2.5">
    <img
      src={entry.actorImageUrl}
      alt={entry.actorName}
      className="size-7 rounded-full border border-(--glass-border)"
    />
    <div className="flex flex-col gap-0.5">
      <span className="text-sm font-medium text-(--text-primary)">{entry.actorName}</span>
      <span className="text-[11px] text-(--text-muted)">{entry.actorEmail}</span>
    </div>
  </div>
</TableCell>
```

Add `actorImageUrl: string` to `AuditEntryDTO` — read from
`clerkUser.imageUrl`.

---

### 5 — loading state

Replace the `setTimeout(400)` fake delay with a proper `Suspense` boundary
and a real skeleton that mirrors the table structure:

```tsx
// app/(app)/auditlog/page.tsx
import { Suspense } from "react"

export default function AuditLogPage() {
  return (
    <Suspense fallback={<AuditLogSkeleton />}>
      <AuditLogLoader />
    </Suspense>
  )
}
```

`AuditLogSkeleton` should render:
- Header row skeleton (icon chip + title + stats chip)
- Toolbar row skeleton (search input + 2 selects)
- Filter pill row skeleton (7 pills)
- 10 table row skeletons, each `h-14` with 6 column placeholders

Use `animate-pulse` and `bg-(--glass-bg-hover)` for all skeleton fills.

---

### 6 — file layout after this feature

```
app/
  (app)/auditlog/page.tsx          ← Server Component + Suspense
  api/audit/route.ts               ← GET handler
components/
  audit/
    AuditLogTable.tsx              ← Client Component (filter state)
    AuditLogRow.tsx                ← presentational table row
    AuditLogSkeleton.tsx           ← Suspense fallback
lib/
  audit.ts                         ← writeAuditLog() helper
  validations/audit.ts             ← Zod schema for GET query params
prisma/
  migrations/…extend-audit-log/
```

---

### 7 — when is done

- `/auditlog` shows real events written by the app (no mock data)
- All credential create/update/delete/view routes produce audit entries
- All project create/update/delete routes produce audit entries
- All division create/rename/delete routes produce audit entries
- Audit entries are division-scoped: a MEMBER only sees their own division(s)
- Filters (date range, action type, resource type, division) work against real data
- Page uses `.glass` / `.glass-raised` classes for all panels (all 5 liquid effects visible)
- Row hover works without `!` prefix hack
- Actor column shows avatar + name + email
- Loading state uses Suspense + proper skeleton (no artificial setTimeout)
- `npm run build` passes with no type errors

---

### out of scope

- Export to CSV / JSON
- Real-time streaming (WebSocket or SSE)
- Audit log for individual credential field reveals (field-level granularity)
- Analytics charts or aggregation views
- Retention policy / auto-purge (append-only, no deletes)
