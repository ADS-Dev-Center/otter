## Goals

Implement full CRUD (Create, Read, Update, Delete) for Projects, replacing all mock data with
real Prisma-backed API routes. Projects are always scoped to a division; the active division
context drives which projects are shown.

---

## Prerequisites

- Feature 10 (onboarding + divisions) must be complete — `Division` and `DivisionMembership`
  tables already exist in the database.
- Active division ID is persisted in `localStorage` via `DivisionSwitcher`.
- Check the **prisma-cli** and **prisma-client-api** skills before touching Prisma.
- Check the **shadcn** skill before adding new UI components.

---

## Prisma Schema

Add a `Project` model to `prisma/schema.prisma`:

```prisma
model Project {
  id          String   @id @default(cuid())
  name        String
  description String?
  environment String   @default("development") // "production" | "staging" | "development" | "shared"
  divisionId  String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  division    Division @relation(fields: [divisionId], references: [id], onDelete: Cascade)
}
```

Add the back-relation to `Division`:

```prisma
model Division {
  // ...existing fields...
  projects    Project[]
}
```

Run migration:

```bash
npx prisma migrate dev --name add-project-model
```

---

## Zod Validation

Create `lib/validations/project.ts`:

- `createProjectSchema` — `name` (required, 1–80 chars), `description` (optional, max 300),
  `environment` (enum: `production | staging | development | shared`, default `development`)
- `updateProjectSchema` — same fields but all optional (partial of create)
- Export inferred types: `CreateProjectInput`, `UpdateProjectInput`

---

## API Routes

### `GET /api/projects`

- Resolve caller via `auth()` from Clerk.
- Call `getUserDivisionIds(clerkId)` to get the caller's division IDs.
- Accept optional `?divisionId=` query param; if provided and the caller is a member of that
  division, filter to that division only. Otherwise return all projects across all of the
  caller's divisions.
- Return `{ data: Project[] }` — no credential values in this response.

### `POST /api/projects`

- Body: `CreateProjectInput` validated through Zod.
- Verify caller has `DIVISION_OWNER` or `DIVISION_ADMIN` role in the target `divisionId`.
- Create project, return `{ data: Project }` with status 201.

### `PATCH /api/projects/[id]`

- Body: `UpdateProjectInput`.
- Load project; verify it belongs to a division the caller has admin rights in.
- Update and return `{ data: Project }`.

### `DELETE /api/projects/[id]`

- Load project; verify caller is `DIVISION_OWNER` or `DIVISION_ADMIN` in that division.
- Hard-delete project row, return 204.

All routes follow the standard response shape:

- Success: `{ data: <payload> }`
- Error: `{ error: { code: string, message: string } }`

---

## UI Changes

### Projects page (`app/(app)/projects/page.tsx`)

Convert to a Client Component (`"use client"`) so it can:

1. Read active division ID from `localStorage` (use the same key as `DivisionSwitcher`).
2. Fetch projects from `GET /api/projects?divisionId=<activeId>` on mount and after mutations.
3. Show a loading skeleton while fetching (use shadcn `Skeleton`).
4. Show an empty state if no projects exist — includes the "Create Project" button.

**Create Project** — clicking the button opens a shadcn `Dialog` (`.glass-heavy` treatment)
with a form:

- Project name (required)
- Description (optional textarea)
- Environment selector (shadcn `Select`: Production, Staging, Development, Shared)
- Submit calls `POST /api/projects`, closes modal, refreshes project list on success.

### Project cards

Replace all `mockProjects` references with real API data. Derive the division accent color
and icon from the division name/id returned by the API — use a deterministic color mapping
(same logic already in `DivisionSwitcher`).

### Edit & Delete affordances

Add a `DropdownMenu` (three-dot menu icon) to each project card — visible on hover:

- **Rename** — opens an inline edit dialog (shadcn `Dialog`) pre-filled with current name and description.
- **Delete** — opens a confirmation dialog; on confirm calls `DELETE /api/projects/[id]`.
  Show error toast if delete fails. Use shadcn `toast` (or `sonner` if already installed).

---

## Component Organization

```
components/projects/
  CreateProjectDialog.tsx   — create form inside Dialog
  EditProjectDialog.tsx     — edit form inside Dialog
  DeleteProjectDialog.tsx   — confirmation inside AlertDialog
  ProjectCard.tsx           — single project card (extracted from page)
  ProjectListSkeleton.tsx   — loading state
```

---

## Access Control Summary

| Action        | Allowed Roles                     |
| ------------- | --------------------------------- |
| List projects | Any division member               |
| Create        | DIVISION_OWNER, DIVISION_ADMIN    |
| Update        | DIVISION_OWNER, DIVISION_ADMIN    |
| Delete        | DIVISION_OWNER or DIVISION_ADMIN" |

Enforce roles in the API route handler; hide create/edit/delete affordances in the UI for
members who lack the required role (read the caller's role from the division membership API
or pass it down from the server component).

---

## It's Done When

- A `DIVISION_OWNER` can create a project in their division and see it appear in the list.
- A `DIVISION_ADMIN` can rename a project; they do not see the delete option.
- A `MEMBER` sees the project list read-only — no create/edit/delete UI is shown.
- Deleting a project removes it from the list immediately (optimistic or refetch).
- Switching divisions in `DivisionSwitcher` re-fetches and shows only that division's projects.
- All mock data (`app/(app)/projects/mock-data.ts`) is removed.
- `npm run build` passes with no TypeScript errors.
