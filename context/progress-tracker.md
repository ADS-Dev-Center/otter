# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- In progress

## Current Goal

- Feature 01 — Main Dashboard & Sidebar: building the app shell
  (layout, sidebar, topbar) and dashboard page with static mock data

## Completed

- Updated `globals.css` with Otter design tokens and glass utilities
- Added `app/(app)/layout.tsx` (Server Component app shell)
- Added `components/layout/Sidebar.tsx` (Client Component)
- Added `components/layout/Topbar.tsx` (Client Component)
- Added `app/(app)/dashboard/page.tsx` (Server Component, static mock)

## In Progress

- None — Feature 01 UI scaffold completed.

## Next Up

- Feature 02 — Auth / Clerk integration
- Feature 03 — Encryption module (`lib/crypto.ts`)
- Feature 04 — Divisions CRUD

## Open Questions

- None yet for this phase.

## Architecture Decisions

- `KeyRound` icon not present in `@phosphor-icons/react` v2.1.x;
  using `Key` as the substitute for the Credentials nav item.

## Session Notes

- Feature 01 is pure UI with static mock data — no API calls,
  no Clerk, no Prisma.
- All glass/canvas CSS tokens live in `globals.css` under `:root`.
- DM Sans replaces Geist Sans as the UI font; JetBrains Mono
  stays for credentials/code display.
