import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export const GLASS_INPUT_CLASS =
  "glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary)";

function GlassInput({ className, ...props }: React.ComponentProps<"input">) {
  return <Input className={cn(GLASS_INPUT_CLASS, className)} {...props} />;
}

export { GlassInput };
