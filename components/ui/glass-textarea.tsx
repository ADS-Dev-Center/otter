import * as React from "react";
import { cn } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";

function GlassTextarea({
  className,
  ...props
}: React.ComponentProps<"textarea">) {
  return (
    <Textarea
      className={cn(
        "glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus-visible:ring-[rgba(77,142,255,0.4)] focus-visible:border-(--accent-primary) resize-none",
        className,
      )}
      {...props}
    />
  );
}

export { GlassTextarea };
