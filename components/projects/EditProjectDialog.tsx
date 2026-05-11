"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { FormField } from "@/components/ui/form-field";
import { FieldType } from "@/components/ui/field-input";
import { toast } from "sonner";
import {
  updateProjectFormSchema,
  type UpdateProjectFormInput,
} from "@/lib/validations/project";
import { updateProjectAction } from "@/app/actions/projects";
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
      const result = await updateProjectAction({
        projectId: project.id,
        ...data,
      });

      if (!result.ok) {
        const msg = result.error.message;
        setServerError(msg);
        toast.error("Failed to update project", { description: msg });
        return;
      }

      const updated = result.data as Project;
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
    <GlassDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Edit Project"
      footer={
        <>
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
            form="edit-project-form"
            className="rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Saving…" : "Save Changes"}
          </Button>
        </>
      }
    >
      <form
        id="edit-project-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 mt-2"
      >
        <FormField
          field={{
            type: FieldType.TEXT,
            name: "name",
            label: "Project Name",
            required: true,
          }}
          registration={register("name")}
          error={errors.name?.message}
        />
        <FormField
          field={{
            type: FieldType.TEXTAREA,
            name: "description",
            label: "Description",
            rows: 3,
          }}
          registration={register("description")}
          error={errors.description?.message}
        />
        {serverError && (
          <p className="text-xs text-(--state-error)">{serverError}</p>
        )}
      </form>
    </GlassDialog>
  );
}
