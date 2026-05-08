"use client";

import {
  CaretDown,
  Copy,
  CalendarBlank,
  Tag,
} from "@phosphor-icons/react/dist/ssr";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  credentialTypeConfig,
  type MockCredential,
} from "@/app/(app)/projects/mock-data";

const environmentLabel = {
  production: "Production",
  development: "Development",
  staging: "Staging",
  shared: "Shared",
} as const;

const environmentBadgeClass = {
  production:
    "border-[rgba(244,68,56,0.30)] bg-[rgba(244,68,56,0.08)] text-[var(--state-error)]",
  development:
    "border-[rgba(45,212,191,0.30)] bg-[rgba(45,212,191,0.08)] text-(--accent-teal)",
  staging:
    "border-[rgba(245,166,35,0.30)] bg-[rgba(245,166,35,0.08)] text-(--accent-amber)",
  shared:
    "border-[rgba(255,255,255,0.16)] bg-[rgba(255,255,255,0.08)] text-(--text-subtle)",
} as const;

type CredentialEnvironment = keyof typeof environmentLabel;

interface CredentialGroup {
  environment: CredentialEnvironment;
  items: MockCredential[];
}

interface ProjectCredentialsAccordionProps {
  groups: CredentialGroup[];
}

export function ProjectCredentialsAccordion({
  groups,
}: ProjectCredentialsAccordionProps) {
  const [openEnvironment, setOpenEnvironment] =
    useState<CredentialEnvironment | null>(groups[0]?.environment ?? null);

  return (
    <div className="space-y-3 p-5">
      {groups.map((group) => {
        const isOpen = openEnvironment === group.environment;
        const groupLabel = environmentLabel[group.environment];
        const groupBadgeClass = environmentBadgeClass[group.environment];

        return (
          <div
            key={group.environment}
            className="glass rounded-2xl overflow-hidden"
          >
            <button
              type="button"
              onClick={() =>
                setOpenEnvironment(isOpen ? null : group.environment)
              }
              className="flex w-full items-center justify-between gap-4 px-4 py-3 text-left transition-colors hover:bg-(--glass-bg-hover)"
              aria-expanded={isOpen}
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-8 items-center justify-center rounded-lg border border-(--glass-border-subtle) bg-[rgba(255,255,255,0.05)] text-(--text-primary)">
                  <CaretDown
                    weight="duotone"
                    size={14}
                    className={cn(
                      "transition-transform duration-200",
                      isOpen && "rotate-180",
                    )}
                  />
                </span>

                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.18em] text-(--text-primary)">
                      {groupLabel}
                    </h3>
                    <Badge
                      variant="outline"
                      className={cn("text-[10px] px-1.5 py-0", groupBadgeClass)}
                    >
                      {group.items.length} credentials
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs text-(--text-muted)">
                    Click to {isOpen ? "collapse" : "expand"} this environment
                    group.
                  </p>
                </div>
              </div>

              <span className="text-xs text-(--text-subtle)">
                {isOpen ? "Collapse" : "Expand"}
              </span>
            </button>

            {isOpen ? (
              <div className="border-t border-(--glass-border-subtle) p-4">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {group.items.map((credential) => {
                    const type = credentialTypeConfig[credential.type];
                    const TypeIcon = type.icon;

                    return (
                      <div
                        key={`${credential.name}-${credential.type}`}
                        className="glass rounded-2xl p-4 transition-colors hover:glass-raised"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={cn(
                                "flex size-10 items-center justify-center rounded-xl",
                                type.iconBgClass,
                              )}
                            >
                              <TypeIcon
                                weight="duotone"
                                size={18}
                                color={type.iconColor}
                              />
                            </div>
                            <div>
                              <p className="text-sm font-semibold text-(--text-primary)">
                                {credential.name}
                              </p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={cn(
                                    "text-[10px] px-1.5 py-0",
                                    type.badgeClass,
                                  )}
                                >
                                  {credential.type}
                                </Badge>
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8 rounded-lg"
                          >
                            <Copy weight="duotone" size={14} />
                          </Button>
                        </div>

                        <div className="mt-4 rounded-xl border border-(--glass-border-subtle) bg-[rgba(255,255,255,0.03)] px-3 py-2 font-mono text-sm text-(--text-primary)">
                          {credential.maskedValue}
                        </div>

                        <p className="mt-3 text-sm text-(--text-muted)">
                          {credential.description}
                        </p>

                        <div className="mt-4 flex flex-wrap items-center gap-2 text-[10px] text-(--text-muted)">
                          {Array.isArray(credential.tags) && credential.tags.length > 0 && (
                            <span className="inline-flex items-center gap-1 rounded-full border border-(--glass-border-subtle) px-2 py-1">
                              <Tag weight="duotone" size={12} />
                              {credential.tags.join(", ")}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 rounded-full border border-(--glass-border-subtle) px-2 py-1">
                            <CalendarBlank weight="duotone" size={12} />
                            Updated {credential.updated}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
