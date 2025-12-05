"use client";

import {
  Database,
  GitBranch,
  Inbox,
  MessageSquare,
  Mic,
  Settings,
  User,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Logo from "@/components/common/atoms/logo-blairify";
import { Button } from "@/components/ui/button";

interface DashboardSidebarProps {
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  userAdmin?: boolean;
}

export default function DashboardSidebar({
  sidebarOpen,
  setSidebarOpen,
  userAdmin,
}: DashboardSidebarProps) {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <>
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-sidebar text-sidebar-foreground border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden`}
      >
        <div className="border-b border-border">
          <div className="px-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <Logo variant="minimal" className="h-8" />

              <Button
                variant="ghost"
                size="sm"
                className="lg:hidden text-sidebar-foreground active:bg-sidebar-accent md:hover:bg-sidebar-accent transition-colors"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
          <Link
            href="/build-interview"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/build-interview")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/build-interview") ? "font-semibold" : "font-medium"
              }`}
            >
              Build interview
            </span>
          </Link>

          <Link
            href="/candidates"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/candidates")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <User className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/candidates") ? "font-semibold" : "font-medium"
              }`}
            >
              Candidates
            </span>
          </Link>

          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/60 cursor-not-allowed"
            disabled
            aria-disabled="true"
          >
            <GitBranch className="h-5 w-5 flex-shrink-0 opacity-60" />
            <span className="flex items-center gap-2 truncate font-medium">
              <span>My flows</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-sidebar-border/60">
                Soon
              </span>
            </span>
          </button>

          <Link
            href="/organisations"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/organisations")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Users className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/organisations") ? "font-semibold" : "font-medium"
              }`}
            >
              Organisations
            </span>
          </Link>

          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/60 cursor-not-allowed"
            disabled
            aria-disabled="true"
          >
            <Inbox className="h-5 w-5 flex-shrink-0 opacity-60" />
            <span className="flex items-center gap-2 truncate font-medium">
              <span>Requests</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-sidebar-border/60">
                Soon
              </span>
            </span>
          </button>

          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/60 cursor-not-allowed"
            disabled
            aria-disabled="true"
          >
            <Mic className="h-5 w-5 flex-shrink-0 opacity-60" />
            <span className="flex items-center gap-2 truncate font-medium">
              <span>Chat</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-sidebar-border/60">
                Soon
              </span>
            </span>
          </button>

          <button
            type="button"
            className="flex items-center space-x-3 px-3 py-2 rounded-md w-full text-sidebar-foreground/60 cursor-not-allowed"
            disabled
            aria-disabled="true"
          >
            <Database className="h-5 w-5 flex-shrink-0 opacity-60" />
            <span className="flex items-center gap-2 truncate font-medium">
              <span>Storage</span>
              <span className="text-[10px] uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-sidebar-border/60">
                Soon
              </span>
            </span>
          </button>

          {userAdmin ? (
            <Link
              href="/dashboard/admin/users"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
                isActive("/dashboard/admin/users")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Settings className="h-5 w-5 flex-shrink-0" />
              <span
                className={`truncate ${
                  isActive("/dashboard/admin/users")
                    ? "font-semibold"
                    : "font-medium"
                }`}
              >
                Manage
              </span>
            </Link>
          ) : null}
        </nav>

        {/* Footer - Sticky at bottom */}
        <div className="mt-auto p-4 border-t border-sidebar-border">
          <p className="text-xs text-sidebar-foreground/60 text-center">
            &copy; Rights Reserved Blairify
          </p>
        </div>
      </div>

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 bg-background/80 z-40 lg:hidden border-0 p-0 w-full h-full"
          onClick={() => setSidebarOpen(false)}
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              setSidebarOpen(false);
            }
          }}
          aria-label="Close sidebar"
        />
      )}
    </>
  );
}
