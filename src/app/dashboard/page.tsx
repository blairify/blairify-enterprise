import type { Metadata } from "next";
import { Suspense } from "react";

import LoadingPage from "@/components/common/atoms/loading-page";
import { DashboardPageClient } from "@/components/dashboard/templates/dashboard-page-client";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Dashboard | Blairify - Your Career Progress Hub",
  description:
    "Track your job applications, interview progress, and skill development. Access your personalized career dashboard with insights and recommendations.",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  const auth = await requireAuth();

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;

  return (
    <Suspense fallback={<LoadingPage message="Loading dashboard..." />}>
      <DashboardPageClient
        userName={userName}
        userEmail={userEmail}
        enterpriseName={enterpriseName}
      />
    </Suspense>
  );
}
