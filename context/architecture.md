# Architecture Context

## Stack

| Layer        | Technology                     | Role                                                                  |
| ------------ | ------------------------------ | --------------------------------------------------------------------- |
| Framework    | Next.js 15+ (App Router, TS)   | Full-stack React framework; server components, API routes, middleware |
| UI           | Tailwind CSS v4 + shadcn/ui    | Utility-first styling; accessible component primitives                |
| Auth         | Clerk                          | Authentication, OTP enforcement, session management, user identity    |
| Database ORM | Prisma                         | Type-safe DB access layer; schema migrations                          |
| Database     | PostgreSQL                     | Persistent storage for all app data                                   |
| Encryption   | Node.js `crypto` (AES-256-GCM) | Server-side bidirectional encryption of credential values             |
| Validation   | Zod                            | Schema validation for all API inputs and form data                    |
| Forms        | React Hook Form                | Client-side form state management, integrated with Zod via resolver   |
| Icons        | Lucide React                   | Stroke-based icon set                                                 |

## System Boundaries

- `app/` — Next.js App Router pages, layouts, and route handlers. Owns routing and HTTP surface.
- `app/api/` — All API route handlers. Owns request parsing, auth checks, and response shaping.
- `lib/` — Shared business logic, encryption utilities, Prisma client singleton, Clerk helpers.
- `components/` — React UI components. No direct DB or crypto access — data comes through props or server components.
- `components/ui/` — shadcn/ui generated primitives. **Do not hand-edit these files.**
- `prisma/` — Schema definitions and migrations. Source of truth for the data model.

## Storage Model

- **PostgreSQL (via Prisma)**: All structured data — users (synced from Clerk), divisions, division memberships, projects, credentials (metadata + encrypted value), audit logs.
- **Clerk**: User identity, authentication state, OTP configuration, session tokens. Clerk is the identity provider; the database stores a `clerkId` reference, not passwords.
- **No blob/file storage**: Otter stores text-based credentials only. No file uploads in scope.

## Encryption Model

- Credential values are encrypted server-side using AES-256-GCM before being written to the database.
- The encryption key (`CREDENTIAL_ENCRYPTION_KEY`) lives in environment variables and is never exposed to the client.
- The `lib/crypto.ts` module owns `encrypt(plaintext: string)` and `decrypt(ciphertext: string)` — these are the only functions that touch raw values.
- API routes decrypt values only when explicitly requested by an authorized user, and log the access event.
- The encrypted value, IV, and auth tag are stored together in a single `encryptedValue` column as a structured JSON string.

## Auth and Access Model

- Every user authenticates via Clerk with OTP enforced at the Clerk organization level (no bypass possible).
- The middleware (`middleware.ts`) protects all routes except `/sign-in` and `/sign-up`.
- Users are synced to the local DB via a Clerk webhook on `user.created` and `user.updated`.
- **Roles**:
  - `SUPER_ADMIN`: Platform-wide admin; can manage all divisions and users. Only role with cross-division visibility.
  - `DIVISION_OWNER`: Owns a division; can manage members and projects within it.
  - `DIVISION_ADMIN`: Can manage members and credentials within their division.
  - `MEMBER`: Can view and copy credentials in projects they have access to.
- Ownership check: every mutation (create, update, delete) validates that the caller has the required role in the relevant division before proceeding.

## Division Isolation Model

Otter uses a **division-scoped data model**. Every data access is filtered by the user's division memberships:

- The dashboard query fetches **only** the divisions where the current user has a `DivisionMembership` row. No global listing of all divisions is ever returned to non-`SUPER_ADMIN` users.
- Project queries are always scoped: `WHERE project.divisionId IN (user's member division IDs)`.
- Credential queries are always scoped: `WHERE credential.projectId IN (projects in user's member divisions)`.
- Division isolation is enforced in the API route handler, not in the UI. The UI cannot be "tricked" into exposing data because the server never returns it.
- `SUPER_ADMIN` bypasses division filtering for management purposes only (member list, project list, division settings) — not for credential decryption.

The helper `lib/auth.ts` must export a `getUserDivisionIds(clerkId)` function that returns the list of division IDs the caller belongs to. Every route handler that touches division, project, or credential data must call this helper and apply it as a Prisma `where` filter before any query.

## Invariants

1. **Encryption invariant**: No credential value is ever written to the database in plaintext. `encrypt()` must be called before any `prisma.credential.create` or `prisma.credential.update`.
2. **Auth invariant**: No API route handler performs any database read or mutation before verifying the Clerk session and resolving the caller's division role.
3. **Server-only invariant**: `lib/crypto.ts` and the Prisma client must never be imported in client components (`use client`). Encryption and DB access are server-only.
4. **OTP invariant**: MFA/OTP is enforced at the Clerk level; the application never downgrades or bypasses this requirement in middleware or route handlers.
5. **Audit invariant**: Every credential `view` (decrypt) and `mutation` (create, update, delete) must write an audit log entry with `actorId`, `action`, `credentialId`, and `timestamp` before returning a response.
6. **Division isolation invariant**: No API route may return division, project, or credential data for a division the caller is not a member of. All Prisma queries on these models must include a division membership filter derived from `getUserDivisionIds()`. A missing filter is a security bug, not a product decision.
