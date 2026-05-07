# Progress Tracker

Update this file after every meaningful implementation
change.

## Current Phase

- Feature 04 complete

## Current Goal

- TBD next feature

## Completed

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

## In Progress

- None.

## Next Up

- Define and implement feature 05

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
