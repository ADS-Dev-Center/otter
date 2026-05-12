"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Key,
  Eye,
  EyeSlash,
  Copy,
  PencilSimple,
  Trash,
  CheckCircle,
  CaretDown,
  CaretUp,
  Spinner,
} from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CredentialWithProject, CredentialFieldWithValue } from "@/types/credential";

const ENV_BADGE: Record<string, string> = {
  production: "bg-[rgba(240,68,56,0.12)] text-(--state-error) border-[rgba(240,68,56,0.3)]",
  staging: "bg-[rgba(245,166,35,0.12)] text-(--accent-amber) border-[rgba(245,166,35,0.3)]",
  development: "bg-[rgba(18,183,106,0.12)] text-(--state-success) border-[rgba(18,183,106,0.3)]",
  shared: "bg-[rgba(77,142,255,0.12)] text-(--accent-primary) border-[rgba(77,142,255,0.3)]",
};

interface CredentialCardProps {
  credential: CredentialWithProject;
  canEdit: boolean;
  onDelete: (credential: CredentialWithProject) => void;
  editUrl?: string;
  revealedFields: CredentialFieldWithValue[] | null;
  loading?: boolean;
}

export function CredentialCard({
  credential,
  canEdit,
  onDelete,
  editUrl,
  revealedFields,
  loading = false,
}: CredentialCardProps) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [visibleValues, setVisibleValues] = useState<Set<string>>(new Set());
  const [copiedId, setCopiedId] = useState<string | null>(null);

  function toggleValueVisibility(fieldId: string) {
    setVisibleValues((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) next.delete(fieldId);
      else next.add(fieldId);
      return next;
    });
  }

  async function copyValue(fieldId: string, value: string) {
    await navigator.clipboard.writeText(value);
    setCopiedId(fieldId);
    setTimeout(() => setCopiedId(null), 2000);
  }

  const badgeClass = ENV_BADGE[credential.environment] ?? ENV_BADGE.shared;

  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-3 p-4">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-(--glass-bg-raised) border border-(--glass-border-subtle) flex items-center justify-center">
          <Key weight="duotone" size={16} color="var(--accent-primary)" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="font-medium text-(--text-primary) truncate text-sm">{credential.name}</p>
          <p className="text-xs text-(--text-muted) truncate">{credential.project.name}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span
            className={cn(
              "text-[10px] font-medium px-2 py-0.5 rounded border uppercase tracking-wide",
              badgeClass,
            )}
          >
            {credential.environment}
          </span>
          <span className="text-xs text-(--text-muted)">
            {credential.fields.length} field{credential.fields.length !== 1 ? "s" : ""}
          </span>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setExpanded((v) => !v)}
            disabled={loading}
            className="h-8 px-2 text-(--text-subtle) hover:text-(--accent-primary)"
          >
            {loading ? (
              <Spinner weight="duotone" size={14} className="animate-spin" />
            ) : expanded ? (
              <CaretUp weight="duotone" size={14} />
            ) : (
              <CaretDown weight="duotone" size={14} />
            )}
          </Button>

          {canEdit && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(editUrl ?? `/credentials/${credential.id}/edit`)}
                className="h-8 w-8 p-0 text-(--text-subtle) hover:text-(--accent-primary)"
              >
                <PencilSimple weight="duotone" size={14} />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(credential)}
                className="h-8 w-8 p-0 text-(--text-subtle) hover:text-(--state-error)"
              >
                <Trash weight="duotone" size={14} />
              </Button>
            </>
          )}
        </div>
      </div>

      {expanded && revealedFields && (
        <div className="border-t border-(--glass-border-subtle) px-4 py-3 space-y-2">
          {revealedFields.map((field) => {
            const isVisible = visibleValues.has(field.id);
            const isCopied = copiedId === field.id;
            return (
              <div
                key={field.id}
                className="flex items-center gap-2 rounded-lg bg-(--glass-bg-raised) px-3 py-2"
              >
                <span className="text-xs font-mono text-(--text-subtle) w-36 shrink-0 truncate">
                  {field.key}
                </span>
                <span
                  className={cn(
                    "flex-1 text-xs font-mono text-(--text-primary) truncate",
                    !isVisible && "blur-[3px] select-none",
                  )}
                >
                  {field.value || <span className="text-(--text-muted) italic">empty</span>}
                </span>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleValueVisibility(field.id)}
                    className="p-1 text-(--text-muted) hover:text-(--text-primary) transition-colors"
                  >
                    {isVisible ? (
                      <EyeSlash weight="duotone" size={12} />
                    ) : (
                      <Eye weight="duotone" size={12} />
                    )}
                  </button>
                  <button
                    onClick={() => copyValue(field.id, field.value)}
                    className="p-1 text-(--text-muted) hover:text-(--accent-primary) transition-colors"
                  >
                    {isCopied ? (
                      <CheckCircle weight="duotone" size={12} color="var(--state-success)" />
                    ) : (
                      <Copy weight="duotone" size={12} />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
