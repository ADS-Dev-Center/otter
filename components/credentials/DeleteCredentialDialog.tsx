"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface DeleteCredentialDialogProps {
  open: boolean;
  credentialName: string;
  credentialSlug: string;
  credentialId: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteCredentialDialog({
  open,
  credentialName,
  credentialSlug,
  credentialId,
  onClose,
  onDeleted,
}: DeleteCredentialDialogProps) {
  const [loading, setLoading] = useState(false);
  const [confirmSlug, setConfirmSlug] = useState("");
  const [error, setError] = useState("");

  function handleClose() {
    setConfirmSlug("");
    setError("");
    onClose();
  }

  async function handleDelete() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/credentials/${credentialId}`, {
        method: "DELETE",
      });
      if (!res.ok && res.status !== 204) {
        const json = await res.json().catch(() => null);
        throw new Error(json?.error?.message ?? "Failed to delete credential");
      }
      toast.success("Credential deleted");
      onDeleted(credentialId);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete credential");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
        <DialogHeader>
          <DialogTitle className="text-lg text-(--state-error)">Delete Credential</DialogTitle>
          <DialogDescription className="text-(--text-muted)">
            This will permanently remove{" "}
            <span className="font-semibold text-(--text-primary)">{credentialName}</span>{" "}
            and all its fields. This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-subtle)">
            Type{" "}
            <span className="font-semibold text-(--text-primary) font-mono">
              {credentialSlug}
            </span>{" "}
            to confirm
          </label>
          <Input
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && confirmSlug === credentialSlug) {
                void handleDelete();
              }
            }}
            placeholder={credentialSlug}
            className="glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)"
            autoFocus
          />
        </div>

        {error && (
          <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={handleClose}
            className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleDelete()}
            disabled={loading || confirmSlug !== credentialSlug}
            className="rounded-lg bg-(--state-error) hover:opacity-90 text-white disabled:opacity-40"
          >
            {loading ? "Deleting…" : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
