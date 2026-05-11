import { Suspense } from "react";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { AuditLogTable } from "@/components/audit/AuditLogTable";
import { AuditLogSkeleton } from "@/components/audit/AuditLogSkeleton";
import { getInitialAuditLogData } from "@/lib/services/audit.service";

const INITIAL_PER_PAGE = 15;

async function AuditLogLoader() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { initialEntries, total, divisions } = await getInitialAuditLogData(
    userId,
    INITIAL_PER_PAGE,
  );

  return (
    <AuditLogTable
      initialEntries={initialEntries}
      initialTotal={total}
      initialPages={Math.max(1, Math.ceil(total / INITIAL_PER_PAGE))}
      divisions={divisions}
    />
  );
}

export default function AuditLogPage() {
  return (
    <Suspense fallback={<AuditLogSkeleton />}>
      <AuditLogLoader />
    </Suspense>
  );
}
