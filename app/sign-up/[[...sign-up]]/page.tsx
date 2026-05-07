"use client";

import { SignUp } from "@clerk/nextjs";

import AuthPageShell from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignUpPage() {
  return (
    <AuthPageShell
      title="Create your workspace access"
      description="Set up your Clerk account and start managing encrypted secrets with a clear division structure."
    >
      <SignUp
        routing="path"
        path="/sign-up"
        signInUrl="/sign-in"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthPageShell>
  );
}
