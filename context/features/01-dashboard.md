Read `AGENTS.md` before starting.

`shadcn/ui` is already installed

# 01 — Main Dashboard & Sidebar

## Goals

Build the **app shell** and **main dashboard page** for Otter using static mock data only. No API calls, no Clerk session, no database access in this phase. The output is a pixel-perfect, fully interactive UI that can be handed to the data integration phase as-is — every component already in its final visual and structural form.

By the end of this phase:

- The app shell (sidebar + topbar + content area) is complete and reusable across all future pages
- The dashboard page renders a realistic mock of a user's division workspace
- All glassmorphism rules from `ui-context.md` are applied correctly
- Navigation state works client-side with `useState`
- The layout is responsive down to a 1024px viewport

---

## Section 1 — App Shell Layout

### File: `app/(app)/layout.tsx`

Create a new route group `(app)` to wrap all authenticated pages. This layout renders the persistent shell — sidebar on the left, topbar at the top, scrollable content on the right.

**Structure:**

```
<div> ← full viewport, flex row, overflow hidden, h-screen
  <Sidebar />            ← fixed width 240px, full height
  <div> ← flex col, flex-1, min-w-0
    <Topbar />           ← fixed height 56px
    <main> ← flex-1, overflow-y-auto, p-6
      {children}
    </main>
  </div>
</div>
```

**Styling rules:**

- The root `<div>` must **not** have a background — the canvas gradient from `html`/`body` must show through
- Sidebar: `glass` class + `border-r` using `var(--glass-border)` + `w-[240px]` + `h-screen` + `sticky top-0` + `flex flex-col` + `shrink-0`
- Topbar: `glass` class + `border-b` using `var(--glass-border-subtle)` + `h-[56px]` + `flex items-center` + `px-6` + `shrink-0`
- Main content: no background, `overflow-y-auto`, `p-6`, `flex-1`

**This layout is a Server Component.** Do not add `'use client'`.

---

## Section 2 — Sidebar Component

### File: `components/layout/Sidebar.tsx`

The sidebar is a `'use client'` component because it manages active navigation state with `useState`.

**Logo area (top):**

- Fixed height `56px` to align with the topbar
- Contains: a `ShieldChevron` icon (Phosphor Duotone, `size={22}`, color `white`) inside a `40px × 40px` rounded container with `background: var(--accent-primary)`, followed by the text "Otter" in `font-bold text-base` and below it the tagline "Vault" in `text-[10px]` `var(--text-muted)` uppercase tracking-widest
- Separated from nav items by a `border-b` using `var(--glass-border-subtle)`

**Navigation items:**

Define a nav config array inside the file:

```ts
const navItems = [
  { label: "Dashboard", icon: SquaresFour, href: "/dashboard" },
  { label: "Divisions", icon: Buildings, href: "/divisions" },
  { label: "Projects", icon: FolderLock, href: "/projects" },
  { label: "Credentials", icon: KeyRound, href: "/credentials" },
  { label: "Members", icon: UsersThree, href: "/members" },
  { label: "Audit Log", icon: ClipboardText, href: "/audit" },
];
```

All icons from `@phosphor-icons/react`, `weight="duotone"`, `size={20}`.

**Nav item anatomy (per item):**

```
<button>
  ← 2px left border (transparent when inactive, var(--accent-primary) when active)
  <Icon />         ← color var(--text-muted) inactive, var(--accent-primary) active
  <span>label</span>  ← text-sm font-medium, var(--text-subtle) inactive, var(--text-primary) active
</button>
```

- Active background: `var(--glass-bg-active)`
- Hover background (inactive): `var(--glass-bg-hover)` with `transition-colors duration-100`
- Border radius: `rounded-lg` on the inner content, but the 2px left indicator spans the full item height flush to the sidebar edge
- Padding: `py-2 pl-3 pr-4` inside the button (after the left border)
- Track active state with `useState<string>` initialized to `'/dashboard'`

**Bottom section:**

Separated by a `mt-auto` + `border-t` using `var(--glass-border-subtle)`. Contains two items:

```ts
const bottomItems = [
  { label: "Settings", icon: GearSix, href: "/settings" },
  { label: "Support", icon: Lifebuoy, href: "/support" },
];
```

Same anatomy as nav items. Below them, a user row:

```
<div> ← flex, items-center, gap-3, px-4, py-3
  <Avatar />   ← 32×32 rounded-full, gradient background, initials text-xs font-semibold
  <div>
    <p>Rizky Dwi</p>       ← text-xs font-semibold var(--text-primary)
    <p>Division Admin</p>  ← text-[10px] var(--text-muted)
  </div>
  <SignOut icon />   ← ml-auto, size={14}, var(--text-muted), hover var(--text-primary)
</div>
```

The avatar gradient: `linear-gradient(135deg, var(--accent-primary), var(--accent-teal))`.

**Divisions sub-section (between nav and bottom):**

After the main nav items, add a labeled group:

```
<div px-4 pt-4>
  <p class="text-[10px] uppercase tracking-widest var(--text-muted) mb-2 font-semibold">My Divisions</p>
  <!-- division chips -->
</div>
```

Each division chip:

```
<button>
  <span class="w-2 h-2 rounded-full" style="background: {color}" />
  <span class="text-xs font-medium var(--text-subtle)">QA Division</span>
</button>
```

Mock divisions:

```ts
const mockDivisions = [
  { name: "QA Division", color: "var(--accent-primary)" },
  { name: "Dev Division", color: "var(--accent-teal)" },
  { name: "DevOps", color: "var(--accent-amber)" },
];
```

Hover: `var(--glass-bg-hover)`, `rounded-lg`, `transition-colors duration-100`. Active division gets a slightly bolder label color (`var(--text-primary)`).

---

## Section 3 — Topbar Component

### File: `components/layout/Topbar.tsx`

A `'use client'` component for the search input state.

**Left side — breadcrumb:**

```
Dashboard  ›  QA Division
```

- "Dashboard" and "QA Division" in `text-sm`, `var(--text-muted)`
- Separator `›` in `var(--glass-border)`
- The last breadcrumb segment is `var(--text-primary)` `font-medium`

**Center — search input:**

```
<div class="glass rounded-lg px-3 py-1.5 flex items-center gap-2 w-[220px]">
  <MagnifyingGlass size={14} color="var(--text-muted)" weight="duotone" />
  <input placeholder="Search..." class="bg-transparent text-sm outline-none var(--text-primary) placeholder:var(--text-muted) w-full" />
</div>
```

**Right side:**

```
[OTP badge]   [Avatar]
```

OTP badge:

```
<div class="flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-semibold"
     style="background: rgba(18,183,106,0.1); border: 1px solid rgba(18,183,106,0.2); color: var(--state-success)">
  <ShieldCheck size={13} weight="duotone" />
  OTP Verified
</div>
```

Avatar: same `32×32` gradient pill as sidebar, initials "RD".

---

## Section 4 — Dashboard Page

### File: `app/(app)/dashboard/page.tsx`

A Server Component (no `'use client'`). Uses only static mock data — no fetch calls, no Prisma, no Clerk.

**Page title block:**

```
<h1 class="text-2xl font-bold tracking-tight" style="color: var(--text-primary)">
  Good morning, Rizky 👋
</h1>
<p class="text-sm mt-1" style="color: var(--text-muted)">
  Here's what's happening across your divisions today.
</p>
```

---

## Section 5 — Stat Cards Row

Four stat cards in a responsive grid: `grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6`.

Each card uses the `glass` class + `rounded-xl` + `p-5`.

**Card anatomy:**

```
<div class="glass rounded-xl p-5">
  <div class="flex items-center justify-between mb-3">
    <span class="text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted)">
      {label}
    </span>
    <div class="w-8 h-8 rounded-lg flex items-center justify-center"
         style="background: {iconBg}">
      <Icon size={16} weight="duotone" color={iconColor} />
    </div>
  </div>
  <p class="text-3xl font-bold tracking-tight" style="color: var(--text-primary)">{value}</p>
  <p class="text-xs mt-1" style="color: var(--text-muted)">{subtext}</p>
</div>
```

**Mock data:**

```ts
const stats = [
  {
    label: "My Divisions",
    value: "3",
    subtext: "QA, Dev, DevOps",
    icon: Buildings,
    iconBg: "rgba(77, 142, 255, 0.12)",
    iconColor: "var(--accent-primary)",
  },
  {
    label: "Total Projects",
    value: "12",
    subtext: "across all divisions",
    icon: FolderLock,
    iconBg: "rgba(45, 212, 191, 0.12)",
    iconColor: "var(--accent-teal)",
  },
  {
    label: "Credentials",
    value: "47",
    subtext: "stored & encrypted",
    icon: KeyRound,
    iconBg: "rgba(245, 166, 35, 0.12)",
    iconColor: "var(--accent-amber)",
  },
  {
    label: "Audit Events",
    value: "128",
    subtext: "last 7 days",
    icon: ClipboardText,
    iconBg: "rgba(139, 92, 246, 0.12)",
    iconColor: "var(--accent-purple)",
  },
];
```

---

## Section 6 — My Divisions Grid

Below the stats row, a section heading + division cards grid.

**Section heading:**

```
<div class="flex items-center justify-between mt-8 mb-4">
  <h2 class="text-sm font-semibold uppercase tracking-wider" style="color: var(--text-muted)">
    My Divisions
  </h2>
  <button class="text-xs font-medium" style="color: var(--accent-primary)">
    View all
  </button>
</div>
```

**Grid:** `grid grid-cols-1 md:grid-cols-3 gap-4`

**Division card anatomy:**

```
<div class="glass rounded-xl p-5 flex flex-col gap-4 cursor-pointer hover:glass-raised transition-all duration-150">
  <!-- Header -->
  <div class="flex items-center gap-3">
    <div class="w-9 h-9 rounded-lg flex items-center justify-center" style="background: {accentBg}">
      <Buildings size={18} weight="duotone" color={accentColor} />
    </div>
    <div>
      <p class="text-sm font-semibold" style="color: var(--text-primary)">{name}</p>
      <p class="text-xs" style="color: var(--text-muted)">{role}</p>
    </div>
    <CaretRight size={14} weight="duotone" color="var(--text-muted)" class="ml-auto" />
  </div>

  <!-- Divider -->
  <div style="border-top: 1px solid var(--glass-border-subtle)" />

  <!-- Stats row -->
  <div class="flex items-center gap-4">
    <div>
      <p class="text-lg font-bold" style="color: var(--text-primary)">{projectCount}</p>
      <p class="text-[10px] uppercase tracking-wider" style="color: var(--text-muted)">Projects</p>
    </div>
    <div>
      <p class="text-lg font-bold" style="color: var(--text-primary)">{memberCount}</p>
      <p class="text-[10px] uppercase tracking-wider" style="color: var(--text-muted)">Members</p>
    </div>
    <div>
      <p class="text-lg font-bold" style="color: var(--text-primary)">{credentialCount}</p>
      <p class="text-[10px] uppercase tracking-wider" style="color: var(--text-muted)">Credentials</p>
    </div>
  </div>
</div>
```

**Mock divisions:**

```ts
const mockDivisions = [
  {
    name: "QA Division",
    role: "Division Admin",
    accentColor: "var(--accent-primary)",
    accentBg: "rgba(77, 142, 255, 0.12)",
    projectCount: 5,
    memberCount: 6,
    credentialCount: 23,
  },
  {
    name: "Dev Division",
    role: "Member",
    accentColor: "var(--accent-teal)",
    accentBg: "rgba(45, 212, 191, 0.12)",
    projectCount: 4,
    memberCount: 8,
    credentialCount: 17,
  },
  {
    name: "DevOps",
    role: "Member",
    accentColor: "var(--accent-amber)",
    accentBg: "rgba(245, 166, 35, 0.12)",
    projectCount: 3,
    memberCount: 4,
    credentialCount: 7,
  },
];
```

---

## Section 7 — Recent Activity Feed

Below the divisions grid, a two-column layout on large screens: `grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6`.

**Left panel (col-span-2): Recent Activity**

```
<div class="glass rounded-xl p-5 lg:col-span-2">
  <h2 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color: var(--text-muted)">
    Recent Activity
  </h2>
  <!-- activity list -->
</div>
```

Each activity row:

```
<div class="flex items-start gap-3 py-3 border-b" style="border-color: var(--glass-border-subtle)">
  <!-- Icon pill -->
  <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
       style="background: {iconBg}">
    <Icon size={14} weight="duotone" color={iconColor} />
  </div>
  <!-- Text -->
  <div class="flex-1 min-w-0">
    <p class="text-sm" style="color: var(--text-primary)">
      <span class="font-semibold">{actor}</span> {action}
      <span class="font-medium" style="color: var(--accent-primary)">{target}</span>
    </p>
    <p class="text-xs mt-0.5" style="color: var(--text-muted)">{division} · {timeAgo}</p>
  </div>
</div>
```

**Mock activity items (7 rows):**

```ts
const mockActivity = [
  {
    actor: "Budi S.",
    action: "viewed credential",
    target: "Staging API Key",
    division: "QA Division",
    timeAgo: "2 min ago",
    icon: Eye,
    iconBg: "rgba(77,142,255,0.10)",
    iconColor: "var(--accent-primary)",
  },
  {
    actor: "Rizky D.",
    action: "added credential",
    target: "DB_PASSWORD_STG",
    division: "QA Division",
    timeAgo: "1 hr ago",
    icon: Plus,
    iconBg: "rgba(18,183,106,0.10)",
    iconColor: "var(--state-success)",
  },
  {
    actor: "Ayu L.",
    action: "updated credential",
    target: "CLERK_SECRET_KEY",
    division: "Dev Division",
    timeAgo: "3 hr ago",
    icon: PencilSimple,
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  {
    actor: "Dimas R.",
    action: "joined division",
    target: "DevOps",
    division: "DevOps",
    timeAgo: "5 hr ago",
    icon: UsersThree,
    iconBg: "rgba(45,212,191,0.10)",
    iconColor: "var(--accent-teal)",
  },
  {
    actor: "Budi S.",
    action: "created project",
    target: "Mobile Staging",
    division: "QA Division",
    timeAgo: "Yesterday",
    icon: FolderLock,
    iconBg: "rgba(139,92,246,0.10)",
    iconColor: "var(--accent-purple)",
  },
  {
    actor: "Rizky D.",
    action: "deleted credential",
    target: "OLD_API_TOKEN",
    division: "Dev Division",
    timeAgo: "Yesterday",
    icon: Trash,
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
  {
    actor: "Ayu L.",
    action: "viewed credential",
    target: "SSH Deploy Key",
    division: "DevOps",
    timeAgo: "2 days ago",
    icon: Eye,
    iconBg: "rgba(77,142,255,0.10)",
    iconColor: "var(--accent-primary)",
  },
];
```

Last row has no `border-b`.

**Right panel (col-span-1): Quick Access**

```
<div class="glass rounded-xl p-5">
  <h2 class="text-sm font-semibold uppercase tracking-wider mb-4" style="color: var(--text-muted)">
    Quick Access
  </h2>
  <!-- project links -->
</div>
```

Each quick-access item:

```
<div class="flex items-center gap-3 py-2.5 border-b cursor-pointer hover group"
     style="border-color: var(--glass-border-subtle)">
  <div class="w-7 h-7 rounded-md flex items-center justify-center shrink-0"
       style="background: var(--glass-bg-raised)">
    <FolderLock size={14} weight="duotone" color="var(--text-subtle)" />
  </div>
  <div class="flex-1 min-w-0">
    <p class="text-xs font-semibold truncate" style="color: var(--text-primary)">{projectName}</p>
    <p class="text-[10px]" style="color: var(--text-muted)">{division} · {credCount} credentials</p>
  </div>
  <CaretRight size={12} weight="duotone" color="var(--text-muted)" />
</div>
```

**Mock projects (5 items):**

```ts
const quickAccess = [
  { projectName: "API Staging", division: "QA Division", credCount: 9 },
  { projectName: "API Production", division: "QA Division", credCount: 6 },
  { projectName: "Frontend Env", division: "Dev Division", credCount: 4 },
  { projectName: "CI/CD Secrets", division: "DevOps", credCount: 7 },
  { projectName: "Mobile Staging", division: "QA Division", credCount: 3 },
];
```

---

## Section 8 — Component File Structure

Create the following files. Do not create any other files.

```
app/
└── (app)/
    ├── layout.tsx          ← app shell layout (Server Component)
    └── dashboard/
        └── page.tsx        ← dashboard page (Server Component)

components/
└── layout/
    ├── Sidebar.tsx         ← sidebar (Client Component)
    └── Topbar.tsx          ← topbar (Client Component)
```

All mock data lives inside the component or page file that renders it. Do not create a separate `mock/` or `data/` file.

---

## Section 9 — Styling Rules to Enforce

Apply every rule from `ui-context.md`. These are the ones most likely to be missed:

1. **No solid fills on sidebar or topbar.** Both must use `class="glass"` — `backdrop-filter: blur(16px)` is required.
2. **The gradient canvas must bleed through the sidebar.** If the sidebar looks like a solid dark panel, the glass class is missing or `backdrop-filter` is not being applied.
3. **All CSS token references use `style={{ color: 'var(--token)' }}` in JSX**, not Tailwind color utilities, because Tailwind doesn't know our custom properties unless explicitly mapped.
4. **Phosphor icons: always `weight="duotone"`**, never omit this prop.
5. **No hardcoded hex values** anywhere in component files — only tokens.
6. **Border radius scale**: badges `rounded`, buttons/inputs `rounded-lg`, cards `rounded-xl`, modals `rounded-2xl`.
7. **Hover transitions**: `transition-colors duration-100` on nav items, `transition-all duration-150` on division cards.
8. **Fonts**: page titles use `font-bold tracking-tight`, section labels use `font-semibold uppercase tracking-wider text-xs`.

---

## Section 10 — What Not to Build

Do not implement anything from this list — it belongs to a later phase:

- Any `fetch()`, `useEffect()`, or data loading — static mock only
- Clerk `useUser()`, `useSession()`, or any auth hook
- Any Prisma query or server action
- The actual `/divisions`, `/projects`, `/credentials`, `/members`, `/audit` pages — navigation links are non-functional placeholders
- Search functionality — the input renders but does nothing
- The "View all" button — renders but has no handler
- Mobile hamburger menu or responsive sidebar collapse

---

## Check When Done

- [ ] `npm run build` passes with no TypeScript errors
- [ ] `npm run dev` — opening `http://localhost:3000/dashboard` renders the full dashboard without errors or blank panels
- [ ] The sidebar gradient canvas is **visible through** the sidebar panel (not a solid dark fill)
- [ ] The topbar gradient canvas is **visible through** the topbar panel
- [ ] All three division cards render with correct accent colors and mock counts
- [ ] The stat cards row shows all four cards with icons, values, and subtexts
- [ ] The recent activity feed shows 7 rows with correct icons and color-coded icon backgrounds
- [ ] The quick access panel shows 5 project rows
- [ ] Active nav item ("Dashboard") has a blue left border and `glass-bg-active` background
- [ ] Inactive nav items show `glass-bg-hover` on mouse hover with a `100ms` transition
- [ ] Division chips in the sidebar render with colored dots and hover states
- [ ] User row at the bottom of the sidebar renders with gradient avatar and name/role text
- [ ] OTP badge in the topbar renders in green with the `ShieldCheck` icon
- [ ] The search input in the topbar is glass-styled with no background fill
- [ ] All Phosphor icons use `weight="duotone"` — inspect the DOM to confirm no icons render without it
- [ ] No hardcoded hex color values appear anywhere in the new component files
- [ ] The layout holds at 1024px viewport width without horizontal overflow
