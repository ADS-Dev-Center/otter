"use client";

import { useState } from "react";
import { Eye, EyeSlash } from "@phosphor-icons/react";
import { cn } from "@/lib/utils";
import { GlassInput } from "./glass-input";
import { GlassTextarea } from "./glass-textarea";
import { GlassSelect, type GlassSelectOption } from "./glass-select";
import type { UseFormRegisterReturn } from "react-hook-form";

export enum FieldType {
  TEXT = "text",
  PASSWORD = "password",
  TEXTAREA = "textarea",
  SELECT = "select",
  MONO = "mono",
}

export interface FieldDef {
  type: FieldType;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
  rows?: number;
  options?: GlassSelectOption[];
}

interface FieldInputProps {
  field: FieldDef;
  registration?: UseFormRegisterReturn;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

function FieldInput({
  field,
  registration,
  value,
  onValueChange,
  className,
}: FieldInputProps) {
  const [visible, setVisible] = useState(false);

  switch (field.type) {
    case FieldType.TEXT:
      return (
        <GlassInput
          type="text"
          placeholder={field.placeholder}
          className={className}
          {...registration}
        />
      );

    case FieldType.PASSWORD:
      return (
        <div className="relative">
          <GlassInput
            type={visible ? "text" : "password"}
            placeholder={field.placeholder}
            className={cn("pr-8", className)}
            {...registration}
          />
          <button
            type="button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-(--text-muted) hover:text-(--text-primary) transition-colors"
          >
            {visible ? (
              <EyeSlash weight="duotone" size={14} />
            ) : (
              <Eye weight="duotone" size={14} />
            )}
          </button>
        </div>
      );

    case FieldType.TEXTAREA:
      return (
        <GlassTextarea
          placeholder={field.placeholder}
          rows={field.rows ?? 3}
          className={className}
          {...registration}
        />
      );

    case FieldType.SELECT:
      return (
        <GlassSelect
          value={value}
          onValueChange={onValueChange}
          placeholder={field.placeholder}
          options={field.options ?? []}
          className={className}
        />
      );

    case FieldType.MONO:
      return (
        <GlassInput
          type="text"
          placeholder={field.placeholder}
          className={cn("font-mono", className)}
          {...registration}
        />
      );
  }
}

export { FieldInput };
