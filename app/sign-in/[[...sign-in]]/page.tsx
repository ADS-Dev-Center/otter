"use client";

import { SignIn } from "@clerk/nextjs";

import AuthPageShell from "@/components/auth/AuthPageShell";
import { clerkAppearance } from "@/lib/clerk-appearance";

export default function SignInPage() {
  return (
    <AuthPageShell
      title="Welcome back"
      description="Use your Clerk account to reach the dashboard and manage your divisions."
    >
      <SignIn
        routing="path"
        path="/sign-in"
        signUpUrl="/sign-up"
        forceRedirectUrl="/dashboard"
        appearance={clerkAppearance}
      />
    </AuthPageShell>
  );
}
