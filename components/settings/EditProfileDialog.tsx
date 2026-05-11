"use client";

import { useRef, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Camera, X } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { GlassInput } from "@/components/ui/glass-input";
import { toast } from "sonner";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentName: string;
  currentEmail: string;
  currentImageUrl: string | null;
  onSaved: () => void;
};

export function EditProfileDialog({
  open,
  onOpenChange,
  currentName,
  currentEmail,
  currentImageUrl,
  onSaved,
}: Props) {
  const { user: clerkUser } = useUser();

  const [name, setName] = useState(currentName);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayImage = avatarPreview ?? currentImageUrl;
  const initials = (name || currentName).charAt(0).toUpperCase();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    // revoke previous preview if present
    if (avatarPreview) {
      try {
        URL.revokeObjectURL(avatarPreview);
      } catch {}
    }
    const url = URL.createObjectURL(file);
    setAvatarFile(file);
    setAvatarPreview(url);
  }

  function handleClose(open: boolean) {
    if (!open) {
      setName(currentName);
      setAvatarFile(null);
      if (avatarPreview) {
        try {
          URL.revokeObjectURL(avatarPreview);
        } catch {}
      }
      setAvatarPreview(null);
      setError("");
    }
    onOpenChange(open);
  }

  useEffect(() => {
    return () => {
      if (avatarPreview) {
        try {
          URL.revokeObjectURL(avatarPreview);
        } catch {}
      }
    };
  }, [avatarPreview]);

  async function handleSave() {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Name cannot be empty");
      return;
    }
    setSaving(true);
    setError("");

    try {
      // upload avatar first if changed
      if (avatarFile) {
        const fd = new FormData();
        fd.append("file", avatarFile);
        const res = await fetch("/api/profile/avatar", {
          method: "POST",
          body: fd,
        });
        if (!res.ok) {
          setError("Failed to upload avatar");
          return;
        }
      }

      // update name if changed
      if (trimmed !== currentName) {
        const res = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: trimmed }),
        });
        if (!res.ok) {
          setError("Failed to update name");
          return;
        }
      }

      // refresh Clerk session so useUser() reflects new data immediately
      await clerkUser?.reload();

      toast.success("Profile updated");
      onSaved();
      onOpenChange(false);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="glass-heavy max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised) p-5 text-(--text-primary)">
        <DialogHeader>
          <DialogTitle className="text-lg text-(--text-primary)">
            Edit Profile
          </DialogTitle>
          <DialogDescription className="text-(--text-muted)">
            Update your display name and profile photo.
          </DialogDescription>
        </DialogHeader>

        {/* Avatar picker */}
        <div className="flex justify-center pt-1">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative group"
            title="Change photo"
          >
            {displayImage ? (
              <img
                src={displayImage}
                alt={name}
                className="size-20 rounded-full object-cover border-2 border-(--glass-border)"
              />
            ) : (
              <div className="size-20 rounded-full flex items-center justify-center bg-(--glass-bg-hover) border-2 border-(--glass-border) text-(--text-subtle) text-2xl font-semibold select-none">
                {initials}
              </div>
            )}
            <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
              <Camera weight="duotone" size={22} color="white" />
            </div>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* Name input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-subtle)">
            Full name
          </label>
          <GlassInput
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void handleSave();
            }}
            placeholder="Your name"
          />
        </div>

        {/* Email read-only */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-(--text-subtle)">
            Email
          </label>
          <div className="flex items-center rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2 text-sm text-(--text-muted) select-none">
            {currentEmail}
          </div>
          <p className="text-[11px] text-(--text-muted)">
            Email changes are managed through your account security settings.
          </p>
        </div>

        {error && (
          <p className="text-xs text-(--state-error) bg-[rgba(240,68,56,0.08)] border border-[rgba(240,68,56,0.2)] rounded-lg px-3 py-2">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => handleClose(false)}
            className="text-(--text-subtle) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            disabled={saving || !name.trim()}
            className="rounded-lg bg-(--accent-primary) hover:opacity-90 text-white disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
