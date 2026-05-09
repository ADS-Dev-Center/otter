"use client";

import { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  createProjectFormSchema,
  type CreateProjectFormInput,
} from "@/lib/validations/project";
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
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateProjectFormInput>({
    resolver: zodResolver(createProjectFormSchema),
    defaultValues: { environment: "development" },
  });

  const environment = watch("environment");

  async function onSubmit(data: CreateProjectFormInput) {
    setServerError("");

    if (!divisionId) {
      setServerError("No active division selected. Please select a division first.");
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, divisionId }),
      });

      let json: { data?: Project; error?: { message: string } };
      try {
        json = (await res.json()) as typeof json;
      } catch {
        setServerError("Unexpected server response. Please try again.");
        return;
      }

      if (!res.ok) {
        const msg = json.error?.message ?? `Request failed (${res.status})`;
        setServerError(msg);
        toast.error("Failed to create project", { description: msg });
        return;
      }

      if (!json.data) {
        setServerError("No data returned from server.");
        return;
      }

      reset();
      onOpenChange(false);
      onCreated(json.data);
      toast.success("Project created", {
        description: json.data.name,
      });
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
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="glass-heavy rounded-2xl border-(--glass-border) sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-(--text-primary)">
            Create Project
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Project Name <span className="text-(--state-error)">*</span>
            </label>
            <Input
              {...register("name")}
              placeholder="e.g. API Gateway"
              className="glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent"
            />
            {errors.name && (
              <p className="text-xs text-(--state-error)">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Description
            </label>
            <Textarea
              {...register("description")}
              placeholder="Brief description of this project"
              rows={3}
              className="glass rounded-lg border-(--glass-border) text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) bg-transparent resize-none"
            />
            {errors.description && (
              <p className="text-xs text-(--state-error)">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-(--text-subtle)">
              Default Environment
            </label>
            <Select
              value={environment}
              onValueChange={(v) =>
                setValue("environment", v as CreateProjectFormInput["environment"], {
                  shouldValidate: true,
                })
              }
            >
              <SelectTrigger className="glass rounded-lg border-(--glass-border) text-(--text-primary) focus:ring-[rgba(77,142,255,0.4)] focus:border-(--accent-primary) bg-transparent">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="panel-dropdown">
                <SelectItem value="development" className="text-(--text-primary) focus:bg-(--glass-bg-hover)">Development</SelectItem>
                <SelectItem value="staging" className="text-(--text-primary) focus:bg-(--glass-bg-hover)">Staging</SelectItem>
                <SelectItem value="production" className="text-(--text-primary) focus:bg-(--glass-bg-hover)">Production</SelectItem>
                <SelectItem value="shared" className="text-(--text-primary) focus:bg-(--glass-bg-hover)">Shared</SelectItem>
              </SelectContent>
            </Select>
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
            <Button type="submit" className="rounded-lg" disabled={isSubmitting}>
              {isSubmitting ? "Creating…" : "Create Project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
