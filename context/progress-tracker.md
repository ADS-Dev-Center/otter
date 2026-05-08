# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Division management complete: Settings page fully wired to real API (create, rename, delete)

## Current Goal

- Define and implement the next feature scope

## Completed

- Migrated the UI theme from classic glassmorphism to liquid glassmorphism
- Updated the shared liquid-glass token system in `app/globals.css`
- Refined the shared button primitive and core shell surfaces for brighter selected/action states
- Added opaque liquid-chip surfaces for primary buttons and selected rows
- Removed the blue selected rail in the sidebar and matched sidebar rows to the liquid chip style
- Switched non-selected sidebar rows to the shared `ghost` button variant
- Changed inactive sidebar rows to text-only buttons with no filled surface
- Updated `globals.css` with Otter design tokens and glass utilities
- Added `app/(app)/layout.tsx` (Server Component app shell)
- Added `components/layout/Sidebar.tsx` (Client Component)
- Added `components/layout/Topbar.tsx` (Client Component)
- Added `app/(app)/dashboard/page.tsx` (Server Component, static mock)
- Kicked off Feature 02: read auth spec and created implementation plan
- Added `lib/clerk-appearance.ts` for Clerk theme variables backed by CSS vars (glass tokens)
- Added `proxy.ts` with Clerk route protection and public auth routes (async, env-var-driven)
- Added `app/sign-in/[[...sign-in]]/page.tsx` and `app/sign-up/[[...sign-up]]/page.tsx`
- Replaced the home page with auth-aware redirects to `/dashboard` and `/sign-in`
- Added Clerk `UserButton` to the Topbar
- Installed `@clerk/ui`
- Reimplemented Feature 02 to best practices:
  - Deleted `components/ClerkProviderWrapper.tsx` (unnecessary wrapper); `ClerkProvider` now inlined directly in root layout
  - Fixed `proxy.ts`: added `async`/`await` on middleware handler, public routes use `NEXT_PUBLIC_CLERK_SIGN_IN_URL` / `NEXT_PUBLIC_CLERK_SIGN_UP_URL` env vars, `/` removed from public routes
  - Fixed `lib/clerk-appearance.ts`: replaced invalid/shadcn variables with valid Clerk appearance variables mapped to glass CSS tokens (`--glass-bg-raised`, `--text-primary`, `--text-subtle`, `--accent-primary`, etc.)
  - Fixed `components/auth/AuthPageShell.tsx`: replaced shadcn vars (`--background`, `--card`, `--border`, `--foreground`) with glass token system
  - Added `NEXT_PUBLIC_CLERK_SIGN_IN_URL` and `NEXT_PUBLIC_CLERK_SIGN_UP_URL` to `.env`
- Verified `npm run build` passes
- Added `app/(app)/divisions/page.tsx` (Server Component, static mock, no API calls)
- Installed `badge` shadcn component (`components/ui/badge.tsx`)
- Used shadcn `Badge` for role labels, `Button` for actions; zero `style={{}}` — all styling via Tailwind v4 CSS variable shorthand `bg-(--var)` / `text-(--var)` and arbitrary `bg-[rgba(...)]`
- Implemented Feature 04 app shell behavior:
  - Added `components/layout/AppShell.tsx` to control sidebar open/close state in a client boundary
  - Updated `app/(app)/layout.tsx` to render the new `AppShell`
  - Replaced `components/layout/Topbar.tsx` with a fixed-height 3-section topbar and functional sidebar toggle in the left section
  - Replaced `components/layout/Sidebar.tsx` with an overlay sidebar that slides in from the left, accepts `isOpen`/`onClose`, and does not push page content
  - Sidebar navigation now uses `Link` + route-based active state via `usePathname`, and closes after navigation
- Adjusted sidebar behavior based on feedback:
  - Sidebar remains floating with glass panel styling, but is now positioned in a dedicated left column so it stays side-by-side with content
  - Restored previous sidebar menu entries (Projects, Credentials, Members, Audit Log, Settings, Support) even when pages are not yet implemented
  - Unavailable menu entries are intentionally rendered as disabled "Coming soon" items to avoid routing to missing pages
- Restored legacy topbar composition while keeping full-width layout:
  - Left section now includes sidebar toggle and breadcrumb context
  - Center section includes glass search input
  - Right section includes OTP badge and Clerk `UserButton`
- Restored `My Divisions` list in sidebar with selectable mock division rows
- Updated shell/profile polish:
  - Topbar is now a floating rounded glass panel (not attached to viewport edges)
  - Topbar profile area now renders Clerk user name + email with `useUser()`
  - Sidebar bottom profile row now uses Clerk components (`UserButton`, `SignOutButton`) and real user identity data
- Applied latest layout refinement request:
  - Topbar changed to fully rounded pill shape
  - Removed OTP badge from topbar
  - Moved search input to right side and kept only profile photo (`UserButton`) in topbar
  - Enforced full-height sidebar container in app shell column
- Updated shell layout direction:
  - Removed topbar from app shell to match cleaner dashboard composition
  - App shell now uses two-pane layout only: floating sidebar on the left and full content canvas on the right
- Added sidebar open/close interaction without topbar:
  - Sidebar now includes an inline close button in the header
  - App shell shows a floating open button when sidebar is collapsed
  - Sidebar width transitions smoothly between open and closed states
- Refined sidebar reopen button positioning:
  - Moved open button anchor from content panel to app shell root for consistent placement when sidebar is collapsed
- Improved collapsed-sidebar aesthetics:
  - Replaced floating standalone open button with a slim left mini-rail glass panel
  - Open control now lives inside that rail for cleaner, stable composition
- Enhanced mini-rail usability:
  - Added persistent app logo in collapsed state
  - Added visible sidebar icon navigation in mini-rail (with active state for available routes)
- Refined icon visibility and shape:
  - Increased visibility of unavailable icons in expanded sidebar (no global opacity fade on rows)
  - Updated collapsed mini-rail to use rounded-full styling for container and icon buttons
- Expanded collapsed mini-rail parity:
  - Added `Settings`, `Support`, and `Profile` presence in collapsed mode
  - Added division color indicators in collapsed mode to preserve division context
- Refined collapsed mini-rail spacing:
  - Added separators in collapsed mode for clearer section breaks
  - Increased spacing between division indicators
  - Matched the collapsed profile avatar size to the logo size
- Refined collapsed Clerk profile sizing:
  - Forced the Clerk `UserButton` trigger and avatar to the same visual size as the blue app logo
- Reworked the navigation flow so Projects are active in the sidebar and credentials are shown inside project detail views
- Added project detail routes under `/projects/[projectId]` with project-scoped credential cards
- Redirected `/credentials` to `/projects` to avoid a standalone global credential surface
- Added environment grouping for project credentials so Production, Development, Staging, and Shared secrets render in separate sections
- Converted credential groups into a collapsible accordion list inside project detail pages
- Implemented Feature 03 Division Switcher redesign:
  - Created `components/layout/DivisionSwitcher.tsx` with dropdown switcher showing division name, member count, and member avatars
  - Integrated DivisionSwitcher into sidebar below logo header
  - Removed "My Divisions" section from sidebar navigation
  - Removed "Divisions" link from main navigation (now accessible via DivisionSwitcher)
  - Updated Feature 03 specification to reflect sidebar switcher approach instead of separate page
- Implemented Feature 03 approved flow refinement:
  - Added Add Division action in switcher dropdown
  - Added Create Division modal in `DivisionSwitcher` and kept active division unchanged after create
  - Added localStorage persistence for division list and active division context
  - Synced division context between expanded sidebar switcher and collapsed mini-rail indicators
  - Enabled Settings navigation and added `app/(app)/settings/page.tsx` for division management surface
  - Added shared `lib/divisions.ts` for types, defaults, storage keys, and helper utilities
- Upgraded Feature 03 modal implementation:
  - Installed latest shadcn `dialog` component
  - Migrated Create Division modal to shadcn `Dialog` with global portal overlay (not inside sidebar)
- Expanded Settings to product-level Otter control center:
  - Redesigned `app/(app)/settings/page.tsx` to include Security & Authentication, Vault Policy, Audit & Compliance, Notifications & Integrations, and Division Access Directory sections
- Fixed app-shell scrolling behavior:
  - Updated `components/layout/AppShell.tsx` so the content pane has proper height constraints (`h-dvh`, `min-h-0`, and full-height content column)
  - Restored vertical scrolling in the main content area via `overflow-y-auto` on a height-bounded container
- Implemented Feature 08 member page:
  - Added `app/(app)/members/page.tsx` as a static shadcn-based member management screen with card rows, invite-by-email UI, and local role switching only
  - Enabled the `Members` item in `components/layout/Sidebar.tsx` so the sidebar now routes to `/members`
- Simplified the member page UI to keep only the required feature surface: invite form, role controls, and card-based member rows
- Reworked role selection into dialog modals with shadcn `RadioGroup` so invite/member role changes now show both the role name and description
- Implemented Feature 09 audit log screen:
  - Added `app/(app)/auditlog/page.tsx` as a static shadcn-based audit trail with search, date range, action/resource filters, division scoping, sorting, pagination, and mobile card fallback
  - Added shadcn `table`, `select`, and `checkbox` primitives for the audit log UI
  - Wired the sidebar and mini-rail navigation to `/auditlog`
- Verified `npm run build` passes after the audit log implementation

- Redesigned audit log UI for simplicity: replaced massive filter panel (checkbox card groups, info cards, bordered sections occupying ~60% viewport) with compact inline toolbar (search + dropdown selects), toggle pill filters for action/resource types, and clean table — reduced file from 1266 lines to ~280 lines
- Implemented Feature 10 onboarding flow (real Prisma implementation):
  - Added `Division` and `DivisionMembership` models with `Role` enum to `prisma/schema.prisma`
  - Ran `prisma migrate dev --name init` — tables live in the connected Prisma Postgres DB
  - Created `lib/prisma.ts` — PrismaClient singleton using PrismaPg driver adapter (`@prisma/adapter-pg`)
  - Created `lib/validations/division.ts` — Zod schema for division creation
  - Created `app/api/divisions/route.ts` — GET (list user divisions) and POST (create division + DIVISION_OWNER membership)
  - Created `app/onboarding/page.tsx` — 2-step glassmorphism card: Step 1 creates division (required, name pre-filled from Clerk user), Step 2 invite team (UI only, skippable)
  - Updated `app/(app)/layout.tsx` — server-side division membership check; redirects to `/onboarding` if user has no division
  - Updated `components/layout/DivisionSwitcher.tsx` — replaced mock DEFAULT_DIVISIONS with real API fetch; localStorage still persists active division ID across sessions
  - Installed `zod`, `react-hook-form`, `@hookform/resolvers`

- Division management in Settings:
  - Added `app/api/divisions/[id]/route.ts` — `PATCH` (rename, owner-only) and `DELETE` (owner-only; guarded: cannot delete last division)
  - Rewrote `app/(app)/settings/page.tsx` — fetches real divisions from API; inline rename (click pencil → edit in place, Enter/blur to save); delete with confirmation dialog and error display; "New Division" button with create dialog; delete button hidden when only one division remains
  - Removed all `DEFAULT_DIVISIONS` / `DIVISIONS_STORAGE_KEY` usage from settings page

## In Progress

- None.

## Next Up

- Polish member invite/role affordances once a real data layer exists
- Define and implement the next feature scope

## Open Questions

- None.

## Architecture Decisions (Feature 03)

- `style={{}}` avoided entirely on the divisions page per spec; color tokens applied via Tailwind v4 shorthand `text-(--text-primary)` / `bg-(--accent-primary)` and Tailwind arbitrary values `bg-[rgba(...)]` for rgba accent backgrounds.
- Per-division accent color is encoded in mock data as Tailwind class strings (no dynamic style injection needed for static mock).

## Architecture Decisions

- Use Clerk `dark` theme from `@clerk/ui/themes` and map its colors to our CSS variables (no hardcoded colors).
- Use `proxy.ts` at project root for Clerk proxy behavior (do not add `middleware.ts`).
- Keep Clerk's default user menu and profile flows intact; add `UserButton` to Topbar.
- Root `/` redirects authenticated users to `/dashboard` and unauthenticated users to `/sign-in`.
- `ClerkProvider` is used directly in root layout — no wrapper component needed.
- Clerk appearance variables must use valid Clerk-defined keys (not shadcn variable names); all values reference CSS custom properties from the glass token system.

## Session Notes

- Feature 01 is pure UI with static mock data — no API calls, no Clerk, no Prisma.
- All glass/canvas CSS tokens live in `globals.css` under `:root`.
- DM Sans replaces Geist Sans as the UI font; JetBrains Mono stays for credentials/code display.
- Feature 02 implementation plan stored in the todo tracker; next step is to implement `ClerkProvider` wrap and add `proxy.ts`.
