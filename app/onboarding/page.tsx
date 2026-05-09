"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Buildings,
  Check,
  EnvelopeSimple,
  Spinner,
  UsersThree,
  X,
} from "@phosphor-icons/react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { cn } from "@/lib/utils";
import {
  createDivisionSchema,
  type CreateDivisionInput,
} from "@/lib/validations/division";
import { ACTIVE_DIVISION_STORAGE_KEY } from "@/lib/divisions";

type InviteRole = "DIVISION_ADMIN" | "MEMBER";

type SentInvite = {
  email: string;
  role: InviteRole;
  status: "pending" | "added";
};

const ROLE_OPTIONS: {
  value: InviteRole;
  label: string;
  description: string;
}[] = [
  { value: "MEMBER", label: "Member", description: "View assigned projects" },
  {
    value: "DIVISION_ADMIN",
    label: "Admin",
    description: "Invite and manage projects",
  },
];

const STEPS = [
  { id: 1, label: "Create Division", icon: Buildings },
  { id: 2, label: "Invite Team", icon: UsersThree },
];

export default function OnboardingPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();

  const [step, setStep] = useState(1);
  const [divisionId, setDivisionId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  // Step 2 state
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<InviteRole>("MEMBER");
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [sentInvites, setSentInvites] = useState<SentInvite[]>([]);
  const [inviting, setInviting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateDivisionInput>({
    resolver: zodResolver(createDivisionSchema),
    defaultValues: { name: "" },
  });

  useEffect(() => {
    if (isLoaded && user?.firstName) {
      setValue("name", `${user.firstName}'s Division`);
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
      const id = json.data?.id;
      if (id) {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(ACTIVE_DIVISION_STORAGE_KEY, id);
        }
        setDivisionId(id);
        setStep(2);
      } else {
        throw new Error("Division creation did not return an id");
      }
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendInvite(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email || !divisionId) return;

    const alreadySent = sentInvites.some((i) => i.email === email);
    if (alreadySent) {
      setInviteError("You already sent an invite to this address.");
      return;
    }

    setInviteError(null);
    setInviting(true);

    try {
      const res = await fetch("/api/members/invite", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role: inviteRole, divisionId }),
      });

      const json = (await res.json()) as {
        data?: { status: string };
        error?: { code: string; message: string };
      };

      if (!res.ok) {
        if (res.status === 409) {
          setInviteError("This person is already a member of the division.");
        } else {
          setInviteError(json.error?.message ?? "Invite failed. Try again.");
        }
        return;
      }

      setSentInvites((prev) => [
        ...prev,
        {
          email,
          role: inviteRole,
          status: json.data?.status === "added" ? "added" : "pending",
        },
      ]);
      setInviteEmail("");
      setInviteRole("MEMBER");
    } catch {
      setInviteError("Network error. Please try again.");
    } finally {
      setInviting(false);
    }
  }

  function handleFinish() {
    router.push("/");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      {/* Step indicator */}
      <div className="mb-8 flex items-center gap-3">
        {STEPS.map((s, idx) => {
          const isDone = step > s.id;
          const isActive = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    "flex size-8 items-center justify-center rounded-full transition-all duration-200",
                    isDone
                      ? "bg-(--accent-primary)"
                      : isActive
                        ? "border border-(--accent-primary) bg-(--glass-bg-raised)"
                        : "border border-(--glass-border) bg-(--glass-bg)",
                  )}
                >
                  {isDone ? (
                    <Check weight="bold" size={14} color="white" />
                  ) : (
                    <s.icon
                      weight="duotone"
                      size={14}
                      color={
                        isActive ? "var(--accent-primary)" : "var(--text-muted)"
                      }
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
                <div className="h-px w-8 bg-(--glass-border)" />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Create Division */}
      {step === 1 && (
        <Card className="glass-heavy w-full max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised)">
          <CardHeader className="pb-4">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[rgba(77,142,255,0.12)]">
              <Buildings
                weight="duotone"
                size={20}
                color="var(--accent-primary)"
              />
            </div>
            <CardTitle className="text-xl text-(--text-primary)">
              Create your division
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Give your team a home. Divisions help you organize projects and
              credentials.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit(onCreateDivision)}
              className="flex flex-col gap-4"
            >
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-(--text-subtle)">
                  Division name
                </label>
                <Input
                  {...register("name")}
                  placeholder="e.g. Engineering Division"
                  className="glass rounded-lg border-(--glass-border) bg-transparent text-(--text-primary) placeholder:text-(--text-muted) focus-visible:border-(--accent-primary) focus-visible:ring-[rgba(77,142,255,0.4)]"
                  autoFocus
                />
                {errors.name && (
                  <p className="text-xs text-(--state-error)">
                    {errors.name.message}
                  </p>
                )}
                {formError && (
                  <p className="text-xs text-(--state-error)">{formError}</p>
                )}
              </div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--accent-primary) font-medium text-white hover:opacity-90"
              >
                {isSubmitting ? (
                  "Creating…"
                ) : (
                  <>
                    Continue <ArrowRight weight="bold" size={16} />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Invite Team */}
      {step === 2 && (
        <Card className="glass-heavy w-full max-w-md rounded-2xl border-(--glass-border) bg-(--glass-bg-raised)">
          <CardHeader className="pb-4">
            <div className="mb-3 flex size-10 items-center justify-center rounded-xl bg-[rgba(45,212,191,0.12)]">
              <UsersThree
                weight="duotone"
                size={20}
                color="var(--accent-teal)"
              />
            </div>
            <CardTitle className="text-xl text-(--text-primary)">
              Invite your team
            </CardTitle>
            <CardDescription className="text-(--text-muted)">
              Add members to collaborate. You can always invite more people
              later.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4">
              <form onSubmit={handleSendInvite} className="flex flex-col gap-3">
                {/* Email input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-(--text-subtle)">
                    Email address
                  </label>
                  <div className="relative">
                    <EnvelopeSimple
                      weight="duotone"
                      size={14}
                      color="var(--text-muted)"
                      className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                    />
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      placeholder="teammate@company.com"
                      className="glass rounded-lg border-(--glass-border) bg-transparent pl-9 text-(--text-primary) placeholder:text-(--text-muted) focus-visible:border-(--accent-primary) focus-visible:ring-[rgba(77,142,255,0.4)]"
                      required
                    />
                  </div>
                </div>

                {/* Role selector */}
                <div className="flex flex-col gap-1.5">
                  <p className="text-xs font-medium text-(--text-subtle)">
                    Role
                  </p>
                  <RadioGroup
                    value={inviteRole}
                    onValueChange={(v) => setInviteRole(v as InviteRole)}
                    className="grid grid-cols-2 gap-2"
                  >
                    {ROLE_OPTIONS.map((opt) => (
                      <label
                        key={opt.value}
                        htmlFor={`onboard-role-${opt.value}`}
                        className={cn(
                          "flex cursor-pointer items-start gap-2.5 rounded-xl border p-3 transition-colors",
                          inviteRole === opt.value
                            ? "border-(--accent-primary) bg-(--glass-bg-active)"
                            : "border-(--glass-border-subtle) bg-(--glass-bg) hover:bg-(--glass-bg-hover)",
                        )}
                      >
                        <RadioGroupItem
                          id={`onboard-role-${opt.value}`}
                          value={opt.value}
                          className="mt-0.5 shrink-0"
                        />
                        <div className="flex flex-col gap-0.5">
                          <span className="text-sm font-semibold text-(--text-primary)">
                            {opt.label}
                          </span>
                          <span className="text-xs text-(--text-muted)">
                            {opt.description}
                          </span>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {inviteError && (
                  <p className="flex items-center gap-1.5 text-xs text-red-400">
                    <X size={12} weight="bold" />
                    {inviteError}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={inviting || !inviteEmail.trim()}
                  className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-(--accent-primary) font-medium text-white hover:opacity-90 disabled:opacity-50"
                >
                  {inviting ? (
                    <Spinner weight="bold" className="animate-spin" size={16} />
                  ) : (
                    <EnvelopeSimple weight="duotone" size={16} />
                  )}
                  Send invite
                </Button>
              </form>

              {/* Sent invites */}
              {sentInvites.length > 0 && (
                <div className="flex flex-col gap-2">
                  <p className="text-xs font-medium text-(--text-subtle)">
                    Sent
                  </p>
                  <div className="flex flex-col gap-1.5">
                    {sentInvites.map((inv) => (
                      <div
                        key={inv.email}
                        className="flex items-center justify-between gap-3 rounded-lg border border-(--glass-border-subtle) bg-(--glass-bg) px-3 py-2"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <Check
                            weight="bold"
                            size={12}
                            color="var(--accent-teal)"
                            className="shrink-0"
                          />
                          <span className="truncate text-sm text-(--text-primary)">
                            {inv.email}
                          </span>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs">
                          {inv.role === "DIVISION_ADMIN" ? "Admin" : "Member"}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button
                type="button"
                variant="ghost"
                onClick={handleFinish}
                className="h-10 w-full text-(--text-muted) hover:bg-(--glass-bg-hover) hover:text-(--text-primary)"
              >
                {sentInvites.length > 0 ? "Done" : "Skip for now"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <p className="mt-6 text-xs text-(--text-muted)">
        Otter · Organized Token &amp; Trusted Environment Repository
      </p>
    </div>
  );
}
