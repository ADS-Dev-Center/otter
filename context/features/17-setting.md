# Feature 17 — Settings Page Alignment

## Goal

Adjust `app/(app)/settings/page.tsx` so every section reflects only what is
actually implemented. Remove or downgrade anything that is purely decorative,
misleading, or belongs to features that do not yet exist.

---

## What Already Exists and Must Stay

### Division Management (fully functional)

The bottom card is the only fully interactive section. Keep it exactly as-is:

- Fetch divisions from `GET /api/divisions`
- Inline rename with `PATCH /api/divisions/[id]`
- Delete with confirmation dialog via `DELETE /api/divisions/[id]`
- Create via `POST /api/divisions`
- Guard: delete button hidden when only one division remains
- Shows memberCount and DIVISION_OWNER badge per row

### Workspace Context (informational, real data)

Keep the two-row summary card that shows active division name and total
membership count. Values come from the same `/api/divisions` fetch — no
additional API calls needed.

---

## Sections to Keep as Informational (Read-Only, No Controls)

These sections are valid to display because they reflect actual system
behaviour. They must **not** have inputs or toggles — they are status displays.

### Security & Authentication

Source of truth is Clerk. Values should read as follows:

| Row                   | Value        | Notes                                              |
| --------------------- | ------------ | -------------------------------------------------- |
| Authentication        | Clerk        | Rename from "OTP enforcement" — we use Clerk auth  |
| Session management    | Clerk-managed| Remove the hardcoded "8 hours" — we don't control this |
| Suspicious login alerts | Clerk-managed | Remove "Active" badge — this is Clerk's feature  |

Remove the `Fingerprint`, `LockKey`, `WarningCircle` rows that show fake
static values. Replace with a single note row: "Authentication and session
management are handled by Clerk."

### Vault Policy

Values match the actual implementation in `lib/crypto.ts` and the reveal flow:

| Row               | Value      | Notes                                                   |
| ----------------- | ---------- | ------------------------------------------------------- |
| Encryption at rest | AES-256-GCM | Accurate — matches `lib/crypto.ts`                   |
| Reveal timeout    | 30 seconds | Accurate — countdown exists in `CredentialCard`        |
| Copy protection   | Remove     | Not implemented anywhere in the codebase; remove row   |

### Audit & Compliance

| Row                | Value       | Notes                                                      |
| ------------------ | ----------- | ---------------------------------------------------------- |
| Reveal activity log | Enabled    | Accurate — `writeAuditLog` is called in reveal route       |
| Audit retention    | Remove      | No retention/deletion job exists; do not show "180 days"  |
| Export reports     | Coming soon | Keep as-is with `Badge variant="outline"`                 |

---

## Sections to Remove Entirely

### Notifications & Integrations

Remove this card completely. Reasons:

- "Clerk auth integration: Connected" — duplicates information already in
  Security section; not actionable
- "Prisma/Postgres health: Healthy" — a static badge; no health check is
  wired up; misleading
- "Slack / Webhook alerts: Coming soon" — no Slack/Webhook feature is planned
  in the current scope

---

## Profile Settings (new section)

### What to show

A glass card placed at the top of the page (above Workspace Context) that
displays the current user's identity and provides a single action to edit it.

```
┌──────────────────────────────────────────────────────────┐
│  [Avatar 48px]  Full Name                   [Edit Profile]│
│                 email@example.com                         │
│                 Member since  Jan 2026                    │
└──────────────────────────────────────────────────────────┘
```

### Data source — DB first, Clerk as fallback

Fetch from `GET /api/profile` which reads the `User` row by `clerkId` from
the authenticated session. If a field is empty or the row does not exist yet
(e.g. webhook not fired), fall back to the equivalent value from Clerk's
`useUser()`.

```
API route: GET /api/profile
Auth:      server-side via auth() from @clerk/nextjs/server
Returns:   { name, email, imageUrl, createdAt }
```

Resolution order per field:

| Field        | Primary (DB `User` row)    | Fallback (`useUser()`)              |
| ------------ | -------------------------- | ----------------------------------- |
| Avatar       | `user.imageUrl`            | `clerkUser.imageUrl`                |
| Full name    | `user.name`                | `clerkUser.fullName ?? clerkUser.username` |
| Email        | `user.email`               | `clerkUser.primaryEmailAddress`     |
| Member since | `user.createdAt`           | `clerkUser.createdAt`               |

The API route should never throw if the `User` row is absent — return `null`
for all DB fields so the client can fall back gracefully.

**Why DB first:** our `User` table is the source of truth for the rest of the
app (audit log actor resolution, member lists). Displaying what the system
actually recorded is more accurate than re-fetching from Clerk every time.

### Edit Profile button

- Label: "Edit Profile"
- Action: opens Clerk's `<UserProfile />` component as a modal using
  `<UserButton>` with `userProfileMode="modal"`, or render
  `<UserProfile routing="hash" />` inline when button is clicked
- Do **not** build a custom name/email/avatar edit form — Clerk owns that
  data; all changes (name, photo, email, password, connected accounts) go
  through Clerk's own UI

### What NOT to include

- Password change field — Clerk handles it inside UserProfile
- 2FA / MFA toggle — Clerk handles it inside UserProfile
- Email change form — Clerk handles it; our `User` table is synced via webhook
- Separate "Danger zone" for account deletion — out of scope for this phase

---

## Final Section Order

1. Header (title + description)
2. **Profile** card (real data from `useUser()`, Edit Profile → Clerk modal)
3. Workspace Context card (real data from `/api/divisions`)
4. Two-column grid:
   - Security & Authentication (informational, simplified)
   - Vault Policy (informational, accurate)
5. Audit & Compliance (informational, accurate)
6. Division Management (interactive, full CRUD)

---

## Implementation Notes

- All values shown in informational cards must match the actual codebase
  behaviour — no aspirational or placeholder copy
- No new API routes or database changes are needed for this feature
- Do not add toggle switches, sliders, or form inputs to any informational
  card; they have no backend to write to
- Profile edit goes through Clerk — never build a parallel form for fields
  Clerk already owns (`name`, `email`, `imageUrl`)
- `User.updatedAt` in our database reflects the last webhook sync; use
  `user.createdAt` from Clerk for "Member since", not the DB row
- Keep the glass card styling consistent with other cards on the page
- Progress tracker entry: update after the page is adjusted
