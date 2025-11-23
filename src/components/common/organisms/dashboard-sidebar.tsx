"use client";

import {
  Building2,
  Database,
  GitBranch,
  Home,
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
        className={`fixed inset-y-0 left-0 z-50 w-64 h-screen bg-sidebar text-sky-50 border-r border-sidebar-border transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col overflow-hidden`}
      >
        <div className="border-b border-border">
          <div className="px-4 h-16 flex items-center">
            <div className="flex items-center justify-between w-full">
              <Logo />

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
            href="/dashboard"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Home className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${isActive("/dashboard") ? "font-medium" : ""}`}
            >
              Dashboard
            </span>
          </Link>

          <Link
            href="/dashboard/organisations"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/organisations")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Building2 className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/organisations") ? "font-medium" : ""
              }`}
            >
              Organisations
            </span>
          </Link>

          <Link
            href="/dashboard/candidates"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/candidates")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <User className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/candidates") ? "font-medium" : ""
              }`}
            >
              Candidates
            </span>
          </Link>

          <Link
            href="/dashboard/flows"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/flows")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <GitBranch className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/flows") ? "font-medium" : ""
              }`}
            >
              My flows
            </span>
          </Link>

          <Link
            href="/dashboard/test-interview"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/test-interview")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Mic className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/test-interview") ? "font-medium" : ""
              }`}
            >
              Test interview
            </span>
          </Link>

          <Link
            href="/dashboard/requests"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/requests")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Inbox className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/requests") ? "font-medium" : ""
              }`}
            >
              Requests
            </span>
          </Link>

          <Link
            href="/dashboard/chat"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/chat")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <MessageSquare className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/chat") ? "font-medium" : ""
              }`}
            >
              Chat
            </span>
          </Link>

          <Link
            href="/dashboard/settings"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/settings")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Settings className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/settings") ? "font-medium" : ""
              }`}
            >
              Settings
            </span>
          </Link>

          <Link
            href="/dashboard/storage"
            className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
              isActive("/dashboard/storage")
                ? "bg-sidebar-primary text-sidebar-primary-foreground"
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            }`}
          >
            <Database className="h-5 w-5 flex-shrink-0" />
            <span
              className={`truncate ${
                isActive("/dashboard/storage") ? "font-medium" : ""
              }`}
            >
              Storage
            </span>
          </Link>

          {userAdmin ? (
            <Link
              href="/dashboard/admin/users"
              className={`flex items-center space-x-3 px-3 py-2 rounded-md transition-colors w-full ${
                isActive("/dashboard/admin/users")
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              }`}
            >
              <Users className="h-5 w-5 flex-shrink-0" />
              <span
                className={`truncate ${
                  isActive("/dashboard/admin/users") ? "font-medium" : ""
                }`}
              >
                Manage users
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
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden border-0 p-0 w-full h-full"
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
