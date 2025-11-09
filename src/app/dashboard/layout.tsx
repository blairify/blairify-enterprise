import type { ReactNode } from "react";
import DashboardNav from "@/components/layout/dashboard-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen">
      <DashboardNav />
      <main className="flex-1 overflow-y-auto bg-background">{children}</main>
    </div>
  );
}
