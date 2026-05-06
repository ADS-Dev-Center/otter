# UI Context

## Theme

Dark only. No light mode. The design language is **glassmorphism** — a deep navy-to-purple gradient base canvas with frosted-glass panels sitting on top of it. Surfaces are semi-transparent with a `backdrop-filter: blur` effect, giving depth and layering without going flat or opaque. Inspired directly by the reference image (CyberX dashboard): a dark blurred background with panels that feel like etched glass, fine light borders, and vivid accent colors cutting through the frost.

Key characteristics:

- **Background canvas**: Rich dark gradient (deep navy → dark purple → near-black), not a solid color. Use a fixed full-viewport `background` with a radial or linear gradient so panels float over it.
- **Glass panels**: Semi-transparent backgrounds (`rgba` values, ~8–15% white opacity) with `backdrop-filter: blur(12px–20px)` and a hairline border (`1px solid rgba(255,255,255,0.08–0.12)`).
- **No opaque surfaces**: Even the sidebar and topbar use glass treatment — they are NOT solid dark fills.
- **Depth through layering**: Panels stack visually; more elevated elements use slightly higher opacity or a lighter glass tint.
- **Accent colors are vivid and deliberate** — they punch through the frosted layers and signal interactivity or state.

## Colors

All components must use these CSS custom property tokens — no hardcoded hex values.

### Canvas (background gradient)

| Role                  | CSS Variable     | Value / Expression                                               |
| --------------------- | ---------------- | ---------------------------------------------------------------- |
| Canvas gradient start | `--canvas-start` | `#0B0F1E` (deep navy)                                            |
| Canvas gradient mid   | `--canvas-mid`   | `#130D2B` (dark purple-indigo)                                   |
| Canvas gradient end   | `--canvas-end`   | `#080C18` (near-black blue)                                      |
| Full canvas gradient  | `--bg-canvas`    | `linear-gradient(135deg, #0B0F1E 0%, #130D2B 50%, #080C18 100%)` |

Applied to `<html>` or the root layout wrapper: `background: var(--bg-canvas); background-attachment: fixed;`

### Glass surfaces

Glass values use `rgba` — never solid hex fills on panels, sidebar, or topbar.

| Role                          | CSS Variable            | Value                       |
| ----------------------------- | ----------------------- | --------------------------- |
| Glass panel (default)         | `--glass-bg`            | `rgba(255, 255, 255, 0.05)` |
| Glass panel (elevated)        | `--glass-bg-raised`     | `rgba(255, 255, 255, 0.09)` |
| Glass panel (hover)           | `--glass-bg-hover`      | `rgba(255, 255, 255, 0.08)` |
| Glass panel (active/selected) | `--glass-bg-active`     | `rgba(59, 126, 246, 0.12)`  |
| Glass border                  | `--glass-border`        | `rgba(255, 255, 255, 0.10)` |
| Glass border subtle           | `--glass-border-subtle` | `rgba(255, 255, 255, 0.06)` |
| Glass blur (default)          | `--glass-blur`          | `blur(16px)`                |
| Glass blur (heavy)            | `--glass-blur-heavy`    | `blur(24px)`                |

Usage pattern for any glass panel or card:

```css
background: var(--glass-bg);
backdrop-filter: var(--glass-blur);
-webkit-backdrop-filter: var(--glass-blur);
border: 1px solid var(--glass-border);
```

### Text

| Role         | CSS Variable     | Value     |
| ------------ | ---------------- | --------- |
| Primary text | `--text-primary` | `#E8EDF5` |
| Muted text   | `--text-muted`   | `#6B7A99` |
| Subtle text  | `--text-subtle`  | `#9AAAC4` |

### Accent colors

| Role           | CSS Variable       | Value                   |
| -------------- | ------------------ | ----------------------- |
| Primary accent | `--accent-primary` | `#4D8EFF`               |
| Accent glow    | `--accent-glow`    | `rgba(77,142,255,0.15)` |
| Amber accent   | `--accent-amber`   | `#F5A623`               |
| Teal accent    | `--accent-teal`    | `#2DD4BF`               |
| Purple accent  | `--accent-purple`  | `#8B5CF6`               |

### States & risk

| Role          | CSS Variable      | Value     |
| ------------- | ----------------- | --------- |
| Error         | `--state-error`   | `#F04438` |
| Warning       | `--state-warning` | `#F5A623` |
| Success       | `--state-success` | `#12B76A` |
| Critical risk | `--risk-critical` | `#F04438` |
| High risk     | `--risk-high`     | `#F97316` |
| Medium risk   | `--risk-medium`   | `#F5A623` |
| Low risk      | `--risk-low`      | `#12B76A` |

### globals.css token block

```css
:root {
  /* Canvas */
  --canvas-start: #0b0f1e;
  --canvas-mid: #130d2b;
  --canvas-end: #080c18;
  --bg-canvas: linear-gradient(135deg, #0b0f1e 0%, #130d2b 50%, #080c18 100%);

  /* Glass surfaces */
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-bg-raised: rgba(255, 255, 255, 0.09);
  --glass-bg-hover: rgba(255, 255, 255, 0.08);
  --glass-bg-active: rgba(77, 142, 255, 0.12);
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-border-subtle: rgba(255, 255, 255, 0.06);
  --glass-blur: blur(16px);
  --glass-blur-heavy: blur(24px);

  /* Text */
  --text-primary: #e8edf5;
  --text-muted: #6b7a99;
  --text-subtle: #9aaac4;

  /* Accents */
  --accent-primary: #4d8eff;
  --accent-glow: rgba(77, 142, 255, 0.15);
  --accent-amber: #f5a623;
  --accent-teal: #2dd4bf;
  --accent-purple: #8b5cf6;

  /* States */
  --state-error: #f04438;
  --state-warning: #f5a623;
  --state-success: #12b76a;

  /* Risk */
  --risk-critical: #f04438;
  --risk-high: #f97316;
  --risk-medium: #f5a623;
  --risk-low: #12b76a;

  /* Typography */
  --font-sans: "DM Sans", sans-serif;
  --font-mono: "JetBrains Mono", monospace;
}

html,
body {
  background: var(--bg-canvas);
  background-attachment: fixed;
  min-height: 100vh;
}
```

## Typography

| Role             | Font            | Variable      | Notes                                               |
| ---------------- | --------------- | ------------- | --------------------------------------------------- |
| UI text / Labels | DM Sans         | `--font-sans` | Clean, slightly geometric; pairs well with dark UIs |
| Code / secrets   | JetBrains Mono  | `--font-mono` | Credential values, tokens, keys shown in mono       |
| Page titles      | DM Sans 600–700 | `--font-sans` | Large weight variation for hierarchy                |

Import via Google Fonts or next/font:

```
DM Sans: 400, 500, 600, 700
JetBrains Mono: 400, 500
```

## Border Radius

| Context             | Tailwind Class | Value  |
| ------------------- | -------------- | ------ |
| Inline / badges     | `rounded`      | 4px    |
| Buttons / inputs    | `rounded-lg`   | 8px    |
| Cards / panels      | `rounded-xl`   | 12px   |
| Modals / sheets     | `rounded-2xl`  | 16px   |
| Avatar / icon chips | `rounded-full` | 9999px |

## Component Library

shadcn/ui on top of Tailwind CSS v4. Components live in `components/ui/`. Use the CLI to add new components rather than writing from scratch:

```
npx shadcn@latest add <component>
```

Override shadcn's default CSS variables in `globals.css` to apply the glass treatment. In particular, override `--background`, `--card`, `--popover`, `--border`, and `--input` to use the glass tokens instead of shadcn's opaque defaults.

## Glass Utility Classes

Define these reusable classes in `globals.css` for consistent glass application across all components:

```css
.glass {
  background: var(--glass-bg);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}

.glass-raised {
  background: var(--glass-bg-raised);
  backdrop-filter: var(--glass-blur);
  -webkit-backdrop-filter: var(--glass-blur);
  border: 1px solid var(--glass-border);
}

.glass-heavy {
  background: var(--glass-bg-raised);
  backdrop-filter: var(--glass-blur-heavy);
  -webkit-backdrop-filter: var(--glass-blur-heavy);
  border: 1px solid var(--glass-border);
}
```

Apply `.glass` via Tailwind's `@apply` or as a className directly. Never use Tailwind's `bg-*` color utilities on panels — always go through the glass token system.

## Layout Patterns

- **Root layout**: `<html>` or root wrapper gets `background: var(--bg-canvas); background-attachment: fixed` so the gradient is always behind everything regardless of scroll.
- **App shell**: Full-viewport layout with a fixed left sidebar (240px), top header bar (56px), and scrollable main content area. All three use `.glass` treatment — none are opaque.
- **Sidebar**: `.glass` with a right border `var(--glass-border)`. Navigation items: icon + label. Active item has `var(--accent-primary)` left border + `var(--glass-bg-active)` background.
- **Header / topbar**: `.glass` with a bottom border `var(--glass-border-subtle)`. Contains breadcrumb, search input (also glass), and OTP badge.
- **Content area**: No background of its own — panels sit directly on the gradient canvas, separated by their glass surfaces.
- **Cards / stat panels**: `.glass` with `rounded-xl`. Use `.glass-raised` for modals or dropdown menus that float over other glass panels.
- **Data tables**: The table container uses `.glass`. Row hover uses `var(--glass-bg-hover)` via `backdrop-filter` on the row (not a solid fill). Column headers sit on `var(--glass-bg-raised)` with `var(--glass-border-subtle)` bottom border.
- **Modals / dialogs**: `.glass-heavy` (`backdrop-filter: blur(24px)`), `rounded-2xl`, centered over a `rgba(0,0,0,0.5)` full-screen overlay.
- **Credential cards**: Glass card with credential name, type badge, masked value in mono, copy button, and reveal toggle. Badge backgrounds use semi-transparent accent colors (`rgba(accent, 0.12)`).
- **Risk / sensitivity bars**: Horizontal bar indicator for credential sensitivity — color-coded using `--risk-*` tokens. Bar track is `var(--glass-bg-raised)`.
- **Inputs / search fields**: Glass treatment — `background: var(--glass-bg)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: var(--glass-blur)`. Focus state: border shifts to `var(--accent-primary)` at `0.4` opacity.
- **Buttons**: Primary button — solid `var(--accent-primary)` fill (no glass, this provides contrast against glass panels). Ghost/icon buttons — `var(--glass-bg)` with `var(--glass-border)`.

## Glassmorphism Rules

These rules must be followed to maintain visual consistency:

1. **Never use solid opaque fills on panels, sidebars, cards, or the topbar.** Every surface that sits on the canvas must be semi-transparent glass.
2. **The gradient canvas must always be visible through panels.** If a component looks flat or solid, its opacity is too high — reduce it.
3. **Backdrop-filter is required on all glass elements.** Without it, the glass effect is broken — the panel just looks like a semi-transparent colored div with no blur.
4. **Borders must be hairline and light.** Use `1px solid rgba(255,255,255,0.08–0.12)` — never a dark border or a thick border on glass surfaces.
5. **Accent colors are NOT glassed.** Badges, active states, and primary buttons use solid or semi-transparent accent fills (`rgba(accent, 0.12–1.0)`), not glass blur.
6. **Test backdrop-filter support.** Use `@supports (backdrop-filter: blur(1px))` and provide a slightly more opaque fallback (`rgba(10,14,30,0.85)`) for browsers that don't support it.

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass,
  .glass-raised,
  .glass-heavy {
    background: rgba(10, 14, 30, 0.85);
  }
}
```

## Credential Value Display

- Masked by default: `••••••••••••` in `--font-mono`
- Reveal button: eye icon toggles plaintext visibility (server request required)
- Copy button: clipboard icon, triggers copy + shows 30s countdown before clipboard is cleared
- Value display always uses `--font-mono` and `--text-primary`

## Icons

**Phosphor Icons — Duotone weight only.** Phosphor Duotone renders two color layers per icon (solid foreground + 30% opacity background), which pairs naturally with the glassmorphism aesthetic — the layered quality of the icon echoes the layered quality of the glass surfaces.

### Installation

```bash
npm install @phosphor-icons/react
```

### Usage

```tsx
import { ShieldCheck, KeyRound, Eye } from "@phosphor-icons/react";

// Always pass weight="duotone"
<ShieldCheck weight="duotone" size={20} />;
```

Always include `weight="duotone"` — do not use other weights (thin, light, regular, bold, fill) unless explicitly instructed. Duotone is Otter's visual identity for icons.

### Standard Sizes

| Context         | Prop        | Pixels |
| --------------- | ----------- | ------ |
| Inline / labels | `size={14}` | 14px   |
| Navigation      | `size={20}` | 20px   |
| Buttons         | `size={16}` | 16px   |
| Empty states    | `size={32}` | 32px   |
| Page hero icons | `size={40}` | 40px   |

### Icon Color

Phosphor Duotone inherits color from the `color` prop or the CSS `color` property. Use tokens:

- Default navigation icon: `color="var(--text-muted)"`
- Active navigation icon: `color="var(--accent-primary)"`
- Icon inside primary button: `color="white"`
- Icon inside ghost button: `color="var(--text-subtle)"`

### Icon Reference by Feature

| Fitur / Konteks | Komponen Phosphor                     |
| --------------- | ------------------------------------- |
| App logo        | `ShieldChevron` atau SVG custom Otter |
| Dashboard       | `SquaresFour`                         |
| Divisions       | `Buildings`                           |
| Projects        | `FolderLock`                          |
| Credentials     | `KeyRound`                            |
| Members         | `UsersThree`                          |
| Audit Log       | `ClipboardText`                       |
| Settings        | `GearSix`                             |
| Add / Create    | `Plus`                                |
| Copy            | `Copy`                                |
| Reveal / Show   | `Eye`                                 |
| Hide / Mask     | `EyeSlash`                            |
| Delete          | `Trash`                               |
| Edit            | `PencilSimple`                        |
| OTP / MFA       | `ShieldCheck`                         |
| URL type        | `LinkSimple`                          |
| Password type   | `Lock`                                |
| API Key type    | `Key`                                 |
| Token type      | `Fingerprint`                         |
| Env Var type    | `Terminal`                            |
| SSH Key type    | `GitBranch`                           |
| Sort / chevron  | `CaretDown` / `CaretUp`               |
| Search          | `MagnifyingGlass`                     |
| Close / dismiss | `X`                                   |
| Warning         | `Warning`                             |
| Info            | `Info`                                |
| Check / success | `CheckCircle`                         |
| Logout          | `SignOut`                             |

## Brand Identity

- App name: **Otter**
- Logo: An otter silhouette icon paired with a shield/lock motif — trustworthy, friendly but secure
- Tagline: "Organized Token & Trusted Environment Repository"
- Color personality: Blue authority + amber warmth — not cold, not aggressive

## Animations & Motion

- Page transitions: subtle fade-in (150ms ease-out)
- Sidebar item hover: background transition (100ms)
- Modal open: scale from 0.97 + fade in (150ms ease-out)
- Credential reveal: value fades in (200ms)
- Copy success: button icon swaps to `Check` for 2s then back
- Table row hover: background transition (80ms)
- No heavy animations — this is a utility tool; motion serves clarity, not decoration

## shadcn components

- install shadcn component when needed
