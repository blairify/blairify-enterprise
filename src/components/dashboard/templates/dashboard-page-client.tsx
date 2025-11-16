"use client";

import { DashboardContent } from "@/components/dashboard/templates/dashboard-content";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";

interface DashboardPageClientProps {
  userName: string;
  userEmail: string;
  enterpriseName: string;
}

export function DashboardPageClient({
  userName,
  userEmail,
  enterpriseName,
}: DashboardPageClientProps) {
  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
    >
      <DashboardContent />
    </DashboardLayout>
  );
}
