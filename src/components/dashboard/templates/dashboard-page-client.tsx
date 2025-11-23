"use client";

import { DashboardContent } from "@/components/dashboard/templates/dashboard-content";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";

interface DashboardPageClientProps {
  userName: string;
  userEmail: string;
  enterpriseName: string;
  canManageUsers: boolean;
}

export function DashboardPageClient({
  userName,
  userEmail,
  enterpriseName,
  canManageUsers,
}: DashboardPageClientProps) {
  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}
