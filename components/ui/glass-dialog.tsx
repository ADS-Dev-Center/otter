"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GlassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  maxWidth?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

function GlassDialog({
  open,
  onOpenChange,
  title,
  description,
  maxWidth = "sm:max-w-md",
  children,
  footer,
}: GlassDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("glass-heavy rounded-2xl border-(--glass-border)", maxWidth)}
      >
        <DialogHeader>
          <DialogTitle className="text-(--text-primary)">{title}</DialogTitle>
          {description && (
            <DialogDescription className="text-(--text-muted)">
              {description}
            </DialogDescription>
          )}
        </DialogHeader>
        {children}
        {footer && <DialogFooter className="gap-2 pt-2">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export { GlassDialog };
