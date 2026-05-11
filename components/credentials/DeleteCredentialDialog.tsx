"use client";

import { toast } from "sonner";
import { DangerDialog } from "@/components/ui/danger-dialog";
import { deleteCredentialAction } from "@/app/actions/credentials";

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
  async function handleDelete() {
    const result = await deleteCredentialAction({ credentialId });
    if (!result.ok) {
      throw new Error(result.error.message ?? "Failed to delete credential");
    }
    onDeleted(credentialId);
    toast.success("Credential deleted");
  }

  return (
    <DangerDialog
      open={open}
      onOpenChange={(v) => !v && onClose()}
      title="Delete Credential"
      description={`This will permanently remove "${credentialName}" and all its fields. This action cannot be undone.`}
      confirmText={credentialSlug}
      actionLabel="Delete"
      loadingLabel="Deleting…"
      onAction={handleDelete}
    />
  );
}
