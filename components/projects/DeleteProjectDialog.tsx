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
import { Input } from "@/components/ui/input";
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
  const [confirmSlug, setConfirmSlug] = useState("");

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
        if (!o) {
          setError("");
          setConfirmSlug("");
        }
        onOpenChange(o);
      }}
    >
      <AlertDialogContent className="glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-(--text-primary)">
            Delete Project
          </AlertDialogTitle>
          <AlertDialogDescription className="text-(--text-muted)">
            This action cannot be undone and will remove all credentials
            associated with this project.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-subtle)">
            Type{" "}
            <span className="font-semibold text-(--text-primary) font-mono">
              {project?.slug}
            </span>{" "}
            to confirm
          </label>
          <Input
            value={confirmSlug}
            onChange={(e) => setConfirmSlug(e.target.value)}
            placeholder={project?.slug ?? ""}
            className="glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)"
            autoFocus
          />
        </div>

        {error && <p className="text-xs text-(--state-error) px-1">{error}</p>}

        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-lg glass border-(--glass-border) text-(--text-primary) hover:bg-(--glass-bg-hover)">
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-lg bg-[rgba(240,68,56,0.18)] border border-[rgba(240,68,56,0.36)] text-(--state-error) hover:bg-[rgba(240,68,56,0.28)] disabled:opacity-40"
            onClick={(e) => {
              e.preventDefault();
              handleDelete();
            }}
            disabled={isDeleting || confirmSlug !== project?.slug}
          >
            {isDeleting ? "Deleting…" : "Delete Project"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
