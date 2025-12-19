import type { Metadata } from "next";

import { DashboardLayout } from "@/components/dashboard";
import { TestInterviewRunner } from "@/components/dashboard/test-interview/test-interview-runner";
import { hasPermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Test interview | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function TestInterviewPage() {
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
      <TestInterviewRunner />
    </DashboardLayout>
  );
}
