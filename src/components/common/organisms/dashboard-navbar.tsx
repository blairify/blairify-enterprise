"use client";

import { LogOut, Menu } from "lucide-react";
import Link from "next/link";
import { logoutAction } from "@/app/logout/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { AvatarIconDisplay } from "../atoms/avatar-icon-selector";
import { ThemeToggle } from "../atoms/theme-toggle";

interface DashboardNavbarProps {
  setSidebarOpen: (open: boolean) => void;
  userName: string;
  userEmail: string;
  enterpriseName: string;
}

export default function DashboardNavbar({
  setSidebarOpen,
  userName,
  userEmail,
  enterpriseName,
}: DashboardNavbarProps) {
  return (
    <TooltipProvider>
      <nav className="relative z-40 border-b border-border lg:bg-card/50 backdrop-blur-sm">
        <div className="px-4 h-16 flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="bg-transparent border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors lg:hidden"
              data-testid="mobile-menu-button"
            >
              <Menu className="h-5 w-5" />
            </Button>

            <div className="flex items-center space-x-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link aria-label="View Profile" href="/profile">
                    <div className="size-8 rounded-full hover:ring-2 hover:ring-primary/20 transition-all cursor-pointer">
                      <AvatarIconDisplay
                        iconId="icon-1"
                        size="sm"
                        className="size-8"
                      />
                    </div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View Profile</p>
                </TooltipContent>
              </Tooltip>

              <div className="flex flex-col">
                <span className="text-sm font-medium leading-tight">
                  {userName || userEmail}
                </span>
                <span className="text-xs text-muted-foreground leading-tight">
                  {enterpriseName}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Tooltip>
              <TooltipTrigger asChild>
                <form action={logoutAction}>
                  <Button
                    type="submit"
                    variant="outline"
                    size="icon"
                    className="border border-border/80 text-foreground hover:bg-muted/60 hover:text-foreground transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </form>
              </TooltipTrigger>
              <TooltipContent>
                <p>Sign Out</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </nav>
    </TooltipProvider>
  );
}
