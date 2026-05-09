"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeleteCredentialDialogProps {
  open: boolean;
  credentialName: string;
  credentialId: string;
  onClose: () => void;
  onDeleted: (id: string) => void;
}

export function DeleteCredentialDialog({
  open,
  credentialName,
  credentialId,
  onClose,
  onDeleted,
}: DeleteCredentialDialogProps) {
  const [loading, setLoading] = useState(false);

  async function handleDelete() {
    setLoading(true);
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
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete credential");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && onClose()}>
      <AlertDialogContent className="glass-heavy rounded-2xl border-[rgba(255,255,255,0.16)]">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-(--text-primary)">
            Delete credential?
          </AlertDialogTitle>
          <AlertDialogDescription className="text-(--text-subtle)">
            <span className="font-medium text-(--text-primary)">{credentialName}</span> and all
            its fields will be permanently deleted. This cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={onClose}
            className="bg-(--glass-bg-raised) border-[rgba(255,255,255,0.12)] text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
          >
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-[rgba(240,68,56,0.2)] border-[rgba(240,68,56,0.4)] text-(--state-error) hover:bg-[rgba(240,68,56,0.32)]"
          >
            {loading ? "Deleting…" : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
