export interface MockMember {
  initials: string;
  gradientFrom: string;
  gradientTo: string;
}

export interface Division {
  id: string;
  name: string;
  iconBgClass: string;
  iconColor: string;
  accentBarClass: string;
  accentColor: "primary" | "teal" | "amber" | "purple";
  memberCount: number;
  members: MockMember[];
}

export const DIVISIONS_STORAGE_KEY = "otter.divisions";
export const ACTIVE_DIVISION_STORAGE_KEY = "otter.activeDivisionId";
export const DIVISION_CONTEXT_EVENT = "otter-division-context-change";

export const DEFAULT_DIVISIONS: Division[] = [
  {
    id: "qa",
    name: "QA Division",
    iconBgClass: "bg-[rgba(77,142,255,0.12)]",
    iconColor: "var(--accent-primary)",
    accentBarClass: "bg-(--accent-primary)",
    accentColor: "primary",
    memberCount: 6,
    members: [
      {
        initials: "BS",
        gradientFrom: "from-(--accent-primary)",
        gradientTo: "to-(--accent-teal)",
      },
      {
        initials: "RD",
        gradientFrom: "from-(--accent-teal)",
        gradientTo: "to-(--accent-purple)",
      },
      {
        initials: "AL",
        gradientFrom: "from-(--accent-amber)",
        gradientTo: "to-(--accent-primary)",
      },
      {
        initials: "DR",
        gradientFrom: "from-(--accent-purple)",
        gradientTo: "to-(--accent-primary)",
      },
    ],
  },
  {
    id: "dev",
    name: "Dev Division",
    iconBgClass: "bg-[rgba(45,212,191,0.12)]",
    iconColor: "var(--accent-teal)",
    accentBarClass: "bg-(--accent-teal)",
    accentColor: "teal",
    memberCount: 8,
    members: [
      {
        initials: "JK",
        gradientFrom: "from-(--accent-teal)",
        gradientTo: "to-(--accent-primary)",
      },
      {
        initials: "PR",
        gradientFrom: "from-(--accent-purple)",
        gradientTo: "to-(--accent-teal)",
      },
      {
        initials: "SN",
        gradientFrom: "from-(--accent-primary)",
        gradientTo: "to-(--accent-amber)",
      },
    ],
  },
  {
    id: "devops",
    name: "DevOps",
    iconBgClass: "bg-[rgba(245,166,35,0.12)]",
    iconColor: "var(--accent-amber)",
    accentBarClass: "bg-(--accent-amber)",
    accentColor: "amber",
    memberCount: 4,
    members: [
      {
        initials: "DW",
        gradientFrom: "from-(--accent-amber)",
        gradientTo: "to-(--accent-teal)",
      },
      {
        initials: "FK",
        gradientFrom: "from-(--accent-primary)",
        gradientTo: "to-(--accent-purple)",
      },
    ],
  },
];

export function safeParseDivisions(raw: string | null): Division[] | null {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Division[];
    if (!Array.isArray(parsed) || parsed.length === 0) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getDivisionInitials(name: string) {
  const words = name.trim().split(/\s+/).filter(Boolean);
  if (words.length === 0) return "DV";
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return `${words[0][0] ?? "D"}${words[1][0] ?? "V"}`.toUpperCase();
}

export function createDivisionId(name: string) {
  const slug = name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return `${slug || "division"}-${Date.now().toString(36)}`;
}

export function getDivisionPalette(index: number) {
  const palettes: Array<{
    iconBgClass: string;
    iconColor: string;
    accentBarClass: string;
    accentColor: Division["accentColor"];
    gradientFrom: string;
    gradientTo: string;
  }> = [
    {
      iconBgClass: "bg-[rgba(77,142,255,0.12)]",
      iconColor: "var(--accent-primary)",
      accentBarClass: "bg-(--accent-primary)",
      accentColor: "primary",
      gradientFrom: "from-(--accent-primary)",
      gradientTo: "to-(--accent-teal)",
    },
    {
      iconBgClass: "bg-[rgba(45,212,191,0.12)]",
      iconColor: "var(--accent-teal)",
      accentBarClass: "bg-(--accent-teal)",
      accentColor: "teal",
      gradientFrom: "from-(--accent-teal)",
      gradientTo: "to-(--accent-purple)",
    },
    {
      iconBgClass: "bg-[rgba(245,166,35,0.12)]",
      iconColor: "var(--accent-amber)",
      accentBarClass: "bg-(--accent-amber)",
      accentColor: "amber",
      gradientFrom: "from-(--accent-amber)",
      gradientTo: "to-(--accent-primary)",
    },
  ];

  return palettes[index % palettes.length]!;
}
