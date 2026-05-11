"use client";

import { toast } from "sonner";
import { DangerDialog } from "@/components/ui/danger-dialog";
import { deleteProjectAction } from "@/app/actions/projects";
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
  if (!project) return null;

  async function handleDelete() {
    const result = await deleteProjectAction({ projectId: project!.id });
    if (!result.ok) {
      throw new Error(result.error.message || "Failed to delete project");
    }
    onDeleted(project!.id);
    toast.success("Project deleted", { description: project!.name });
  }

  return (
    <DangerDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Delete Project"
      description="This action cannot be undone and will remove all credentials associated with this project."
      confirmText={project.slug}
      actionLabel="Delete Project"
      loadingLabel="Deleting…"
      onAction={handleDelete}
    />
  );
}
