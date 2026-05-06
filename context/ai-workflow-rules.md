# AI Workflow Rules

## Approach

Build Otter incrementally using a spec-driven workflow. Context files define what to build, how to build it, and the current state of progress. Always implement against these specs — do not infer or invent behavior from scratch. If behavior is not defined in a context file, it must be defined before implementation begins.

## Scoping Rules

- Work on one feature unit at a time
- Prefer small, verifiable increments over large speculative changes
- Do not combine unrelated system boundaries in a single implementation step
- Each unit must be testable end-to-end before moving to the next

## When to Split Work

Split an implementation step if it combines:

- UI changes and encryption/server-side logic changes simultaneously
- Multiple unrelated API routes in one PR (e.g. divisions + credentials together)
- Auth/middleware changes alongside feature work
- Any behavior not clearly defined in the context files

If a change cannot be verified end to end quickly, the scope is too broad — split it.

## Handling Missing Requirements

- Do not invent product behavior not defined in the context files
- If a requirement is ambiguous, resolve it in the relevant context file before implementing
- If a requirement is missing, add it as an open question in `progress-tracker.md` before continuing
- Never guess at encryption behavior — always follow `architecture.md` encryption invariants exactly

## Protected Files

Do not modify the following unless explicitly instructed:

- `components/ui/*` — shadcn/ui generated primitives; use CLI to update
- `prisma/migrations/*` — never hand-edit migration files; use `prisma migrate dev` to generate
- `lib/crypto.ts` — the encryption module; changes require explicit instruction and must preserve all invariants

## Keeping Docs in Sync

Update the relevant context file whenever implementation changes affect:

- System architecture or data model (→ `architecture.md`)
- Storage decisions (→ `architecture.md`)
- Code conventions or standards (→ `code-standards.md`)
- Feature scope or user flows (→ `project-overview.md`)
- UI tokens, layout patterns, or component decisions (→ `ui-context.md`)
- Progress or decisions (→ `progress-tracker.md`)

## Implementation Order (Recommended)

1. **Foundation**: Next.js project setup, Tailwind + shadcn/ui config, Clerk integration, Prisma schema, DB connection
2. **Auth**: OTP-enforced login flow, middleware, Clerk webhook for user sync
3. **Encryption module**: `lib/crypto.ts` with AES-256-GCM, env key validation, unit tests
4. **Divisions**: CRUD API routes + UI for division list, create, settings
5. **Members**: Division membership model, invite flow, member list UI
6. **Projects**: CRUD API routes + UI for project list within a division
7. **Credentials**: CRUD API routes with encrypt-on-write, credential list UI with masked values
8. **Reveal & Copy**: Reveal endpoint with audit log, copy-to-clipboard with auto-clear
9. **Audit Log**: Audit log table, API route, UI in credential detail
10. **Search & Filter**: Credential search within project, filter by type/tag
11. **Admin**: Super Admin views, division admin capabilities
12. **Polish**: Empty states, error boundaries, loading states, responsive layout

## Before Moving to the Next Unit

1. The current unit works end to end within its defined scope
2. No invariant defined in `architecture.md` was violated (especially encryption and auth invariants)
3. `progress-tracker.md` reflects the completed work and any decisions made
4. `npm run build` passes with no TypeScript errors
5. All API routes return consistent `{ data }` / `{ error }` shapes
