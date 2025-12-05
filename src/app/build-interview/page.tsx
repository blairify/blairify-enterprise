import type { Metadata } from "next";

import { DashboardLayout } from "@/components/dashboard";
import { BuildInterviewFlow } from "@/components/dashboard/build-interview/build-interview-flow";
import { hasPermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Build interview | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BuildInterviewPage() {
  const auth = await requireAuth();

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <BuildInterviewFlow />
    </DashboardLayout>
  );
}
