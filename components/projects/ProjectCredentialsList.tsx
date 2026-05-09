"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Key, Plus } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { CredentialCard } from "@/components/credentials/CredentialCard";
import { DeleteCredentialDialog } from "@/components/credentials/DeleteCredentialDialog";
import type { CredentialWithProject, CredentialFieldWithValue } from "@/types/credential";

const ENV_ORDER = ["production", "staging", "development", "shared"] as const;
type Env = (typeof ENV_ORDER)[number];

const ENV_LABEL: Record<Env, string> = {
  production: "Production",
  staging: "Staging",
  development: "Development",
  shared: "Shared",
};

interface ProjectCredentialsListProps {
  projectId: string;
  initialCredentials: CredentialWithProject[];
  canEdit: boolean;
}

export function ProjectCredentialsList({
  projectId,
  initialCredentials,
  canEdit,
}: ProjectCredentialsListProps) {
  const router = useRouter();
  const [credentials, setCredentials] = useState(initialCredentials);
  const [deleteTarget, setDeleteTarget] = useState<CredentialWithProject | null>(null);
  const [revealedMap, setRevealedMap] = useState<Record<string, CredentialFieldWithValue[] | null>>({});
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (credentials.length === 0) return;

    const ids = credentials.map((c) => c.id);
    setLoadingIds(new Set(ids));

    Promise.allSettled(
      credentials.map(async (c) => {
        const res = await fetch(`/api/credentials/${c.id}/reveal`);
        if (!res.ok) return { id: c.id, fields: null };
        const json = await res.json();
        return { id: c.id, fields: json.data as CredentialFieldWithValue[] };
      }),
    ).then((results) => {
      const updates: Record<string, CredentialFieldWithValue[] | null> = {};
      const loadedIds = new Set<string>();
      for (const r of results) {
        if (r.status === "fulfilled") {
          updates[r.value.id] = r.value.fields;
          loadedIds.add(r.value.id);
        }
      }
      setRevealedMap(updates);
      setLoadingIds(new Set());
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const grouped = ENV_ORDER.reduce<Record<Env, CredentialWithProject[]>>(
    (acc, env) => {
      acc[env] = credentials.filter((c) => c.environment === env);
      return acc;
    },
    { production: [], staging: [], development: [], shared: [] },
  );

  const hasAny = credentials.length > 0;

  if (!hasAny) {
    return (
      <div className="p-10 flex flex-col items-center gap-3 text-center">
        <Key weight="duotone" size={32} color="var(--text-muted)" />
        <p className="text-sm font-semibold text-(--text-primary)">No credentials yet</p>
        <p className="text-xs text-(--text-muted)">
          Add credentials to this project to get started.
        </p>
        {canEdit && (
          <Button
            onClick={() => router.push(`/projects/${projectId}/credentials/new`)}
            className="mt-2 bg-(--button-liquid-bg) hover:bg-(--button-liquid-bg-hover) border border-(--button-liquid-border) text-(--text-primary)"
          >
            <Plus weight="duotone" size={14} className="mr-1.5" />
            Add credential
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="p-5 space-y-5">
      {ENV_ORDER.map((env) => {
        const group = grouped[env];
        if (group.length === 0) return null;
        return (
          <div key={env} className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-(--text-muted) px-1">
              {ENV_LABEL[env]}
            </p>
            <div className="space-y-2">
              {group.map((credential) => (
                <CredentialCard
                  key={credential.id}
                  credential={credential}
                  canEdit={canEdit}
                  onDelete={setDeleteTarget}
                  editUrl={`/projects/${projectId}/credentials/${credential.id}/edit`}
                  revealedFields={revealedMap[credential.id] ?? null}
                  loading={loadingIds.has(credential.id)}
                />
              ))}
            </div>
          </div>
        );
      })}

      {deleteTarget && (
        <DeleteCredentialDialog
          open={true}
          credentialName={deleteTarget.name}
          credentialId={deleteTarget.id}
          onClose={() => setDeleteTarget(null)}
          onDeleted={(id) => setCredentials((prev) => prev.filter((c) => c.id !== id))}
        />
      )}
    </div>
  );
}
