"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  updateProjectFormSchema,
  type UpdateProjectFormInput,
} from "@/lib/validations/project";
import type { Project } from "@/types/project";

interface EditProjectDialogProps {
  open: boolean;
  project: Project | null;
  onOpenChange: (open: boolean) => void;
  onUpdated: (project: Project) => void;
}

export function EditProjectDialog({
  open,
  project,
  onOpenChange,
  onUpdated,
}: EditProjectDialogProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProjectFormInput>({
    resolver: zodResolver(updateProjectFormSchema),
  });

  useEffect(() => {
    if (project) {
      reset({
        name: project.name,
        description: project.description ?? "",
      });
    }
  }, [project, reset]);

  async function onSubmit(data: UpdateProjectFormInput) {
    if (!project) return;
    setServerError("");
    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = (await res.json()) as
        | { data: Project }
        | { error: { message: string } };

      if (!res.ok) {
        const err = json as { error: { message: string } };
        const msg = err.error?.message ?? "Failed to update project";
        setServerError(msg);
        toast.error("Failed to update project", { description: msg });
        return;
      }

      const updated = (json as { data: Project }).data;
      onOpenChange(false);
      onUpdated(updated);
      toast.success("Project updated", { description: updated.name });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      setServerError(msg);
      toast.error("Failed to update project", { description: msg });
    }
  }

  function handleOpenChange(open: boolean) {
    setServerError("");
    onOpenChange(open);
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-(--text-primary)">
            Edit Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Project Name <span className="text-(--state-error)">*</span>
            </label>
            <Input
              {...register("name")}
              className="glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent"
            />
            {errors.name && (
              <p className="text-xs text-(--state-error)">
                {errors.name.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Description
            </label>
            <Textarea
              {...register("description")}
              rows={3}
              className="glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent resize-none"
            />
            {errors.description && (
              <p className="text-xs text-(--state-error)">
                {errors.description.message}
              </p>
            )}
          </div>

          {serverError && (
            <p className="text-xs text-(--state-error)">{serverError}</p>
          )}

          <DialogFooter className="gap-2 pt-2">
            <Button
              type="button"
              variant="ghost"
              className="rounded-lg"
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-lg"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
