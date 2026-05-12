"use client";

import { cn } from "@/lib/utils";
import { FieldInput } from "./field-input";
import type { FieldDef } from "./field-input";
import type { UseFormRegisterReturn } from "react-hook-form";

interface FormFieldProps {
  field: FieldDef;
  registration?: UseFormRegisterReturn;
  value?: string;
  onValueChange?: (value: string) => void;
  error?: string;
  className?: string;
}

function FormField({
  field,
  registration,
  value,
  onValueChange,
  error,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label className="text-xs font-medium text-(--text-subtle)">
        {field.label}
        {field.required && (
          <span className="text-(--state-error) ml-0.5">*</span>
        )}
      </label>
      <FieldInput
        field={field}
        registration={registration}
        value={value}
        onValueChange={onValueChange}
      />
      {error && <p className="text-xs text-(--state-error)">{error}</p>}
    </div>
  );
}

export { FormField };
export type { FormFieldProps };
