import {
  Fingerprint,
  GitBranch,
  Key,
  LinkSimple,
  Lock,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";
import type { Icon } from "@phosphor-icons/react";

export type CredentialType =
  | "URL"
  | "Password"
  | "API Key"
  | "Token"
  | "Env Var"
  | "SSH Key";

export type CredentialEnvironment =
  | "production"
  | "development"
  | "staging"
  | "shared";

export interface CredentialTypeConfig {
  icon: Icon;
  iconBgClass: string;
  iconColor: string;
  badgeClass: string;
  accentClass: string;
}

export const credentialTypeConfig: Record<CredentialType, CredentialTypeConfig> = {
  URL: {
    icon: LinkSimple,
    iconBgClass: "bg-[rgba(77,142,255,0.12)]",
    iconColor: "var(--accent-primary)",
    badgeClass:
      "border-[rgba(77,142,255,0.30)] bg-[rgba(77,142,255,0.08)] text-(--accent-primary)",
    accentClass: "bg-(--accent-primary)",
  },
  Password: {
    icon: Lock,
    iconBgClass: "bg-[rgba(244,68,56,0.12)]",
    iconColor: "var(--state-error)",
    badgeClass:
      "border-[rgba(244,68,56,0.30)] bg-[rgba(244,68,56,0.08)] text-[var(--state-error)]",
    accentClass: "bg-(--state-error)",
  },
  "API Key": {
    icon: Key,
    iconBgClass: "bg-[rgba(245,166,35,0.12)]",
    iconColor: "var(--accent-amber)",
    badgeClass:
      "border-[rgba(245,166,35,0.30)] bg-[rgba(245,166,35,0.08)] text-(--accent-amber)",
    accentClass: "bg-(--accent-amber)",
  },
  Token: {
    icon: Fingerprint,
    iconBgClass: "bg-[rgba(139,92,246,0.12)]",
    iconColor: "var(--accent-purple)",
    badgeClass:
      "border-[rgba(139,92,246,0.30)] bg-[rgba(139,92,246,0.08)] text-(--accent-purple)",
    accentClass: "bg-(--accent-purple)",
  },
  "Env Var": {
    icon: Terminal,
    iconBgClass: "bg-[rgba(45,212,191,0.12)]",
    iconColor: "var(--accent-teal)",
    badgeClass:
      "border-[rgba(45,212,191,0.30)] bg-[rgba(45,212,191,0.08)] text-(--accent-teal)",
    accentClass: "bg-(--accent-teal)",
  },
  "SSH Key": {
    icon: GitBranch,
    iconBgClass: "bg-[rgba(77,142,255,0.12)]",
    iconColor: "var(--accent-primary)",
    badgeClass:
      "border-[rgba(77,142,255,0.30)] bg-[rgba(77,142,255,0.08)] text-(--accent-primary)",
    accentClass: "bg-(--accent-primary)",
  },
};
