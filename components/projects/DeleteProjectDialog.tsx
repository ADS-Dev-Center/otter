"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog";
import type { Project } from "@/types/project";

interface DeleteProjectDialogProps {
  open: boolean;
  project: Project | null;
  onOpenChange: (open: boolean) => void;
  onDeleted: (projectId: string) => void;
}

export function DeleteProjectDialog({
  open,
  project,
  onOpenChange,
  onDeleted,
}: DeleteProjectDialogProps) {
  const [error, setError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDelete() {
    if (!project) return;
    setError("");
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        let msg = "Failed to delete project";
        try {
          const json = (await res.json()) as { error: { message: string } };
          msg = json.error?.message ?? msg;
        } catch {}
        setError(msg);
        toast.error("Failed to delete project", { description: msg });
        return;
      }
      const name = project.name;
      onOpenChange(false);
      onDeleted(project.id);
      toast.success("Project deleted", { description: name });
    } catch {
      const msg = "Network error. Please try again.";
      setError(msg);
      toast.error("Failed to delete project", { description: msg });
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <AlertDialog
      open={open}
      onOpenChange={(o) => {
        if (!o) setError("");
        onOpenChange(o);
      }}
    >
      <AlertDialogContent className="glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-(--text-primary)">
            Delete Project
          </AlertDialogTitle>
          <AlertDialogDescription className="text-(--text-muted)">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-(--text-primary)">
              {project?.name}
            </span>
            ? This action cannot be undone and will remove all credentials
            associated with this project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {error && <p className="text-xs text-(--state-error) px-1">{error}</p>}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-lg glass border-(--glass-border) text-(--text-primary) hover:bg-(--glass-bg-hover)">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-lg bg-[rgba(240,68,56,0.18)] border border-[rgba(240,68,56,0.36)] text-(--state-error) hover:bg-[rgba(240,68,56,0.28)]"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting}
          >
            {isDeleting ? "Deleting…" : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
