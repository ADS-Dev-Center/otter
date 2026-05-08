"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Buildings, UsersThree, ArrowRight, Check } from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createDivisionSchema, type CreateDivisionInput } from "@/lib/validations/division";
import { ACTIVE_DIVISION_STORAGE_KEY } from "@/lib/divisions";

const STEPS = [
  { id: 1, label: "Create Workspace", icon: Buildings },
  { id: 2, label: "Invite Team", icon: UsersThree },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");

  const defaultName = isLoaded && user?.firstName
    ? `${user.firstName}'s Workspace`
    : "";

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateDivisionInput>({
    resolver: zodResolver(createDivisionSchema),
    defaultValues: { name: defaultName },
  });

  useEffect(() => {
    if (isLoaded && user?.firstName) {
      setValue("name", `${user.firstName}'s Workspace`);
    }
  }, [isLoaded, user, setValue]);

  async function onCreateDivision(data: CreateDivisionInput) {
    setIsSubmitting(true);
    setFormError("");
    try {
      const res = await fetch("/api/divisions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Failed to create division (${res.status}): ${body}`);
      }
      const json = (await res.json()) as { data?: { id?: string } };
      const divisionId = json.data?.id;
      if (divisionId && typeof window !== "undefined") {
        window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, divisionId);
      }
      setStep(2);
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleFinish() {
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      {/* Step indicator */}
      <div className="flex items-center gap-3 mb-8">
        {STEPS.map((s, idx) => {
          const isDone = step > s.id;
          const isActive = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "size-8 rounded-full flex items-center justify-center transition-all duration-200",
                    isDone
                      ? "bg-(--accent-primary)"
                      : isActive
                        ? "bg-(--glass-bg-raised) border border-(--accent-primary)"
                        : "bg-(--glass-bg) border border-(--glass-border)",
                  )}
                >
                  {isDone ? (
                    <Check weight="bold" size={14} color="white" />
                  ) : (
                    <s.icon
                      weight="duotone"
                      size={14}
                      color={isActive ? "var(--accent-primary)" : "var(--text-muted)"}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs font-medium",
                    isActive ? "text-(--text-primary)" : "text-(--text-muted)",
                  )}
                >
                  {s.label}
                </span>
              </div>
              {idx < STEPS.length - 1 && (
                <div className="w-8 h-px bg-(--glass-border)" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Create Workspace */}
      {step === 1 && (
        <Card className="w-full max-w-md glass-heavy rounded-2xl border-(--glass-border) bg-(--glass-bg-raised)">
          <CardHeader className="pb-4">
            <div className="size-10 rounded-xl bg-[rgba(77,142,255,0.12)] flex items-center justify-center mb-3">
              <Buildings weight="duotone" size={20} color="var(--accent-primary)" />
            </div>
            <CardTitle className="text-xl text-(--text-primary)">
              Create your workspace
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Give your team a home. Workspaces help you organize projects and credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onCreateDivision)} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Workspace name
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Engineering Division"
                  className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-primary)"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs text-(--state-error)">{errors.name.message}</p>
                )}
                {formError && (
                  <p className="text-xs text-(--state-error)">{formError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-10 bg-(--accent-primary) hover:opacity-90 text-white font-medium rounded-lg flex items-center justify-center gap-2"
              >
                {isSubmitting ? "Creating…" : (
                  <>
                    Continue <ArrowRight weight="bold" size={16} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Invite Team (UI only, skippable) */}
      {step === 2 && (
        <Card className="w-full max-w-md glass-heavy rounded-2xl border-(--glass-border) bg-(--glass-bg-raised)">
          <CardHeader className="pb-4">
            <div className="size-10 rounded-xl bg-[rgba(45,212,191,0.12)] flex items-center justify-center mb-3">
              <UsersThree weight="duotone" size={20} color="var(--accent-teal)" />
            </div>
            <CardTitle className="text-xl text-(--text-primary)">
              Invite your team
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Add members to collaborate. You can always invite more people later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Email address
                </label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="teammate@company.com"
                  className="h-10 border-(--glass-border) bg-(--glass-bg) text-(--text-primary) placeholder:text-(--text-muted) focus:border-(--accent-primary)"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  type="button"
                  disabled
                  className="w-full h-10 bg-(--accent-primary) hover:opacity-90 text-white font-medium rounded-lg opacity-50 cursor-not-allowed"
                >
                  Send Invite
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleFinish}
                  className="w-full h-10 text-(--text-muted) hover:text-(--text-primary) hover:bg-(--glass-bg-hover)"
                >
                  Skip for now
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-xs text-(--text-muted)">
        Otter · Organized Token & Trusted Environment Repository
      </p>
    </div>
  );
}
