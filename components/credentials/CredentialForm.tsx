"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Plus,
  Trash,
  Eye,
  EyeSlash,
  Terminal,
  Warning,
  CaretDown,
  FolderLock,
  Globe,
  Flask,
  Code,
  Users,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { parseDotEnv } from "./parseDotEnv";
import type { CredentialWithProject } from "@/types/credential";

const MAX_FIELDS = 200;

const fieldSchema = z.object({
  key: z.string().min(1, "Key is required").max(200),
  value: z.string().max(10000),
  secret: z.boolean(),
});

const ENVIRONMENTS = [
  "production",
  "staging",
  "development",
  "shared",
] as const;
type Environment = (typeof ENVIRONMENTS)[number];

const ENV_CONFIG: Record<
  Environment,
  { label: string; icon: React.ElementType; iconColor: string }
> = {
  production: {
    label: "Production",
    icon: Globe,
    iconColor: "var(--state-error)",
  },
  staging: { label: "Staging", icon: Flask, iconColor: "var(--accent-amber)" },
  development: {
    label: "Development",
    icon: Code,
    iconColor: "var(--state-success)",
  },
  shared: { label: "Shared", icon: Users, iconColor: "var(--accent-primary)" },
};

const formSchema = z.object({
  name: z.string().min(1, "Credential name is required").max(120),
  environment: z.enum(ENVIRONMENTS),
  projectId: z.string(),
  fields: z
    .array(fieldSchema)
    .min(1, "At least one field is required")
    .max(MAX_FIELDS),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateProps {
  mode: "create";
  projectId: string;
  projectName: string;
  returnUrl?: string;
}

interface EditProps {
  mode: "edit";
  credential: CredentialWithProject;
  initialFields: Array<{
    key: string;
    value: string;
    secret: boolean;
    decryptionFailed?: boolean;
  }>;
  returnUrl?: string;
}

type Props = CreateProps | EditProps;

export function CredentialForm(props: Props) {
  const router = useRouter();
  const isEdit = props.mode === "edit";
  const returnUrl = props.returnUrl ?? "/projects";

  const projectId = isEdit
    ? (props as EditProps).credential.projectId
    : (props as CreateProps).projectId;
  const projectName = isEdit
    ? (props as EditProps).credential.project.name
    : (props as CreateProps).projectName;

  const {
    control,
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: isEdit
      ? {
          name: (props as EditProps).credential.name,
          environment: (props as EditProps).credential
            .environment as Environment,
          projectId,
          fields:
            (props as EditProps).initialFields.length > 0
              ? (props as EditProps).initialFields.map(
                  ({ key, value, secret }) => ({ key, value, secret }),
                )
              : [{ key: "", value: "", secret: true }],
        }
      : {
          name: "",
          environment: "development",
          projectId,
          fields: [{ key: "", value: "", secret: true }],
        },
  });

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "fields",
  });

  const [visibleValues, setVisibleValues] = useState<Set<number>>(new Set());
  const [pasteOpen, setPasteOpen] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [pasteWarning, setPasteWarning] = useState<string | null>(null);

  const currentEnv = watch("environment");

  function toggleSecretVisibility(idx: number) {
    setVisibleValues((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  }

  const handleEnvPaste = useCallback(
    (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
      const text = e.clipboardData.getData("text");
      if (!text) return;
      const parsed = parseDotEnv(text);
      if (parsed.length === 0) return;
      if (parsed.length > MAX_FIELDS) {
        setPasteWarning(`Only the first ${MAX_FIELDS} fields were imported.`);
        replace(
          parsed
            .slice(0, MAX_FIELDS)
            .map((p) => ({ key: p.key, value: p.value, secret: false })),
        );
      } else {
        setPasteWarning(null);
        replace(
          parsed.map((p) => ({ key: p.key, value: p.value, secret: false })),
        );
      }
      setPasteText("");
      setPasteOpen(false);
      e.preventDefault();
    },
    [replace],
  );

  async function onSubmit(data: FormValues) {
    try {
      if (isEdit) {
        const credential = (props as EditProps).credential;
        const res = await fetch(`/api/credentials/${credential.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: data.name,
            environment: data.environment,
            fields: data.fields.map((f) => ({
              key: f.key,
              value: f.value,
              secret: f.secret ?? true,
            })),
          }),
        });
        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(
            json?.error?.message ?? "Failed to update credential",
          );
        }
        toast.success("Changes saved");
      } else {
        const res = await fetch("/api/credentials", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...data,
            fields: data.fields.map((f) => ({
              key: f.key,
              value: f.value,
              secret: f.secret ?? true,
            })),
          }),
        });
        if (!res.ok) {
          const json = (await res.json().catch(() => null)) as {
            error?: { message?: string };
          } | null;
          throw new Error(
            json?.error?.message ?? "Failed to create credential",
          );
        }
        toast.success("Credential created");
      }
      router.push(returnUrl);
      router.refresh();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Something went wrong");
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Project context chip */}
      <div className="flex items-center gap-2 px-1">
        <FolderLock weight="duotone" size={13} color="var(--text-muted)" />
        <span className="text-xs text-(--text-muted)">{projectName}</span>
      </div>

      {/* Single card: name/env + fields */}
      <div className="glass rounded-xl overflow-hidden">
        {/* Name + Environment row */}
        <div className="flex gap-4 items-start px-5 py-4 border-b border-(--glass-border-subtle)">
          <div className="flex-1 space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Name <span className="text-(--state-error)">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. AWS Production Keys"
              className="glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent"
            />
            {errors.name && (
              <p className="text-xs text-(--state-error)">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Environment
            </label>
            <Select
              value={currentEnv}
              onValueChange={(v: Environment) =>
                setValue("environment", v, { shouldValidate: true })
              }
            >
              <SelectTrigger className="glass rounded-lg border-(--glass-border) text-(--text-primary) focus:ring-[rgba(77,142,255,0.4)] focus:border-(--accent-primary) bg-transparent w-40">
                <SelectValue placeholder="Environment" />
              </SelectTrigger>
              <SelectContent className="panel-dropdown">
                {(
                  Object.entries(ENV_CONFIG) as [
                    Environment,
                    {
                      label: string;
                      icon: React.ElementType;
                      iconColor: string;
                    },
                  ][]
                ).map(([val, cfg]) => (
                  <SelectItem
                    key={val}
                    value={val}
                    className="focus:bg-(--glass-bg-hover) text-(--text-primary)"
                  >
                    <span className="flex items-center gap-2">
                      <cfg.icon
                        weight="duotone"
                        size={12}
                        color={cfg.iconColor}
                      />
                      {cfg.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.environment && (
              <p className="text-xs text-(--state-error)">
                {errors.environment.message}
              </p>
            )}
          </div>
        </div>

        {/* Fields header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-(--glass-border-subtle)">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-(--text-subtle) uppercase tracking-wider">
              Fields
            </span>
            <span className="text-[10px] text-(--text-muted) bg-(--glass-bg-raised) border border-(--glass-border-subtle) rounded px-1.5 py-0.5">
              {fields.length}/{MAX_FIELDS}
            </span>
          </div>

          {/* Paste .env toggle */}
          <button
            type="button"
            onClick={() => setPasteOpen((v) => !v)}
            className={cn(
              "flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-lg border transition-colors",
              pasteOpen
                ? "bg-[rgba(77,142,255,0.14)] border-(--accent-primary) text-(--accent-primary)"
                : "bg-(--glass-bg-raised) border-(--glass-border-subtle) text-(--text-subtle) hover:text-(--text-primary)",
            )}
          >
            <Terminal weight="duotone" size={12} />
            Paste .env
            <CaretDown
              weight="duotone"
              size={10}
              className={cn("transition-transform", pasteOpen && "rotate-180")}
            />
          </button>
        </div>

        {/* Paste area (collapsible) */}
        {pasteOpen && (
          <div className="px-5 py-3 border-b border-(--glass-border-subtle) bg-[rgba(77,142,255,0.04)] space-y-2">
            <textarea
              className={cn(
                "w-full rounded-lg px-3 py-2 text-xs font-mono resize-none",
                "glass border border-(--glass-border) bg-transparent text-(--text-primary)",
                "placeholder:text-(--text-muted) focus:outline-none focus:ring-2 focus:ring-[rgba(77,142,255,0.4)] focus:border-(--accent-primary)",
                "transition-colors",
              )}
              placeholder={
                "DATABASE_URL=postgres://...\nAPI_KEY=sk-...\nSECRET=abc123"
              }
              rows={4}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              onPaste={handleEnvPaste}
            />
            {pasteWarning && (
              <div className="flex items-center gap-1.5 text-xs text-(--accent-amber)">
                <Warning weight="duotone" size={12} />
                {pasteWarning}
              </div>
            )}
            <p className="text-[10px] text-(--text-muted)">
              Paste your .env file — existing fields will be replaced
              automatically.
            </p>
          </div>
        )}

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_32px] gap-2 px-5 py-2 border-b border-(--glass-border-subtle)">
          <span className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Key
          </span>
          <span className="text-[10px] font-semibold text-(--text-muted) uppercase tracking-wider">
            Value
          </span>
          <span />
        </div>

        {/* Field rows */}
        <div className="divide-y divide-(--glass-border-subtle)">
          {fields.map((field, idx) => {
            const isVisible = visibleValues.has(idx);
            const decryptionFailed = isEdit
              ? (props as EditProps).initialFields?.[idx]?.decryptionFailed
              : false;
            return (
              <div
                key={field.id}
                className="grid grid-cols-[1fr_1fr_32px] gap-2 items-center px-5 py-2.5 hover:bg-(--glass-bg-hover) transition-colors"
              >
                <Input
                  {...register(`fields.${idx}.key`)}
                  placeholder="KEY_NAME"
                  className="h-8 glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) font-mono text-xs placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)"
                />
                <div className="relative">
                  <Input
                    {...register(`fields.${idx}.value`)}
                    type={isVisible ? "text" : "password"}
                    placeholder="value"
                    className="h-8 glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) font-mono text-xs placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) pr-7"
                  />
                  {decryptionFailed && (
                    <div
                      title="Decryption failed for this field"
                      className="absolute left-0 top-0 mt-1 ml-2 text-amber-500"
                    >
                      <Warning weight="duotone" size={14} />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleSecretVisibility(idx)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  >
                    {isVisible ? (
                      <EyeSlash weight="duotone" size={11} />
                    ) : (
                      <Eye weight="duotone" size={11} />
                    )}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => remove(idx)}
                  disabled={fields.length === 1}
                  className="w-8 h-8 rounded-lg flex items-center justify-center border-transparent text-(--text-muted) hover:text-(--state-error) hover:bg-[rgba(240,68,56,0.08)] disabled:opacity-20 disabled:cursor-not-allowed transition-colors"
                >
                  <Trash weight="duotone" size={12} />
                </button>
              </div>
            );
          })}
        </div>

        {/* Add field */}
        <div className="px-5 py-3 border-t border-(--glass-border-subtle)">
          {errors.fields?.root?.message && (
            <p className="text-xs text-(--state-error) mb-2">
              {errors.fields.root.message}
            </p>
          )}
          <button
            type="button"
            onClick={() => append({ key: "", value: "", secret: true })}
            disabled={fields.length >= MAX_FIELDS}
            className="flex items-center gap-1.5 text-xs text-(--text-muted) hover:text-(--accent-primary) disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <Plus weight="duotone" size={13} />
            Add field
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 pt-1">
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-(--button-liquid-bg) hover:bg-(--button-liquid-bg-hover) border border-(--button-liquid-border) text-(--text-primary)"
        >
          {isSubmitting
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Create credential"}
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
          className="text-(--text-subtle) hover:text-(--text-primary)"
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
