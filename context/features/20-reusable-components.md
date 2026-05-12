## Goals

Eliminate repeated UI code by extracting common patterns into typed, reusable components.
Every form, dialog, and glass-surface in this project repeats the same Tailwind class strings
and structural patterns. This refactor consolidates them into a small set of primitives that
the rest of the codebase consumes instead of duplicating.

---

## What to build

### 1. `GlassInput` — `components/ui/glass-input.tsx`

A thin wrapper around shadcn `Input` that hardcodes the glass styling. It forwards all
native `input` props. No logic, just the className.

Glass className to bake in:
```
glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary)
placeholder:text-(--text-muted)
focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)
```

Callers never write this className again — they just use `<GlassInput />`.

---

### 2. `GlassTextarea` — `components/ui/glass-textarea.tsx`

Same idea as `GlassInput` but wraps shadcn `Textarea`. Bake in the same glass className plus
`resize-none`. Forward all native `textarea` props.

---

### 3. `GlassSelect` — `components/ui/glass-select.tsx`

Wraps shadcn `Select` + `SelectTrigger` + `SelectContent` + `SelectItem` into one compound
component. The trigger and content get glass styling baked in:

- Trigger: `glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) focus:ring-[rgba(77,142,255,0.4)] focus:border-(--accent-primary)`
- Content: `panel-dropdown`
- Item: `focus:bg-(--glass-bg-hover) text-(--text-primary)`

Props: `value`, `onValueChange`, `placeholder`, `options: { value: string; label: string; icon?: React.ElementType; iconColor?: string }[]`, `className?`

Callers pass `options` as data — no need to write `SelectItem` loops manually.

---

### 4. `FieldInput` — `components/ui/field-input.tsx`  ← The core piece

A single component that renders the correct input control based on a `FieldType` enum.
Uses a `switch` over `field.type` to pick which control to render.

#### FieldType enum

```ts
export enum FieldType {
  TEXT     = "text",
  PASSWORD = "password",
  TEXTAREA = "textarea",
  SELECT   = "select",
  MONO     = "mono",      // monospaced text — for keys, tokens, env var names
}
```

#### Field interface

```ts
export interface FieldDef {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;                            // only used when type === TEXTAREA
  options?: { value: string; label: string; icon?: React.ElementType; iconColor?: string }[];  // only used when type === SELECT
}
```

#### Component signature

```ts
interface FieldInputProps {
  field: FieldDef;
  // pass through react-hook-form registration and value control
  registration?: ReturnType<UseFormRegister<any>>;
  value?: string;
  onValueChange?: (value: string) => void;   // used for SELECT (controlled)
  error?: string;
  className?: string;
}
```

#### Switch case logic

```
switch (field.type) {
  case FieldType.TEXT:
    render <GlassInput type="text" ...registration placeholder={field.placeholder} />

  case FieldType.PASSWORD:
    render <GlassInput type="password" ...registration placeholder={field.placeholder} />
    with an eye/eye-slash toggle button inside (Phosphor Eye / EyeSlash, weight="duotone", size={14})
    toggle is local useState — no prop needed

  case FieldType.TEXTAREA:
    render <GlassTextarea ...registration rows={field.rows ?? 3} placeholder={field.placeholder} />

  case FieldType.SELECT:
    render <GlassSelect value={value} onValueChange={onValueChange} options={field.options ?? []} placeholder={field.placeholder} />

  case FieldType.MONO:
    render <GlassInput type="text" ...registration className="font-mono" placeholder={field.placeholder} />
}
```

The password eye-toggle is the only stateful logic inside `FieldInput`.

---

### 5. `FormField` — `components/ui/form-field.tsx`

Wraps the label + FieldInput + error message pattern that appears in every form.

```ts
interface FormFieldProps {
  field: FieldDef;
  registration?: ReturnType<UseFormRegister<any>>;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
}
```

Structure:
```
<div className="space-y-1.5 {className}">
  <label className="text-xs font-medium text-(--text-subtle)">
    {field.label}
    {field.required && <span className="text-(--state-error) ml-0.5">*</span>}
  </label>
  <FieldInput field={field} registration={registration} value={value} onValueChange={onValueChange} error={error} />
  {error && <p className="text-xs text-(--state-error)">{error}</p>}
</div>
```

Callers replace the entire label/input/error block with one `<FormField />`.

---

### 6. `GlassDialog` — `components/ui/glass-dialog.tsx`

A pre-styled dialog shell. Every dialog in this project uses:
`glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md`

Wraps shadcn `Dialog` + `DialogContent` + `DialogHeader` + `DialogTitle` + `DialogFooter`.

Props: `open`, `onOpenChange`, `title`, `maxWidth?: string` (default `sm:max-w-md`),
`children` (goes in the content body), `footer?: React.ReactNode`.

Callers never write the `glass-heavy` class string or `DialogHeader` boilerplate again.

---

### 7. `DangerDialog` — `components/ui/danger-dialog.tsx`

A specialized confirmation dialog for destructive actions (delete, revoke).
Built on top of shadcn `AlertDialog` with:
- Glass-heavy styling baked in
- A "type to confirm" input (uses `GlassInput`) when `confirmText` prop is provided
- A danger-red action button: `bg-[rgba(240,68,56,0.18)] border border-[rgba(240,68,56,0.36)] text-(--state-error) hover:bg-[rgba(240,68,56,0.28)]`
- Cancel button with glass styling

Props:
```ts
{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;          // if set, renders a "type X to confirm" input
  actionLabel?: string;          // default: "Delete"
  loadingLabel?: string;         // default: "Deleting…"
  onAction: () => Promise<void>;
}
```

Internal state: `confirmInput` (string) + `isActing` (boolean). The action button is
disabled unless `confirmInput === confirmText` (when confirmText is set) and not loading.

Replaces `DeleteProjectDialog` shell, `DeleteCredentialDialog` shell — callers only pass
the data and callback, not the chrome.

---

### 8. `FormActions` — `components/ui/form-actions.tsx`

The submit + cancel button pair used at the bottom of every form.

```ts
interface FormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel: string;
  onCancel: () => void;
  className?: string;
}
```

Structure:
```
<div className="flex items-center gap-3 pt-1 {className}">
  <Button type="submit" disabled={isSubmitting}
    className="bg-(--button-liquid-bg) hover:bg-(--button-liquid-bg-hover) border border-(--button-liquid-border) text-(--text-primary)">
    {isSubmitting ? loadingLabel : submitLabel}
  </Button>
  <Button type="button" variant="ghost" onClick={onCancel}
    className="text-(--text-subtle) hover:text-(--text-primary)">
    Cancel
  </Button>
</div>
```

---

## Refactor rules

1. After creating each primitive, scan every `.tsx` file in `components/` and `app/` for usage of the raw className pattern that primitive replaces. Update those files to use the new component.

2. Never modify `components/ui/` shadcn primitives (`input.tsx`, `dialog.tsx`, etc.) — the new components wrap them.

3. New components live in `components/ui/` alongside shadcn primitives. Name them with the `Glass*`, `Field*`, `Form*`, or `Danger*` prefixes so they are visually distinct from raw shadcn in import lists.

4. `FieldType` enum and `FieldDef` interface are exported from `components/ui/field-input.tsx` and imported wherever a field definition is needed. Do not duplicate the enum.

5. `FormField` always uses `FieldInput` internally. Callers never use `FieldInput` directly — they always go through `FormField` (which includes the label + error wrapping).

6. `GlassDialog` is for create/edit flows. `DangerDialog` is for destructive confirmation flows. Do not use `GlassDialog` for deletes.

7. Keep each primitive file under ~80 lines. If it grows beyond that, question whether it is still single-purpose.

8. All new components must be `"use client"` only if they contain state or event handlers. `GlassInput`, `GlassTextarea` are pure wrappers — no `"use client"` needed unless the consumer requires it.

---

## When is done

- [ ] `GlassInput`, `GlassTextarea`, `GlassSelect` exist and export a single component each
- [ ] `FieldType` enum covers all five types: TEXT, PASSWORD, TEXTAREA, SELECT, MONO
- [ ] `FieldInput` renders the correct control for each `FieldType` using switch case
- [ ] `FormField` composes label + `FieldInput` + error in one component
- [ ] `GlassDialog` replaces raw `DialogContent` glass setup in all create/edit dialogs
- [ ] `DangerDialog` replaces `DeleteProjectDialog` and `DeleteCredentialDialog` shells
- [ ] `FormActions` replaces inline submit/cancel button pairs in all forms
- [ ] Zero occurrences of the raw glass input className string (`glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted)`) remain outside of `glass-input.tsx` itself
- [ ] All existing behavior is preserved — no functional regressions
- [ ] TypeScript strict mode passes with no new errors
