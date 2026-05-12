# UI Context

## Theme

Dark only. No light mode. The design language is **liquid glassmorphism** — a deep navy-to-purple gradient base canvas with frosted, luminous panels sitting on top of it. Surfaces are semi-transparent but denser than classic glass, with a stronger `backdrop-filter` and a subtle liquid sheen so buttons, selected rows, and primary actions remain clear without becoming opaque. Inspired directly by the reference image (CyberX dashboard): a dark blurred background with etched glass layers, fine light borders, and vivid accent colors cutting through the frost.

Key characteristics:

- **Background canvas**: Rich dark gradient (deep navy → dark purple → near-black), not a solid color. Use a fixed full-viewport `background` with a radial or linear gradient so panels float over it.
- **Liquid glass panels**: Dark navy bases (`rgba(18–22, 24–28, 46–54, 0.82–0.98)`) with splay radial gradients on top for the white shimmer. **Do not use white-tinted `rgba(255,255,255,…)` bases** — they produce grey panels instead of dark glass. `backdrop-filter: blur(20px–40px) saturate(150%) brightness(0.92–0.94)` with all 5 liquid effects (frost, splay, refraction, depression, depth).
- **No opaque surfaces**: Even the sidebar and topbar use glass treatment — they are NOT solid dark fills.
- **Depth through layering**: Panels stack visually; more elevated elements use slightly higher opacity, brighter highlights, and a lighter liquid tint.
- **Accent colors are vivid and deliberate** — they punch through the frosted layers and signal interactivity or state. Selected and action surfaces lean brighter instead of darker.

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

| Role                          | CSS Variable               | Value                       |
| ----------------------------- | -------------------------- | --------------------------- |
| Liquid glass panel (default)  | `--glass-bg`               | `rgba(255, 255, 255, 0.06)` |
| Liquid glass panel (elevated) | `--glass-bg-raised`        | `rgba(255, 255, 255, 0.11)` |
| Liquid glass panel (hover)    | `--glass-bg-hover`         | `rgba(255, 255, 255, 0.10)` |
| Liquid glass panel (active)   | `--glass-bg-active`        | `rgba(77, 142, 255, 0.18)`  |
| Liquid glass border           | `--glass-border`           | `rgba(255, 255, 255, 0.14)` |
| Liquid glass border subtle    | `--glass-border-subtle`    | `rgba(255, 255, 255, 0.08)` |
| Liquid glass blur (default)   | `--glass-blur`             | `blur(18px) saturate(145%)` |
| Liquid glass blur (heavy)     | `--glass-blur-heavy`       | `blur(28px) saturate(160%)` |
| Liquid button fill            | `--button-liquid-bg`       | `rgba(109, 161, 255, 0.26)` |
| Liquid button fill (hover)    | `--button-liquid-bg-hover` | `rgba(125, 175, 255, 0.34)` |
| Liquid button border          | `--button-liquid-border`   | `rgba(140, 185, 255, 0.42)` |

Usage pattern for any glass panel or card:

use tailwindcss className and `cn()` function if it's needed

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

  /* Liquid glass surfaces */
  --glass-bg: rgba(255, 255, 255, 0.06);
  --glass-bg-raised: rgba(255, 255, 255, 0.11);
  --glass-bg-hover: rgba(255, 255, 255, 0.1);
  --glass-bg-active: rgba(77, 142, 255, 0.18);
  --glass-border: rgba(255, 255, 255, 0.14);
  --glass-border-subtle: rgba(255, 255, 255, 0.08);
  --glass-blur: blur(18px) saturate(145%);
  --glass-blur-heavy: blur(28px) saturate(160%);
  --button-liquid-bg: rgba(109, 161, 255, 0.26);
  --button-liquid-bg-hover: rgba(125, 175, 255, 0.34);
  --button-liquid-border: rgba(140, 185, 255, 0.42);

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

## The 5 Liquid Glass Effects

Every glass surface must express all five of these physical liquid properties. They work together — omitting any one makes the surface look flat or synthetic.

### 1. Frost (Blur + Saturate + Brightness)

**What it is**: The primary blur that makes content behind the glass unreadable as distinct shapes, while amplifying color saturation and slightly dampening brightness so the glass reads as a cold, frosted layer.

**CSS pattern**:
```css
backdrop-filter: blur(20px–40px) saturate(150%) brightness(0.92–0.94);
-webkit-backdrop-filter: blur(20px–40px) saturate(150%) brightness(0.92–0.94);
```

- `blur`: 20px for cards, 32px for modals, 40px for panels/sidebar
- `saturate(150%)`: boosts background color bleed for a liquid feel
- `brightness(0.92–0.94)`: darkens behind-content slightly so the panel reads as a distinct layer

### 2. Splay (Refraction Radial Gradients)

**What it is**: Light enters at angles and "splays" across the surface — simulated by two radial gradients: one at a top corner (top-light catch) and one at the opposite bottom corner (accent bleed). Together they create the soft directional shimmer of glass refracting ambient light.

**CSS pattern**:
```css
background:
  radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.08–0.12) 0%, transparent 55–60%),
  radial-gradient(ellipse at 82% 100%, rgba(77,142,255,0.05–0.08) 0%, transparent 50–55%),
  linear-gradient(160deg, rgba(22,28,52,0.88–0.96) 0%, rgba(10,14,28,0.90–0.98) 100%);
```

- First gradient: white catch at the top-left — simulates light entry
- Second gradient: accent-tinted bleed at bottom-right — simulates transmitted light
- Third gradient: the dark navy base that ensures legibility

### 3. Refraction (Top-edge Highlight Line)

**What it is**: The thinnest line at the very top of a glass element — a single-pixel `inset 0 1px 0` highlight. In real glass, the upper edge catches and bends light more intensely than the face. This line is the signature of liquid glass; without it surfaces look flat.

**CSS pattern**:
```css
box-shadow:
  /* ... depth shadows ... */
  inset 0 1px 0 rgba(255,255,255,0.13–0.18),   /* refraction: top edge catch */
  inset 0 -1px 0 rgba(0,0,0,0.18–0.22);         /* refraction: bottom edge absorption */
```

### 4. Depression (Inset Shadows)

**What it is**: A subtle inward push created by the inset shadows on top and bottom edges. The top inset highlight + bottom inset dark together make the surface read as slightly concave — like liquid pooled in a shallow dish rather than a flat pane.

**CSS pattern**: Same `box-shadow` declaration as Refraction — the pair of inset values creates the depression illusion. The top-edge highlight pushes light "down" while the bottom-edge shadow pulls the surface "in".

### 5. Depth (Layered Drop Shadows)

**What it is**: Two or three external `box-shadow` values of different radii and opacities. The larger, softer shadow creates ambient depth (the panel floating above the canvas). The smaller, sharper shadow creates contact shadow (where the panel "touches" the layer below it). Together they create the Z-axis separation that makes panels feel elevated.

**CSS pattern**:
```css
box-shadow:
  0 20px 56px rgba(0,0,0,0.52),   /* ambient depth: large, soft */
  0 4px 12px rgba(0,0,0,0.32),    /* contact shadow: small, sharp */
  inset 0 1px 0 rgba(255,255,255,0.15),  /* refraction top */
  inset 0 -1px 0 rgba(0,0,0,0.20);      /* depression bottom */
```

---

## Glass Utility Classes

All five effects must be present in every glass class. The classes differ only in intensity (blur radius, base opacity, shadow strength).

**Important**: Glass bases use dark navy (`rgba(22,28,52,…)`) not white. White-tinted bases (`rgba(255,255,255,0.06)`) look washed out against the dark canvas — they produce grey panels instead of dark frosted glass. The splay gradients provide the white shimmer on top of a dark base.

```css
/* .glass — default card/panel surface */
.glass {
  backdrop-filter: blur(20px) saturate(150%) brightness(0.94);
  -webkit-backdrop-filter: blur(20px) saturate(150%) brightness(0.94);
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.10) 0%, transparent 60%),   /* splay: top catch */
    radial-gradient(ellipse at 82% 100%, rgba(77,142,255,0.07) 0%, transparent 55%),  /* splay: accent bleed */
    linear-gradient(160deg, rgba(18,24,46,0.82) 0%, rgba(10,14,28,0.90) 100%);       /* dark navy base */
  border: 1px solid rgba(255,255,255,0.12);
  box-shadow:
    0 8px 24px rgba(0,0,0,0.40),            /* depth: ambient */
    0 2px 6px rgba(0,0,0,0.25),             /* depth: contact */
    inset 0 1px 0 rgba(255,255,255,0.13),   /* refraction: top edge */
    inset 0 -1px 0 rgba(0,0,0,0.18);       /* depression: bottom edge */
}

/* .glass-raised — elevated cards, dropdown menus, popovers */
.glass-raised {
  backdrop-filter: blur(24px) saturate(150%) brightness(0.92);
  -webkit-backdrop-filter: blur(24px) saturate(150%) brightness(0.92);
  background:
    radial-gradient(ellipse at 18% 0%, rgba(255,255,255,0.12) 0%, transparent 58%),
    radial-gradient(ellipse at 84% 100%, rgba(77,142,255,0.08) 0%, transparent 52%),
    linear-gradient(160deg, rgba(20,26,50,0.88) 0%, rgba(11,15,30,0.94) 100%);
  border: 1px solid rgba(255,255,255,0.14);
  box-shadow:
    0 12px 36px rgba(0,0,0,0.46),
    0 3px 8px rgba(0,0,0,0.28),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.20);
}

/* .glass-heavy — modals, dialogs, sheets */
.glass-heavy {
  backdrop-filter: blur(32px) saturate(150%) brightness(0.93);
  -webkit-backdrop-filter: blur(32px) saturate(150%) brightness(0.93);
  background:
    radial-gradient(ellipse at 16% 0%, rgba(255,255,255,0.14) 0%, transparent 56%),
    radial-gradient(ellipse at 86% 100%, rgba(77,142,255,0.09) 0%, transparent 50%),
    linear-gradient(160deg, rgba(22,28,54,0.93) 0%, rgba(12,16,32,0.97) 100%);
  border: 1px solid rgba(255,255,255,0.16);
  box-shadow:
    0 24px 64px rgba(0,0,0,0.56),
    0 6px 16px rgba(0,0,0,0.34),
    inset 0 1px 0 rgba(255,255,255,0.18),
    inset 0 -1px 0 rgba(0,0,0,0.22);
}

/* .panel-sidebar, .panel-rail, .panel-dropdown — navigation panels */
/* Shared base: darkest frost (blur 40px) for maximum panel opacity */
.panel-sidebar,
.panel-rail,
.panel-dropdown {
  backdrop-filter: blur(40px) saturate(150%) brightness(0.92);
  -webkit-backdrop-filter: blur(40px) saturate(150%) brightness(0.92);
  background:
    radial-gradient(ellipse at 20% 0%, rgba(255,255,255,0.07) 0%, transparent 55%),
    radial-gradient(ellipse at 85% 100%, rgba(77,142,255,0.05) 0%, transparent 50%),
    linear-gradient(160deg, rgba(22,28,52,0.96) 0%, rgba(11,15,30,0.98) 100%);
  border: 1px solid rgba(255,255,255,0.13);
}

.panel-sidebar {
  box-shadow:
    0 20px 56px rgba(0,0,0,0.52),
    0 4px 12px rgba(0,0,0,0.32),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.20);
  @apply rounded-xl overflow-hidden;
}

.panel-rail {
  box-shadow:
    0 20px 56px rgba(0,0,0,0.52),
    0 4px 12px rgba(0,0,0,0.32),
    inset 0 1px 0 rgba(255,255,255,0.15),
    inset 0 -1px 0 rgba(0,0,0,0.20);
  @apply rounded-2xl overflow-hidden;
}

.panel-dropdown {
  box-shadow:
    0 24px 48px rgba(0,0,0,0.60),
    0 6px 14px rgba(0,0,0,0.38),
    inset 0 1px 0 rgba(255,255,255,0.16),
    inset 0 -1px 0 rgba(0,0,0,0.22);
  @apply rounded-xl overflow-hidden;
}
```

Apply `.glass` / `.glass-raised` / `.glass-heavy` as a className directly. Never use Tailwind's `bg-*` color utilities on panels — always go through the liquid glass class system.

## Layout Patterns

- **Root layout**: `<html>` or root wrapper gets `background: var(--bg-canvas); background-attachment: fixed` so the gradient is always behind everything regardless of scroll.
- **App shell**: Full-viewport layout with a fixed left sidebar (240px), top header bar (56px), and scrollable main content area. All three use liquid glass treatment — none are opaque.
- **Sidebar**: `.glass` with a right border `var(--glass-border)`. Navigation items: icon + label. Active item uses the brighter liquid active fill with `var(--accent-primary)` left border.
- **Header / topbar**: `.glass-raised` with a bottom border `var(--glass-border-subtle)`. Contains breadcrumb, search input (also glass), and OTP badge.
- **Content area**: No background of its own — panels sit directly on the gradient canvas, separated by their glass surfaces.
- **Cards / stat panels**: `.glass` with `rounded-xl`. Use `.glass-raised` for modals or dropdown menus that float over other glass panels.
- **Data tables**: The table container uses `.glass`. Row hover uses `var(--glass-bg-hover)` via `backdrop-filter` on the row (not a solid fill). Column headers sit on `var(--glass-bg-raised)` with `var(--glass-border-subtle)` bottom border.
- **Modals / dialogs**: `.glass-heavy` (`backdrop-filter: blur(28px) saturate(160%)`), `rounded-2xl`, centered over a `rgba(0,0,0,0.5)` full-screen overlay.
- **Credential cards**: Glass card with credential name, type badge, masked value in mono, copy button, and reveal toggle. Badge backgrounds use semi-transparent accent colors, but primary call-to-action buttons use opaque liquid fills so they read clearly over the canvas.
- **Risk / sensitivity bars**: Horizontal bar indicator for credential sensitivity — color-coded using `--risk-*` tokens. Bar track is `var(--glass-bg-raised)`.
- **Inputs / search fields**: Glass treatment — `background: var(--glass-bg-raised)`, `border: 1px solid var(--glass-border)`, `backdrop-filter: var(--glass-blur)`. Focus state: border shifts to `var(--accent-primary)` at about `0.5` opacity and the field brightens slightly.
- **Buttons**: Primary button — opaque liquid fill using `liquid-button` with a brighter border and subtle inner highlight. Ghost/icon buttons — opaque `liquid-chip` surfaces, not transparent glass.

## Glassmorphism Rules

These rules must be followed to maintain visual consistency:

1. **Never use solid opaque fills on panels, sidebars, cards, or the topbar.** Every surface that sits on the canvas must stay liquid and translucent.
2. **All 5 liquid effects are required on every glass surface.** Missing any one makes the surface look synthetic: Frost (backdrop-filter blur+saturate+brightness), Splay (two radial gradient light catches), Refraction (inset top-edge highlight), Depression (inset bottom-edge shadow), Depth (external layered drop shadows).
3. **Use dark navy bases, not white-tinted bases.** `rgba(18,24,46,…)` not `rgba(255,255,255,…)`. White-tinted bases produce grey panels — the white shimmer comes from the splay gradient, not the base color.
4. **The gradient canvas must always be visible through panels.** If a component looks flat or solid, its backdrop-filter blur is missing or the base opacity is too high.
5. **Backdrop-filter is required on all glass elements.** Without it, the glass effect is broken — the panel just looks like a semi-transparent colored div with no blur.
6. **Borders must be hairline and light.** Use `1px solid rgba(255,255,255,0.08–0.16)` — never a dark border or a thick border on glass surfaces.
7. **Accent colors are not muted away.** Badges, active states, and primary buttons use bright opaque liquid surfaces, not low-contrast glass.
8. **Test backdrop-filter support.** Use `@supports (backdrop-filter: blur(1px))` and provide a slightly more opaque fallback (`rgba(10,14,30,0.92)`) for browsers that don't support it.

```css
@supports not (backdrop-filter: blur(1px)) {
  .glass,
  .glass-raised,
  .glass-heavy {
    background: rgba(10, 14, 30, 0.88);
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
