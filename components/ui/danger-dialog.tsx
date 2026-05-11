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
import { GlassInput } from "./glass-input";

interface DangerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmText?: string;
  actionLabel?: string;
  loadingLabel?: string;
  onAction: () => Promise<void>;
}

function DangerDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  actionLabel = "Delete",
  loadingLabel = "Deleting…",
  onAction,
}: DangerDialogProps) {
  const [confirmInput, setConfirmInput] = useState("");
  const [isActing, setIsActing] = useState(false);
  const [error, setError] = useState("");

  function handleOpenChange(open: boolean) {
    if (!open) {
      setConfirmInput("");
      setError("");
    }
    onOpenChange(open);
  }

  async function handleAction() {
    setIsActing(true);
    setError("");
    try {
      await onAction();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsActing(false);
    }
  }

  const canAct = confirmText ? confirmInput === confirmText : true;

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent className="glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-(--text-primary)">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-(--text-muted)">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {confirmText && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Type{" "}
              <span className="font-semibold text-(--text-primary) font-mono">
                {confirmText}
              </span>{" "}
              to confirm
            </label>
            <GlassInput
              value={confirmInput}
              onChange={(e) => setConfirmInput(e.target.value)}
              placeholder={confirmText}
              autoFocus
            />
          </div>
        )}

        {error && (
          <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-lg glass border-(--glass-border) text-(--text-primary) hover:bg-(--glass-bg-hover)">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-lg bg-[rgba(240,68,56,0.18)] border border-[rgba(240,68,56,0.36)] text-(--state-error) hover:bg-[rgba(240,68,56,0.28)] disabled:opacity-40"
            onClick={(e) => {
              e.preventDefault();
              void handleAction();
            }}
            disabled={isActing || !canAct}
          >
            {isActing ? loadingLabel : actionLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export { DangerDialog };
