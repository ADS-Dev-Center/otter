# 06 — Glassmorphism Redesign

## Reference

Source: `context/screenshoots/image.png` — a sidebar UI showing the exact visual target for this design system. Every implementation decision in this file is derived from that reference.

---

## Design System Summary

| Property         | Value                                                      |
| ---------------- | ---------------------------------------------------------- |
| Background       | Bright electric cobalt blue with flowing wave contour texture |
| Panel style      | Dark navy frosted glass floating on bright canvas          |
| Contrast model   | Bright bg → dark panels (inverted from typical dark mode)  |
| Active indicator | White 2px vertical bar (NOT accent blue)                   |
| Panel form       | Floating card with `rounded-2xl` on all sides              |
| Icon weight      | Phosphor Duotone only                                      |
| Font             | DM Sans (UI) + JetBrains Mono (secrets/code)               |

---

## Background Canvas

The canvas is a multi-layer radial gradient producing a flowing wave / liquid contour effect across a cobalt blue field.

```css
background:
  radial-gradient(ellipse 80% 60% at 10% 40%, rgba(100, 170, 255, 0.28) 0%, transparent 60%),
  radial-gradient(ellipse 70% 80% at 90% 70%, rgba(20, 80, 220, 0.38) 0%, transparent 60%),
  radial-gradient(ellipse 60% 50% at 55% 5%, rgba(60, 130, 255, 0.22) 0%, transparent 50%),
  radial-gradient(ellipse 50% 70% at 30% 90%, rgba(10, 50, 180, 0.30) 0%, transparent 55%),
  linear-gradient(135deg, #1238c8 0%, #1a4ed8 45%, #1048d0 100%);
background-attachment: fixed;
```

This is set once on `html, body` and never overridden — every component floats transparently above this canvas.

---

## Sidebar — Expanded State

Width: `240px`. Padding: `16px`. Border-radius: `rounded-2xl` (all corners). Glass treatment: `.glass-heavy`.

```
┌─────────────────────────────────┐  ← rounded-2xl, glass-heavy
│ 🦦 Hello!                    [K]│  ← user header
│    Mike                          │
├─────────────────────────────────┤
│ 🔍  Search...            ⌘ F    │  ← search bar
├─────────────────────────────────┤
│ ▦  Dashboard                    │  ← nav item default
│▌□  Projects              ─      │  ← nav item ACTIVE (white 2px left bar)
│    • Tattoos             ›      │  ← sub-nav item (white dot, dark chevron btn)
│    🔴 Riot Games         ›      │  ← sub-nav item (red dot, hover state)
│ ≡  Tasks               [16]    │  ← nav item + badge
│ ⊡  Analytics             +      │  ← nav item + add button
├─────────────────────────────────┤
│ ⚙  Settings                    │
│ ⬚  Log out                     │
├─────────────────────────────────┤
│ + Get full access          →    │  ← CTA pill button
└─────────────────────────────────┘
```

### User Header

```tsx
<div className="flex items-center gap-3 px-2 py-3">
  {/* Avatar */}
  <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0">
    <img src={avatarSrc} alt="avatar" className="w-full h-full object-cover" />
    {/* Online status dot */}
    <span
      className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2"
      style={{ background: "var(--state-success)", borderColor: "rgba(8,16,52,0.80)" }}
    />
  </div>
  {/* Greeting */}
  <div className="flex-1 min-w-0">
    <p className="text-[10px] font-medium" style={{ color: "var(--text-muted)" }}>
      Hello!
    </p>
    <p className="text-base font-bold leading-tight truncate" style={{ color: "var(--text-primary)" }}>
      {userName}
    </p>
  </div>
  {/* Collapse toggle */}
  <button
    className="w-7 h-7 rounded-lg flex items-center justify-center"
    style={{ background: "var(--glass-bg-hover)" }}
    onClick={onToggle}
  >
    <SidebarSimple weight="duotone" size={16} color="var(--text-muted)" />
  </button>
</div>
```

### Search Bar

Full-width, inside sidebar. Dark glass rounded rectangle with search icon on the left and keyboard shortcut badge on the right.

```tsx
<div
  className="flex items-center gap-2 rounded-xl px-3 py-2 mx-1 mb-2"
  style={{
    background: "rgba(4, 8, 32, 0.50)",
    border: "1px solid var(--glass-border-subtle)",
  }}
>
  <MagnifyingGlass weight="duotone" size={14} color="var(--text-muted)" />
  <input
    className="flex-1 bg-transparent text-sm outline-none"
    style={{ color: "var(--text-primary)" }}
    placeholder="Search..."
  />
  {/* Shortcut badge */}
  <span
    className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
    style={{
      background: "rgba(255,255,255,0.08)",
      color: "var(--text-muted)",
      border: "1px solid var(--glass-border-subtle)",
    }}
  >
    ⌘ F
  </span>
</div>
```

### Navigation Item — Default

```tsx
<button
  className="relative flex items-center gap-3 w-full rounded-lg px-3 py-2.5 transition-colors duration-100"
  style={{ background: isActive ? "var(--glass-bg-active)" : "transparent" }}
  onMouseEnter={...}
>
  {/* Active left bar — white, 2px, full item height, flush to left edge */}
  {isActive && (
    <span
      className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full"
      style={{ background: "#FFFFFF" }}
    />
  )}
  <Icon
    weight="duotone"
    size={20}
    color={isActive ? "#FFFFFF" : "var(--text-muted)"}
  />
  <span
    className="text-sm font-medium"
    style={{ color: isActive ? "var(--text-primary)" : "var(--text-subtle)" }}
  >
    {label}
  </span>
</button>
```

Hover (inactive): `background: var(--glass-bg-hover)`, `transition-colors duration-100`.

### Navigation Item — With Expand/Collapse Action (e.g., Projects)

When a nav section is expandable (like Projects showing sub-projects), the right action button changes:

- **Expanded**: Dark circular button with `−` (Minus icon) — indicates click to collapse
- **Collapsed**: Same button shows `+` or nothing

```tsx
<div className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 relative">
  {/* Active bar */}
  {isActive && <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-full" style={{ background: "#fff" }} />}
  <FolderLock weight="duotone" size={20} color={isActive ? "#fff" : "var(--text-muted)"} />
  <span className="text-sm font-medium flex-1 text-left" style={{ color: isActive ? "var(--text-primary)" : "var(--text-subtle)" }}>
    Projects
  </span>
  {/* Expand/collapse button */}
  <button
    className="w-6 h-6 rounded-full flex items-center justify-center"
    style={{ background: "rgba(255,255,255,0.10)" }}
    onClick={onToggleExpand}
  >
    {isExpanded
      ? <Minus weight="duotone" size={12} color="var(--text-muted)" />
      : <Plus weight="duotone" size={12} color="var(--text-muted)" />
    }
  </button>
</div>
```

### Sub-Navigation Item

Indented beneath expanded parent. Left side: colored `w-2 h-2 rounded-full` status dot. Right side: dark glass circular chevron button.

```tsx
<div
  className="flex items-center gap-3 pl-9 pr-3 py-2 rounded-lg cursor-pointer group transition-colors duration-100"
  style={{ background: isHovered ? "var(--glass-bg-hover)" : "transparent" }}
>
  {/* Status dot */}
  <span
    className="w-2 h-2 rounded-full shrink-0"
    style={{ background: dotColor }}  // var(--dot-default) or var(--dot-critical) etc.
  />
  {/* Label */}
  <span
    className="text-sm font-medium flex-1 truncate"
    style={{ color: "var(--text-subtle)" }}
  >
    {projectName}
  </span>
  {/* Chevron button */}
  <button
    className="w-6 h-6 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-100"
    style={{ background: "rgba(255,255,255,0.12)" }}
  >
    <CaretRight weight="duotone" size={12} color="var(--text-muted)" />
  </button>
</div>
```

Status dot colors by project status:
- Default / no status: `var(--dot-default)` → `#FFFFFF`
- Critical / urgent: `var(--dot-critical)` → `#F04438`
- Warning: `var(--dot-warning)` → `#F5A623`
- Healthy: `var(--dot-success)` → `#12B76A`

### Navigation Item — With Badge (e.g., Tasks)

```tsx
<button className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5 transition-colors duration-100">
  <ClipboardText weight="duotone" size={20} color="var(--text-muted)" />
  <span className="text-sm font-medium flex-1 text-left" style={{ color: "var(--text-subtle)" }}>
    Tasks
  </span>
  {/* Count badge */}
  <span
    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
    style={{ background: "var(--state-error)", color: "#FFFFFF" }}
  >
    16
  </span>
</button>
```

### Navigation Item — With Add Action (e.g., Analytics)

```tsx
<button className="flex items-center gap-3 w-full rounded-lg px-3 py-2.5">
  <ChartLine weight="duotone" size={20} color="var(--text-muted)" />
  <span className="text-sm font-medium flex-1 text-left" style={{ color: "var(--text-subtle)" }}>
    Analytics
  </span>
  <button
    className="w-6 h-6 rounded-full flex items-center justify-center"
    style={{ background: "rgba(255,255,255,0.10)" }}
  >
    <Plus weight="duotone" size={12} color="var(--text-muted)" />
  </button>
</button>
```

### CTA Button (Bottom of Sidebar)

A dark pill-shaped button spanning the full width of the sidebar. Has a subtle glowing blue-gradient border to draw attention without being aggressive.

```tsx
<div className="px-2 pb-3 mt-auto">
  <button
    className="w-full flex items-center justify-between px-4 py-3 rounded-full text-sm font-semibold transition-all duration-150"
    style={{
      background: "rgba(4, 10, 40, 0.85)",
      border: "1px solid rgba(77, 142, 255, 0.35)",
      boxShadow: "0 0 16px rgba(77, 142, 255, 0.15), inset 0 1px 0 rgba(255,255,255,0.08)",
      color: "var(--text-primary)",
    }}
  >
    <span className="flex items-center gap-2">
      <Plus weight="duotone" size={14} color="var(--accent-primary)" />
      Get full access
    </span>
    <ArrowRight weight="duotone" size={16} color="var(--text-muted)" />
  </button>
</div>
```

---

## Sidebar — Collapsed State

Width: `64px`. Shows icon-only containers; labels hidden. Tooltip appears on hover to the right of each icon.

```
┌────┐
│ 🦦 │  ← avatar only (no greeting)
├────┤
│ 🔍 │  ← search icon only
├────┤
│ ▦  │  ← Dashboard icon
│ □  │  ← Projects icon (active: white indicator)
│ •  │  ← status dot only (Tattoos sub-item)
│🔴  │  ← red dot (Riot Games) — with [Riot Games] tooltip on hover
│ ≡  │  ← Tasks
│ ⊡  │  ← Analytics
├────┤
│ ⚙  │
│ ⬚  │
├────┤
│+→  │  ← CTA collapsed
└────┘
```

### Collapsed Icon Container

```tsx
<button
  className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto transition-colors duration-100"
  style={{
    background: isActive ? "var(--glass-bg-active)" : "transparent",
    position: "relative",
  }}
  onMouseEnter={() => setHoveredItem(label)}
  onMouseLeave={() => setHoveredItem(null)}
>
  {/* Active indicator — white vertical bar on left */}
  {isActive && (
    <span
      className="absolute left-0 top-1.5 bottom-1.5 w-0.5 rounded-full"
      style={{ background: "#FFFFFF" }}
    />
  )}
  <Icon weight="duotone" size={20} color={isActive ? "#FFFFFF" : "var(--text-muted)"} />

  {/* Tooltip */}
  {hoveredItem === label && (
    <div
      className="absolute left-full ml-3 px-3 py-1.5 rounded-xl whitespace-nowrap z-50 pointer-events-none"
      style={{
        background: "#FFFFFF",
        color: "#0A1230",
        fontWeight: 600,
        fontSize: "13px",
        boxShadow: "0 4px 16px rgba(0,0,0,0.25)",
        animation: "fadeSlideIn 100ms ease-out",
      }}
    >
      {label}
    </div>
  )}
</button>
```

### Tooltip Animation

```css
@keyframes fadeSlideIn {
  from {
    opacity: 0;
    transform: translateX(-4px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}
```

---

## Status Dot Reference

Used in sub-navigation items. Dot is `w-2 h-2 rounded-full`. Color indicates project urgency or status:

| Status    | Color Variable      | Hex       | Use case                        |
| --------- | ------------------- | --------- | ------------------------------- |
| Default   | `--dot-default`     | `#FFFFFF` | No active issue                 |
| Critical  | `--dot-critical`    | `#F04438` | Production issue / P1 project   |
| Warning   | `--dot-warning`     | `#F5A623` | Degraded / needs attention      |
| Healthy   | `--dot-success`     | `#12B76A` | All clear                       |

---

## Badge (Notification Count)

Solid red rounded-full, NO glass. Used for task counts, unread notifications.

```tsx
<span
  className="inline-flex items-center justify-center min-w-[20px] h-5 rounded-full px-1.5 text-[10px] font-bold"
  style={{ background: "var(--state-error)", color: "#FFFFFF" }}
>
  {count}
</span>
```

---

## Sidebar Expand/Collapse Toggle

The sidebar panel itself has a toggle button (top-right of user header in expanded mode, or a top icon in collapsed mode). In the reference, it shows as a small square icon `[K]` / `[►]`.

- Expanded: shows `SidebarSimple` icon (or custom K-style icon), click collapses to 64px
- Collapsed: shows `►` / `CaretRight` to expand
- Transition: `width` on the sidebar container with `transition: width 200ms ease-in-out`; icon labels fade out with `opacity: 0` + `overflow: hidden`

---

## macOS Window Chrome (Desktop / Electron Context Only)

In the reference, the sidebar panels show macOS traffic light buttons (red ⬤, yellow ⬤, green ⬤). This appears in the context of a desktop/Electron app or a macOS-native wrapper. For the web app:

- Do NOT render traffic light buttons
- The floating panel aesthetic is achieved purely through `rounded-2xl` on all sides + glass + drop shadow
- If a desktop wrapper is added later, this chrome is handled at the shell level, not in React components

---

## Divider Line Between Sections

Between logical sidebar sections (nav, settings, CTA), use a hairline separator:

```tsx
<div
  className="my-2 mx-3"
  style={{ height: "1px", background: "var(--glass-border-subtle)" }}
/>
```

---

## Full Sidebar Component Composition

```
<aside className="glass-heavy rounded-2xl w-[240px] h-screen flex flex-col overflow-hidden">
  <UserHeader />
  <SearchBar />
  <Divider />
  <nav className="flex-1 overflow-y-auto px-2 py-1 space-y-0.5">
    <NavItem label="Dashboard" icon={SquaresFour} href="/dashboard" />
    <NavItemExpandable label="Projects" icon={FolderLock} href="/projects">
      <SubNavItem label="Tattoos" dotColor="var(--dot-default)" href="/projects/tattoos" />
      <SubNavItem label="Riot Games" dotColor="var(--dot-critical)" href="/projects/riot-games" />
    </NavItemExpandable>
    <NavItemBadge label="Tasks" icon={ClipboardText} href="/tasks" count={16} />
    <NavItemAdd label="Analytics" icon={ChartLine} href="/analytics" onAdd={...} />
  </nav>
  <Divider />
  <div className="px-2 py-1 space-y-0.5">
    <NavItem label="Settings" icon={GearSix} href="/settings" />
    <NavItem label="Log out" icon={SignOut} href="/logout" />
  </div>
  <CTAButton label="Get full access" />
</aside>
```

---

## Check When Done

- [ ] Background canvas is bright cobalt blue with visible wave contour texture (layered radial gradients)
- [ ] Sidebar panel shows as dark navy glass floating on the bright blue — NOT a solid dark panel
- [ ] The bright blue canvas bleeds visibly through the sidebar glass
- [ ] Active nav item shows a **white** left vertical bar (not blue, not accent-primary)
- [ ] Active nav item uses `var(--glass-bg-active)` background (faint white tint)
- [ ] Sub-nav items render with colored status dots (white = default, red = critical)
- [ ] Sub-nav item chevron button appears on hover only (`group-hover:opacity-100`)
- [ ] Task count badge is solid red rounded-full with white text
- [ ] "Get full access" CTA is a dark pill with blue-glow border
- [ ] Collapsed sidebar shows icon containers only at 64px width
- [ ] Tooltip appears to the right of icon on hover in collapsed mode — white pill, dark text
- [ ] Tooltip fades in with `fadeSlideIn` animation (100ms)
- [ ] All Phosphor icons use `weight="duotone"` only
- [ ] No hardcoded hex values in component files — only CSS tokens
- [ ] `backdrop-filter: blur(24px)` confirmed active on sidebar panel (inspect DevTools)
- [ ] No solid opaque fills anywhere on glass surfaces
