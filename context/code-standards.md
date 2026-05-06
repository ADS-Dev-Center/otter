# Code Standards

## General

- Keep modules small and single-purpose — one file should do one thing clearly
- Fix root causes, do not layer workarounds or defensive hacks
- Do not mix unrelated concerns in one component or route handler
- Prefer explicit over implicit — name things for what they do, not what they are

## TypeScript

- Strict mode is required throughout the project (`"strict": true` in tsconfig)
- Avoid `any` — use explicit interfaces, discriminated unions, or narrowly scoped generics
- Validate all unknown external input (request bodies, query params, webhook payloads) at system boundaries with Zod before trusting it
- Export Zod schemas alongside their inferred types: `export type CreateCredentialInput = z.infer<typeof createCredentialSchema>`
- Never pass raw `Request` body to the database — always parse through a Zod schema first

## Next.js (App Router)

- Default to Server Components; only add `"use client"` when browser interactivity is required (forms, state, effects)
- Route handlers in `app/api/` handle one responsibility: parse → auth → validate → mutate → respond
- Never do encryption or DB access in a Client Component — use Server Actions or API routes
- Middleware (`middleware.ts`) is the single choke point for auth; do not duplicate auth checks outside it
- Keep layouts lean — data fetching belongs in page-level Server Components or dedicated loader components

## Validation (Zod + React Hook Form)

- Define all schemas in `lib/validations/` — co-locate schema with the feature it validates
- Use `zodResolver` from `@hookform/resolvers/zod` in all forms
- Client-side Zod schema mirrors (but does not include) server-side secrets (e.g. `encryptedValue` never appears on the client schema)
- Always strip unknown fields: use `z.object({}).strict()` for API inputs unless additive schema merging is intentional

## Styling

- Use CSS custom property tokens defined in `ui-context.md` — no hardcoded hex values in components
- Use Tailwind utility classes; never write raw CSS except for custom token definitions in `globals.css`
- Follow the border radius scale from `ui-context.md`
- Dark theme only — do not add light mode variants

## API Routes

- Parse and validate request input with Zod before any logic runs — return `400` with a structured error on validation failure
- Resolve and verify the Clerk session before any database access — return `401` if unauthenticated
- Check division role/membership before any mutation — return `403` if unauthorized
- Return consistent response shapes:
  - Success: `{ data: <payload> }`
  - Error: `{ error: { code: string, message: string } }`
- Never return decrypted credential values in list endpoints — only in explicit single-credential `GET /credentials/:id/reveal` with audit logging

## Encryption (lib/crypto.ts)

- Only `lib/crypto.ts` calls Node `crypto` — no other file performs encryption/decryption
- `encrypt(plaintext: string): EncryptedPayload` and `decrypt(payload: EncryptedPayload): string` are the only public exports
- `EncryptedPayload` is `{ iv: string; tag: string; value: string }` serialized as JSON in the DB column
- The encryption key is read from `process.env.CREDENTIAL_ENCRYPTION_KEY` and validated at startup — throw at module load time if missing

## Data and Storage

- Metadata (names, types, tags, descriptions, audit logs) belongs in PostgreSQL via Prisma
- Encrypted credential values are stored as a single `encryptedValue: String` column (serialized `EncryptedPayload` JSON) — never split IV/tag/value into separate columns
- Do not store decrypted values anywhere — no caching, no logging, no response bodies in list routes
- Audit logs are append-only — never update or delete an audit log row

## File Organization

- `app/` — Routes, layouts, pages, and API handlers only
- `app/api/` — REST-style route handlers; one folder per resource (`divisions`, `projects`, `credentials`, `audit`)
- `lib/` — Shared server-side utilities: `crypto.ts`, `prisma.ts`, `clerk.ts`, `validations/`
- `components/` — Feature UI components organized by domain: `components/divisions/`, `components/credentials/`, etc.
- `components/ui/` — shadcn/ui primitives only — do not hand-edit
- `prisma/` — `schema.prisma` and `migrations/`
- `hooks/` — Client-side custom React hooks only
- `types/` — Shared TypeScript types and interfaces not tied to a specific module
