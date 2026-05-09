# Feature 15 — Invite Member

## Overview

Wire up the existing Members page invite form to a real backend. Inviting a member has two paths depending on whether the email address already has a Clerk account. Both paths write into the app's own `DivisionMembership` table — this app does **not** use Clerk Organizations.

---

## External Service Boundary

| Service | What we use | Tier |
|---------|-------------|------|
| Clerk | `getUserList({ emailAddress })` — check if email has an account | **Free** |
| Clerk | `clerkClient().invitations.*` | **Skipped** — rate-limited (100/hr), Clerk-branded email, needs dashboard allowlist |
| Clerk | `clerkClient().organizations.*` | **Skipped** — Paid Pro feature, not used in this app |
| Resend | Send branded invite email via custom token link | **Free** — 3,000 emails/month on free tier |

**Decision:** Path B (new user invite) generates a custom UUID token, stores a pending `Invitation` row, then sends a branded email via **Resend** with the invite link. No Clerk invitation API is used.

SDK: `resend` v6.12.3 (already installed). Env var: `RESEND_API_KEY`.

---

## Current State

- `app/(app)/members/page.tsx` is fully static mock data — no API calls, no DB reads
- `DivisionMembership` table exists and is used correctly for auth/scoping
- `User` model exists and is synced from Clerk via webhooks (`user.created` / `user.updated`)
- `MEMBER_INVITE`, `MEMBER_ROLE_CHANGE`, `MEMBER_REMOVE` are already defined in `AuditAction` enum
- Webhook handler already has `invitation.accepted` placeholder — no longer needed for this flow

---

## Goals

1. Admin enters an email + role → system checks whether that email already has an Otter account
2. **Path A — user exists** → create `DivisionMembership` immediately, done
3. **Path B — user does not exist** → generate a unique invite token, persist a pending `Invitation` row, return a copy-able invite link to the admin
4. Invited user opens the link → signs up via Clerk → `/accept-invite?token=xxx` page creates their membership
5. Admin can see pending invites and revoke them
6. Admin can change role or remove an existing member
7. Every action writes an audit log entry

---

## Scenario Analysis

### Path A — User Already Has an Otter Account

```
Admin submits email + role
  → POST /api/members/invite
  → clerkClient().users.getUserList({ emailAddress: [email] })
  → User found → clerkId resolved
  → Check: not already a member of this division (409 if yes)
  → DivisionMembership.create({ clerkId, divisionId, role })
  → writeAuditLog(MEMBER_INVITE)
  → 201 { status: "added", message: "Member added directly" }
```

Edge cases:
- User is already a member of this division → `409 CONFLICT`
- Caller tries to assign `DIVISION_OWNER` role → `403 FORBIDDEN` (owner cannot be granted via invite)

---

### Path B — User Does Not Have an Otter Account

```
Admin submits email + role
  → POST /api/members/invite
  → clerkClient().users.getUserList({ emailAddress: [email] }) → empty
  → token = crypto.randomUUID()
  → Invitation.create({
      email,
      divisionId,
      role,
      token,
      invitedBy: actorClerkId,
      expiresAt: now + 7 days,
      status: PENDING
    })
  → resend.emails.send({
      from: "Otter <invite@yourdomain.com>",
      to: [email],
      subject: "You've been invited to Otter",
      html: InviteEmailTemplate({ inviterName, divisionName, role, inviteUrl }),
      idempotencyKey: `member-invite/${invitation.id}`
    })
  → writeAuditLog(MEMBER_INVITE)
  → 201 { status: "pending" }
```

Resend SDK returns `{ data, error }` — never throws. If `error` is truthy, the invite row is still valid (admin can resend later); log the error and return `201` with a `emailFailed: true` flag so the UI can warn the admin.

**Email template** — plain HTML in `lib/emails/invite.ts`, no React Email required unless the team wants rich styling later:

```typescript
export function inviteEmailHtml({
  inviterName,
  divisionName,
  role,
  inviteUrl,
  expiresAt,
}: InviteEmailProps): string {
  return `
    <p>Hi,</p>
    <p><strong>${inviterName}</strong> has invited you to join the
    <strong>${divisionName}</strong> division on Otter as a <strong>${role}</strong>.</p>
    <p><a href="${inviteUrl}">Accept invitation</a></p>
    <p>This link expires on ${expiresAt.toLocaleDateString()}.</p>
    <p>If you didn't expect this, you can ignore this email.</p>
  `;
}
```

---

### Path C — Accepting an Invite Link

```
Invitee opens /accept-invite?token=xxx
  → Page checks Clerk session
  → If not signed in → redirect to /sign-up?redirect_url=/accept-invite?token=xxx
  → If signed in → GET /api/invite/accept?token=xxx
      → Validate token: exists, status=PENDING, not expired
      → Resolve clerkId from auth()
      → DivisionMembership.create({ clerkId, divisionId: invite.divisionId, role: invite.role })
      → Invitation.update({ status: ACCEPTED })
      → writeAuditLog(MEMBER_INVITE) with actorId = invitee clerkId
      → Redirect to division dashboard
```

---

### Path D — Revoke Pending Invite

```
Admin clicks "Revoke" on a pending invite row
  → DELETE /api/members/invitations/[id]
  → Validate: caller is DIVISION_ADMIN or DIVISION_OWNER in this division
  → Invitation.update({ status: REVOKED })
  → 204 No Content
```

No Clerk API call needed — the token simply becomes invalid.

---

### Path E — Change Member Role

```
Admin selects new role in role dialog
  → PATCH /api/members/[membershipId]
  → Validate: caller must be DIVISION_OWNER or DIVISION_ADMIN
  → Cannot demote the only DIVISION_OWNER in the division
  → Cannot assign DIVISION_OWNER (must transfer ownership separately)
  → DivisionMembership.update({ role })
  → writeAuditLog(MEMBER_ROLE_CHANGE, metadata: { oldValue, newValue })
  → 200 OK
```

---

### Path F — Remove Member

```
Admin clicks "Remove" on a member card
  → DELETE /api/members/[membershipId]
  → Validate: cannot remove the only DIVISION_OWNER
  → DivisionMembership.delete()
  → writeAuditLog(MEMBER_REMOVE)
  → 204 No Content
```

---

## Schema Changes

Add `Invitation` model and `InvitationStatus` enum to `prisma/schema.prisma`:

```prisma
model Invitation {
  id         String           @id @default(cuid())
  email      String
  divisionId String
  role       Role
  token      String           @unique
  status     InvitationStatus @default(PENDING)
  invitedBy  String           // clerkId of the admin who sent the invite
  expiresAt  DateTime
  createdAt  DateTime         @default(now())
  division   Division         @relation(fields: [divisionId], references: [id], onDelete: Cascade)

  @@index([email])
  @@index([divisionId, status])
}

enum InvitationStatus {
  PENDING
  ACCEPTED
  REVOKED
}
```

`Division` model gains back-relation:

```prisma
invitations Invitation[]
```

---

## API Surface

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| `GET` | `/api/members?divisionId=` | Member+ | List active members + pending invites |
| `POST` | `/api/members/invite` | Admin+ | Invite by email (Path A or B) |
| `PATCH` | `/api/members/[membershipId]` | Admin+ | Change member role |
| `DELETE` | `/api/members/[membershipId]` | Admin+ | Remove member |
| `DELETE` | `/api/members/invitations/[id]` | Admin+ | Revoke pending invite |
| `GET` | `/api/invite/accept?token=` | Authenticated | Validate token + create membership |

### Role Guards

| Action | Minimum required role |
|--------|----------------------|
| View member list | `MEMBER` |
| Invite member | `DIVISION_ADMIN` |
| Assign `DIVISION_ADMIN` role | `DIVISION_OWNER` only |
| Change any member role | `DIVISION_ADMIN` (cannot touch owner) |
| Remove member | `DIVISION_ADMIN` |
| Revoke invite | `DIVISION_ADMIN` |

---

## New Page: `/accept-invite`

```
app/accept-invite/page.tsx   (Server Component)
```

Logic:
1. Read `token` from searchParams
2. If no Clerk session → redirect to `/sign-up?redirect_url=/accept-invite?token=xxx`
3. Call `GET /api/invite/accept?token=xxx` with the authenticated session
4. On success → redirect to the division dashboard (`/`)
5. On error (expired / already used / revoked) → show clear error card with "Contact your admin"

---

## Members Page Updates (`app/(app)/members/page.tsx`)

Convert from static mock → real data:

1. **Active members section** — fetched from `GET /api/members`; show name + email from `User` table; role badge; Change Role / Remove buttons (role-gated; owner row is locked)
2. **Pending invites section** — separate card below active members; shows email, role, expiry date, Revoke button (admin only)
3. **Invite form** — wire to `POST /api/members/invite`; on `status: "added"` → toast "Member added"; on `status: "pending"` → show copy-able invite link in a modal; on `409` → inline error "Already a member"
4. **Role dialog** — remove `DIVISION_OWNER` from assignable options in invite form

---

## Audit Log Entries

| Trigger | AuditAction | resourceType | resourceName | metadata |
|---------|-------------|--------------|--------------|----------|
| Invite sent or member added directly | `MEMBER_INVITE` | `MEMBER` | invited email | — |
| Invite accepted (accept-invite route) | `MEMBER_INVITE` | `MEMBER` | new member name | — |
| Role changed | `MEMBER_ROLE_CHANGE` | `MEMBER` | member name | `{ oldValue, newValue }` |
| Member removed | `MEMBER_REMOVE` | `MEMBER` | member name | — |

---

## Implementation Order

1. Schema — add `Invitation` model + `InvitationStatus` enum → migration
2. `POST /api/members/invite` — Path A + B
3. `PATCH /api/members/[membershipId]` + `DELETE /api/members/[membershipId]`
4. `DELETE /api/members/invitations/[id]` — revoke
5. `GET /api/members` — list members + pending invites
6. `GET /api/invite/accept` — token validation + membership creation
7. `app/accept-invite/page.tsx` — accept flow UI
8. Members page — replace mock with real API calls + invite link modal

---

## What Is NOT Used (Paid / Avoided)

| Feature | Reason skipped |
|---------|----------------|
| `clerkClient().invitations.createInvitation()` | Rate-limited (100/hr), Clerk-branded email, requires dashboard allowlist. Replaced by custom token + Resend. |
| `clerkClient().organizations.*` | Clerk Organizations is a paid Pro feature. This app manages divisions natively. |
| `invitation.accepted` webhook (for membership creation) | No longer needed — `/api/invite/accept` route handles membership on token redemption. |

---

## Resend Setup

**Package:** `resend` v6.12.3 (already installed).

**Env vars added to `.env`:**

```env
RESEND_API_KEY=re_...                    # from resend.com/api-keys
RESEND_FROM_EMAIL=onboarding@resend.dev  # use resend.dev for local dev; switch to verified domain in prod
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Important:**
- `onboarding@resend.dev` (sandbox) only delivers to the email registered on your Resend account — safe for local testing
- For production: verify your own domain in Resend dashboard and set `RESEND_FROM_EMAIL=invite@yourdomain.com`
- Resend SDK returns `{ data, error }` — never throws. Check `error` explicitly after every send call
- Use `idempotencyKey: \`member-invite/${invitation.id}\`` to prevent duplicate sends on retry

**Resend free tier:** 3,000 emails/month, 100/day — sufficient for team invite volumes.

---

## Open Questions

- Should expired invites (>7 days) be auto-cleaned up, or left visible with an "Expired" badge?
- Should the invite link be one-time-use (invalidated after first click/sign-up) or valid until expiry for re-sign-in attempts?
- When the only `DIVISION_OWNER` wants to leave, should there be an "Transfer ownership" flow, or just block removal until another owner is assigned?
