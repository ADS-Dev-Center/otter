import {
  Fingerprint,
  GitBranch,
  Key,
  LinkSimple,
  Lock,
  Terminal,
} from "@phosphor-icons/react/dist/ssr";

export type ProjectStatus = "active" | "archived";

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

export const credentialTypeConfig = {
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
} as const;

export interface MockProject {
  id: string;
  name: string;
  division: string;
  divisionAccentBarClass: string;
  divisionIconBgClass: string;
  divisionIconColor: string;
  divisionBadgeClass: string;
  description: string;
  credentialCount: number;
  memberCount: number;
  lastUpdated: string;
  status: ProjectStatus;
}

export interface MockCredential {
  name: string;
  type: CredentialType;
  environment: CredentialEnvironment;
  maskedValue: string;
  description: string;
  tags: string[];
  updated: string;
}

export const mockProjects: MockProject[] = [
  {
    id: "api-staging",
    name: "LMS Platform",
    division: "QA Division",
    divisionAccentBarClass: "bg-(--accent-primary)",
    divisionIconBgClass: "bg-[rgba(77,142,255,0.12)]",
    divisionIconColor: "var(--accent-primary)",
    divisionBadgeClass:
      "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]",
    description:
      "Primary learning platform workspace used by QA for staging checks.",
    credentialCount: 9,
    memberCount: 3,
    lastUpdated: "2 min ago",
    status: "active",
  },
  {
    id: "api-production",
    name: "Billing Portal",
    division: "QA Division",
    divisionAccentBarClass: "bg-(--accent-primary)",
    divisionIconBgClass: "bg-[rgba(77,142,255,0.12)]",
    divisionIconColor: "var(--accent-primary)",
    divisionBadgeClass:
      "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]",
    description:
      "Billing and subscription portal for production release validation.",
    credentialCount: 6,
    memberCount: 3,
    lastUpdated: "1 hr ago",
    status: "active",
  },
  {
    id: "riot-games",
    name: "Tournament Dashboard",
    division: "QA Division",
    divisionAccentBarClass: "bg-(--accent-primary)",
    divisionIconBgClass: "bg-[rgba(77,142,255,0.12)]",
    divisionIconColor: "var(--accent-primary)",
    divisionBadgeClass:
      "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]",
    description: "Operational dashboard for event workflows and QA scenarios.",
    credentialCount: 12,
    memberCount: 4,
    lastUpdated: "3 hr ago",
    status: "active",
  },
  {
    id: "mobile-staging",
    name: "Mobile App QA",
    division: "QA Division",
    divisionAccentBarClass: "bg-(--accent-primary)",
    divisionIconBgClass: "bg-[rgba(77,142,255,0.12)]",
    divisionIconColor: "var(--accent-primary)",
    divisionBadgeClass:
      "border-[rgba(77,142,255,0.3)] text-(--accent-primary) bg-[rgba(77,142,255,0.08)]",
    description:
      "Mobile validation workspace for staging and test flight builds.",
    credentialCount: 3,
    memberCount: 2,
    lastUpdated: "Yesterday",
    status: "active",
  },
  {
    id: "frontend-env",
    name: "Marketing Website",
    division: "Dev Division",
    divisionAccentBarClass: "bg-(--accent-teal)",
    divisionIconBgClass: "bg-[rgba(45,212,191,0.12)]",
    divisionIconColor: "var(--accent-teal)",
    divisionBadgeClass:
      "border-[rgba(45,212,191,0.3)] text-(--accent-teal) bg-[rgba(45,212,191,0.08)]",
    description:
      "Public website workspace for marketing and content release checks.",
    credentialCount: 4,
    memberCount: 2,
    lastUpdated: "Yesterday",
    status: "active",
  },
  {
    id: "backend-services",
    name: "Internal Admin API",
    division: "Dev Division",
    divisionAccentBarClass: "bg-(--accent-teal)",
    divisionIconBgClass: "bg-[rgba(45,212,191,0.12)]",
    divisionIconColor: "var(--accent-teal)",
    divisionBadgeClass:
      "border-[rgba(45,212,191,0.3)] text-(--accent-teal) bg-[rgba(45,212,191,0.08)]",
    description: "Internal platform services used by the operations team.",
    credentialCount: 11,
    memberCount: 5,
    lastUpdated: "2 days ago",
    status: "active",
  },
  {
    id: "cicd-secrets",
    name: "Release Pipeline",
    division: "DevOps",
    divisionAccentBarClass: "bg-(--accent-amber)",
    divisionIconBgClass: "bg-[rgba(245,166,35,0.12)]",
    divisionIconColor: "var(--accent-amber)",
    divisionBadgeClass:
      "border-[rgba(245,166,35,0.3)] text-(--accent-amber) bg-[rgba(245,166,35,0.08)]",
    description:
      "Deployment workspace for builds, releases, and registry checks.",
    credentialCount: 7,
    memberCount: 3,
    lastUpdated: "5 hr ago",
    status: "active",
  },
  {
    id: "infrastructure",
    name: "Infra Control Center",
    division: "DevOps",
    divisionAccentBarClass: "bg-(--accent-amber)",
    divisionIconBgClass: "bg-[rgba(245,166,35,0.12)]",
    divisionIconColor: "var(--accent-amber)",
    divisionBadgeClass:
      "border-[rgba(245,166,35,0.3)] text-(--accent-amber) bg-[rgba(245,166,35,0.08)]",
    description:
      "Operations workspace for infrastructure access and maintenance tasks.",
    credentialCount: 8,
    memberCount: 4,
    lastUpdated: "3 days ago",
    status: "active",
  },
];

const credentialLists: Record<string, MockCredential[]> = {
  "api-staging": [
    {
      name: "STAGING_API_URL",
      type: "URL",
      environment: "staging",
      maskedValue: "https://staging-api.otter.dev/••••",
      description: "Staging base endpoint for QA smoke and regression tests.",
      tags: ["endpoint", "staging", "qa"],
      updated: "2 min ago",
    },
    {
      name: "DB_PASSWORD_STG",
      type: "Password",
      environment: "staging",
      maskedValue: "••••••••••••••••••••",
      description: "Database password used by the staging application stack.",
      tags: ["database", "secret", "staging"],
      updated: "11 min ago",
    },
    {
      name: "SESSION_TOKEN",
      type: "Token",
      environment: "production",
      maskedValue: "tok_••••••••••••••••••••",
      description:
        "Short-lived session token for production validation checks.",
      tags: ["token", "prod", "session"],
      updated: "1 hr ago",
    },
  ],
  "api-production": [
    {
      name: "PROD_API_URL",
      type: "URL",
      environment: "production",
      maskedValue: "https://api.otter.dev/••••",
      description: "Primary production endpoint for API consumers.",
      tags: ["endpoint", "prod", "api"],
      updated: "5 min ago",
    },
    {
      name: "CLERK_SECRET_KEY",
      type: "API Key",
      environment: "production",
      maskedValue: "sk_live_••••••••••••••••",
      description: "Backend secret used to validate production auth flows.",
      tags: ["auth", "backend", "prod"],
      updated: "18 min ago",
    },
  ],
  "frontend-env": [
    {
      name: "VITE_PUBLIC_API_BASE",
      type: "Env Var",
      environment: "development",
      maskedValue: "VITE_PUBLIC_API_BASE=https://••••",
      description: "Public runtime variable consumed by the web client bundle.",
      tags: ["env", "frontend", "build"],
      updated: "Yesterday",
    },
    {
      name: "CLERK_PUBLISHABLE_KEY",
      type: "API Key",
      environment: "development",
      maskedValue: "pk_test_••••••••••••••••",
      description: "Client-side publishable key for authentication widgets.",
      tags: ["frontend", "auth", "client"],
      updated: "Yesterday",
    },
  ],
  "cicd-secrets": [
    {
      name: "DEPLOY_TOKEN",
      type: "Token",
      environment: "shared",
      maskedValue: "ghp_••••••••••••••••••••",
      description: "Token used by CI for release automation.",
      tags: ["deploy", "cicd", "release"],
      updated: "5 hr ago",
    },
    {
      name: "REGISTRY_PASSWORD",
      type: "Password",
      environment: "shared",
      maskedValue: "••••••••••••••••••••",
      description: "Container registry password for build pipelines.",
      tags: ["registry", "build", "pipeline"],
      updated: "6 hr ago",
    },
  ],
};

export function getProjectById(projectId: string) {
  return mockProjects.find((project) => project.id === projectId);
}

export function getProjectCredentials(projectId: string) {
  return credentialLists[projectId] ?? [];
}
