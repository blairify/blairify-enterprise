"use client";

import {
  BarChart3,
  Briefcase,
  FileText,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import Logo from "@/components/atoms/logo-blairify";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: BarChart3 },
  { name: "Jobs", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Interviews", href: "/dashboard/interviews", icon: FileText },
  { name: "Candidates", href: "/dashboard/candidates", icon: Users },
  { name: "Templates", href: "/dashboard/templates", icon: FileText },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

export default function DashboardNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (response.ok) {
        toast.success("Logged out successfully");
        router.push("/login");
      } else {
        toast.error("Failed to log out");
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
    }
  };

  return (
    <div className="flex h-screen w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center border-b px-6">
        <Logo variant="minimal" className="text-xl" />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname?.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="mb-3 flex items-center gap-3 px-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            A
          </div>
          <div className="flex-1 text-sm">
            <p className="font-medium">Admin User</p>
            <p className="text-xs text-muted-foreground">admin@acme.com</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
