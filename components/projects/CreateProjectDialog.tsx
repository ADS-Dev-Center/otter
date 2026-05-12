"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { GlassDialog } from "@/components/ui/glass-dialog";
import { FormField } from "@/components/ui/form-field";
import { FieldType } from "@/components/ui/field-input";
import { toast } from "sonner";
import {
  createProjectFormSchema,
  type CreateProjectFormInput,
} from "@/lib/validations/project";
import { createProjectAction } from "@/app/actions/projects";
import type { Project } from "@/types/project";

interface CreateProjectDialogProps {
  open: boolean;
  divisionId: string;
  onOpenChange: (open: boolean) => void;
  onCreated: (project: Project) => void;
}

export function CreateProjectDialog({
  open,
  divisionId,
  onOpenChange,
  onCreated,
}: CreateProjectDialogProps) {
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormInput>({
    resolver: zodResolver(createProjectFormSchema),
  });

  async function onSubmit(data: CreateProjectFormInput) {
    setServerError("");

    if (!divisionId) {
      setServerError(
        "No active division selected. Please select a division first.",
      );
      return;
    }

    try {
      const result = await createProjectAction({ ...data, divisionId });

      if (!result.ok) {
        const msg = result.error.message;
        setServerError(msg);
        toast.error("Failed to create project", { description: msg });
        return;
      }

      reset();
      onOpenChange(false);
      onCreated(result.data as Project);
      toast.success("Project created", { description: result.data.name });
    } catch {
      const msg = "Network error. Please check your connection and try again.";
      setServerError(msg);
      toast.error("Failed to create project", { description: msg });
    }
  }

  function handleOpenChange(open: boolean) {
    if (!open) reset();
    setServerError("");
    onOpenChange(open);
  }

  return (
    <GlassDialog
      open={open}
      onOpenChange={handleOpenChange}
      title="Create Project"
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
            form="create-project-form"
            className="rounded-lg"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Creating…" : "Create Project"}
          </Button>
        </>
      }
    >
      <form
        id="create-project-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 mt-2"
      >
        <FormField
          field={{
            type: FieldType.TEXT,
            name: "name",
            label: "Project Name",
            placeholder: "e.g. API Gateway",
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
            placeholder: "Brief description of this project",
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
