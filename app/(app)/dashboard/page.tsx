import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { DashboardStats } from "@/components/dashboard/DashboardStats";
import { DashboardProjectCards } from "@/components/dashboard/DashboardProjectCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { MembersList } from "@/components/dashboard/MembersList";
import { getDashboardData } from "@/lib/services/dashboard.service";

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function DashboardPage() {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const [user, dashboardData] = await Promise.all([
    currentUser(),
    getDashboardData(userId),
  ]);

  const {
    memberships,
    projectCount,
    credentialCount,
    auditCount,
    projectCards,
    activityData,
    memberData,
  } = dashboardData;

  const firstName = user?.firstName ?? "there";
  const divisionNames = memberships.map((m) => m.division.name);

  return (
    <div>
      <h1
        className="text-2xl font-bold tracking-tight"
        style={{ color: "var(--text-primary)" }}
      >
        {timeGreeting()}, {firstName} 👋
      </h1>
      <p className="text-sm mt-1" style={{ color: "var(--text-muted)" }}>
        Here&apos;s what&apos;s happening across your divisions today.
      </p>

      <DashboardStats
        divisionCount={memberships.length}
        projectCount={projectCount}
        credentialCount={credentialCount}
        auditCount={auditCount}
        divisionNames={divisionNames}
      />

      <div className="flex items-center justify-between mt-8 mb-4">
        <h2
          className="text-sm font-semibold uppercase tracking-wider"
          style={{ color: "var(--text-muted)" }}
        >
          Projects
        </h2>
      </div>

      <DashboardProjectCards projects={projectCards} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <RecentActivity entries={activityData} />
        <MembersList members={memberData} />
      </div>
    </div>
  );
}
