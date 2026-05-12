import {
  Buildings,
  CopySimple,
  Eye,
  FolderLock,
  PencilSimple,
  PlusCircle,
  Trash,
  UsersThree,
} from "@phosphor-icons/react/dist/ssr";
import type { AuditAction } from "@/app/generated/prisma/enums";

type PhosphorIcon = React.ComponentType<{
  weight?: "thin" | "light" | "regular" | "bold" | "fill" | "duotone";
  size?: number | string;
  color?: string;
  className?: string;
}>;

export type ActionMeta = {
  label: string;
  verb: string;
  icon: PhosphorIcon;
  badgeClass: string;
  iconBg: string;
  iconColor: string;
};

export const ACTION_META: Record<AuditAction, ActionMeta> = {
  CREDENTIAL_VIEW: {
    label: "View",
    verb: "viewed",
    icon: Eye,
    badgeClass:
      "border-[rgba(77,142,255,0.2)] bg-[rgba(77,142,255,0.12)] text-(--accent-primary)",
    iconBg: "rgba(77,142,255,0.10)",
    iconColor: "var(--accent-primary)",
  },
  CREDENTIAL_COPY: {
    label: "Copy",
    verb: "copied",
    icon: CopySimple,
    badgeClass:
      "border-[rgba(154,170,196,0.18)] bg-[rgba(154,170,196,0.1)] text-(--text-subtle)",
    iconBg: "rgba(154,170,196,0.10)",
    iconColor: "var(--text-subtle)",
  },
  CREDENTIAL_CREATE: {
    label: "Create",
    verb: "created",
    icon: PlusCircle,
    badgeClass:
      "border-[rgba(18,183,106,0.2)] bg-[rgba(18,183,106,0.12)] text-(--state-success)",
    iconBg: "rgba(18,183,106,0.10)",
    iconColor: "var(--state-success)",
  },
  CREDENTIAL_UPDATE: {
    label: "Update",
    verb: "updated",
    icon: PencilSimple,
    badgeClass:
      "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  CREDENTIAL_DELETE: {
    label: "Delete",
    verb: "deleted",
    icon: Trash,
    badgeClass:
      "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.12)] text-(--state-error)",
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
  PROJECT_CREATE: {
    label: "New Project",
    verb: "created project",
    icon: FolderLock,
    badgeClass:
      "border-[rgba(18,183,106,0.2)] bg-[rgba(18,183,106,0.12)] text-(--state-success)",
    iconBg: "rgba(18,183,106,0.10)",
    iconColor: "var(--state-success)",
  },
  PROJECT_UPDATE: {
    label: "Edit Project",
    verb: "updated project",
    icon: PencilSimple,
    badgeClass:
      "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  PROJECT_DELETE: {
    label: "Del Project",
    verb: "deleted project",
    icon: Trash,
    badgeClass:
      "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.12)] text-(--state-error)",
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
  MEMBER_INVITE: {
    label: "Invite",
    verb: "invited",
    icon: UsersThree,
    badgeClass:
      "border-[rgba(45,212,191,0.2)] bg-[rgba(45,212,191,0.1)] text-(--accent-teal)",
    iconBg: "rgba(45,212,191,0.10)",
    iconColor: "var(--accent-teal)",
  },
  MEMBER_ROLE_CHANGE: {
    label: "Role Change",
    verb: "changed role in",
    icon: PencilSimple,
    badgeClass:
      "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  MEMBER_REMOVE: {
    label: "Remove",
    verb: "removed member from",
    icon: Trash,
    badgeClass:
      "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.12)] text-(--state-error)",
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
  DIVISION_CREATE: {
    label: "New Division",
    verb: "created division",
    icon: Buildings,
    badgeClass:
      "border-[rgba(139,92,246,0.2)] bg-[rgba(139,92,246,0.12)] text-(--accent-purple)",
    iconBg: "rgba(139,92,246,0.10)",
    iconColor: "var(--accent-purple)",
  },
  DIVISION_RENAME: {
    label: "Rename Div.",
    verb: "renamed",
    icon: PencilSimple,
    badgeClass:
      "border-[rgba(245,166,35,0.2)] bg-[rgba(245,166,35,0.12)] text-(--accent-amber)",
    iconBg: "rgba(245,166,35,0.10)",
    iconColor: "var(--accent-amber)",
  },
  DIVISION_DELETE: {
    label: "Del Division",
    verb: "deleted division",
    icon: Trash,
    badgeClass:
      "border-[rgba(240,68,56,0.2)] bg-[rgba(240,68,56,0.12)] text-(--state-error)",
    iconBg: "rgba(240,68,56,0.10)",
    iconColor: "var(--state-error)",
  },
};

export function relativeTime(date: Date | string): string {
  const diff = Date.now() - new Date(date).getTime();
  if (diff < 60_000) return "just now";
  if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
  if (diff < 86_400_000) return `${Math.floor(diff / 3_600_000)}h ago`;
  if (diff < 172_800_000) return "yesterday";
  return `${Math.floor(diff / 86_400_000)}d ago`;
}

export function formatAuditResourceName(
  action: AuditAction,
  resourceName: string,
) {
  if (
    action === "MEMBER_INVITE" &&
    (/^invite-\d+@(placeholder\.local|link)$/i.test(resourceName) ||
      resourceName === "invite-link" ||
      resourceName === "invite-link@otter.local")
  ) {
    return "Invite link";
  }

  return resourceName;
}
