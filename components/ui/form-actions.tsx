"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isSubmitting: boolean;
  submitLabel: string;
  loadingLabel: string;
  onCancel: () => void;
  className?: string;
}

function FormActions({
  isSubmitting,
  submitLabel,
  loadingLabel,
  onCancel,
  className,
}: FormActionsProps) {
  return (
    <div className={cn("flex items-center gap-3 pt-1", className)}>
      <Button
        type="submit"
        disabled={isSubmitting}
        className="bg-(--button-liquid-bg) hover:bg-(--button-liquid-bg-hover) border border-(--button-liquid-border) text-(--text-primary)"
      >
        {isSubmitting ? loadingLabel : submitLabel}
      </Button>
      <Button
        type="button"
        variant="ghost"
        onClick={onCancel}
        className="text-(--text-subtle) hover:text-(--text-primary)"
      >
        Cancel
      </Button>
    </div>
  );
}

export { FormActions };
