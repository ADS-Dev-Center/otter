"use client";

import { useEffect, useState } from "react";
import {
  BellRinging,
  Buildings,
  CheckCircle,
  Database,
  Fingerprint,
  GearSix,
  Key,
  LockKey,
  ShieldCheck,
  UserList,
  UsersThree,
  WarningCircle,
  Waveform,
} from "@phosphor-icons/react";
import {
  ACTIVE_DIVISION_STORAGE_KEY,
  DEFAULT_DIVISIONS,
  DIVISIONS_STORAGE_KEY,
  safeParseDivisions,
  type Division,
} from "@/lib/divisions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const [divisions, setDivisions] = useState<Division[]>(DEFAULT_DIVISIONS);
  const [activeDivisionId, setActiveDivisionId] = useState(
    DEFAULT_DIVISIONS[0]?.id ?? "qa",
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    const storedDivisions = safeParseDivisions(
      window.localStorage.getItem(DIVISIONS_STORAGE_KEY),
    );
    const nextDivisions = storedDivisions ?? DEFAULT_DIVISIONS;

    const storedActiveDivisionId = window.localStorage.getItem(
      ACTIVE_DIVISION_STORAGE_KEY,
    );

    setDivisions(nextDivisions);
    setActiveDivisionId(
      nextDivisions.some((division) => division.id === storedActiveDivisionId)
        ? (storedActiveDivisionId ?? nextDivisions[0]?.id ?? "qa")
        : (nextDivisions[0]?.id ?? "qa"),
    );
  }, []);

  const activeDivisionName =
    divisions.find((division) => division.id === activeDivisionId)?.name ??
    "No active division";

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-2.5">
          <GearSix weight="duotone" size={24} color="var(--accent-primary)" />
          <h1 className="text-2xl font-bold tracking-tight text-(--text-primary)">
            Settings
          </h1>
        </div>
        <p className="text-sm text-(--text-muted)">
          Configure security, division governance, credential policies, and operational controls for Otter.
        </p>
      </header>

      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="text-(--text-primary)">Workspace Context</CardTitle>
          <CardDescription className="text-(--text-muted)">
            Otter always scopes data to one active division at a time.
          </CardDescription>
          <CardAction>
            <Badge variant="secondary">Scoped Access</Badge>
          </CardAction>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-xs">
          <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2">
            <span className="text-(--text-muted)">Active division</span>
            <span className="font-semibold text-(--text-primary)">{activeDivisionName}</span>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2">
            <span className="text-(--text-muted)">Division memberships</span>
            <span className="font-semibold text-(--text-primary)">{divisions.length} divisions</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <ShieldCheck weight="duotone" size={18} color="var(--accent-primary)" />
              Security & Authentication
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Protect sessions and enforce MFA for all workspace access.
            </CardDescription>
            <CardAction>
              <Badge>Protected</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <Fingerprint weight="duotone" size={14} /> OTP enforcement
              </span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <LockKey weight="duotone" size={14} /> Session duration
              </span>
              <span className="font-medium text-(--text-primary)">8 hours</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <WarningCircle weight="duotone" size={14} /> Suspicious login alerts
              </span>
              <Badge variant="secondary">Active</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <Key weight="duotone" size={18} color="var(--accent-teal)" />
              Vault Policy
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Define credential handling and reveal policy for secure operations.
            </CardDescription>
            <CardAction>
              <Badge variant="secondary">AES-256-GCM</Badge>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Encryption at rest</span>
              <span className="font-medium text-(--text-primary)">Mandatory</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Reveal timeout</span>
              <span className="font-medium text-(--text-primary)">30 seconds</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Copy protection</span>
              <Badge variant="secondary">Enabled</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <Waveform weight="duotone" size={18} color="var(--accent-amber)" />
              Audit & Compliance
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Track credential access and changes across divisions.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Audit retention</span>
              <span className="font-medium text-(--text-primary)">180 days</span>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Reveal activity log</span>
              <Badge variant="secondary">On</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Export reports</span>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>

        <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-(--text-primary)">
              <BellRinging weight="duotone" size={18} color="var(--accent-purple)" />
              Notifications & Integrations
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Route operational events to your incident and collaboration tools.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-xs">
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <CheckCircle weight="duotone" size={14} color="var(--state-success)" />
                Clerk auth integration
              </span>
              <Badge variant="secondary">Connected</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="flex items-center gap-2 text-(--text-subtle)">
                <Database weight="duotone" size={14} />
                Prisma/Postgres health
              </span>
              <Badge variant="secondary">Healthy</Badge>
            </div>
            <div className="flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2">
              <span className="text-(--text-subtle)">Slack / Webhook alerts</span>
              <Badge variant="outline">Coming soon</Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass rounded-xl border-(--glass-border-subtle) bg-(--glass-bg)">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-(--text-primary)">
            <UserList weight="duotone" size={18} color="var(--accent-primary)" />
            Division Access Directory
          </CardTitle>
          <CardDescription className="text-(--text-muted)">
            Manage which division context is active and review membership footprint.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {divisions.map((division, index) => {
            const isActive = division.id === activeDivisionId;

            return (
              <div key={division.id} className="flex flex-col gap-3">
                <div
                  className={cn(
                    "flex items-center justify-between rounded-lg border border-(--glass-border-subtle) px-3 py-2.5",
                    isActive && "bg-(--glass-bg-active)",
                  )}
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-(--text-primary)">
                      {division.name}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-(--text-muted)">
                      <UsersThree weight="duotone" size={14} />
                      <span>{division.memberCount} members</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isActive && <Badge variant="secondary">Active</Badge>}
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-8 px-3 text-xs text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
                    >
                      Manage
                    </Button>
                  </div>
                </div>
                {index < divisions.length - 1 && (
                  <Separator className="bg-(--glass-border-subtle)" />
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
