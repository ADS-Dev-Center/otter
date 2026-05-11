"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface GlassSelectOption {
  value: string;
  label: string;
  icon?: React.ElementType;
  iconColor?: string;
}

interface GlassSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  options: GlassSelectOption[];
  className?: string;
}

function GlassSelect({
  value,
  onValueChange,
  placeholder,
  options,
  className,
}: GlassSelectProps) {
  return (
    <Select value={value} onValueChange={onValueChange}>
      <SelectTrigger
        className={cn(
          "w-full glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) focus:ring-[rgba(77,142,255,0.4)] focus:border-(--accent-primary)",
          className,
        )}
      >
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="panel-dropdown">
        {options.map((opt) => {
          const IconComp = opt.icon as
            | React.ComponentType<{ weight: string; size: number; color?: string }>
            | undefined;
          return (
            <SelectItem
              key={opt.value}
              value={opt.value}
              className="focus:bg-(--glass-bg-hover) text-(--text-primary)"
            >
              <span className="flex items-center gap-2">
                {IconComp && (
                  <IconComp weight="duotone" size={12} color={opt.iconColor} />
                )}
                {opt.label}
              </span>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
}

export { GlassSelect };
