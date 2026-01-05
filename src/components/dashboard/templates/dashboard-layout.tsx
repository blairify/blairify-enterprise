"use client";

import { type ReactNode, useState } from "react";
import DashboardNavbar from "@/components/common/organisms/dashboard-navbar";
import DashboardSidebar from "@/components/common/organisms/dashboard-sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
  userName: string;
  userEmail: string;
  enterpriseName: string;
  canManageUsers: boolean;
}

export function DashboardLayout({
  children,
  userName,
  userEmail,
  enterpriseName,
  canManageUsers,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <DashboardSidebar
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        userAdmin={canManageUsers}
      />
      <div className="flex-1 lg:ml-0 flex flex-col overflow-hidden min-h-0">
        <DashboardNavbar
          setSidebarOpen={setSidebarOpen}
          userName={userName}
          userEmail={userEmail}
          enterpriseName={enterpriseName}
        />
        <main className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
          <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 max-w-7xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
