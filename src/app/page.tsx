"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Instagram, Linkedin } from "lucide-react";
import { FaRegPaperPlane } from "react-icons/fa";
import { SiX } from "react-icons/si";
import { LuDatabaseZap } from "react-icons/lu";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface LogoProps {
  variant?: "stacked" | "minimal";
  className?: string;
  repeatCount?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const DEFAULT_REPEAT_COUNT = 7;

const LogoText = () => <>Blairify</>;

function Logo({
  variant = "minimal",
  className = "",
  repeatCount = DEFAULT_REPEAT_COUNT,
  size = "md",
}: LogoProps) {
  const linkClasses =
    `!flex !flex-col !items-center !justify-center ${className}`.trim();
  const logoTextClasses =
    "!font-stretch-extra-expanded text-primary !font-extrabold";
  const sizeClass = (() => {
    switch (size) {
      case "sm":
        return "!text-xl";
      case "md":
        return "!text-2xl";
      case "lg":
        return "!text-4xl";
      case "xl":
        return "!text-6xl";
      default: {
        const _never: never = size;
        throw new Error(`Unhandled Logo size: ${_never}`);
      }
    }
  })();

  if (variant === "minimal") {
    return (
      <Link aria-label="Home" href="/" className={linkClasses}>
        <h1 className={`${logoTextClasses} ${sizeClass}`}>
          <LogoText />
        </h1>
      </Link>
    );
  }

  return (
    <Link aria-label="Home" href="/" className={linkClasses}>
      <div
        className={`${logoTextClasses} ${sizeClass} !flex !flex-col !items-center !justify-center !mx-auto`}
      >
        {Array.from({ length: repeatCount }, (_, i) => {
          const stableKey = `logo-element-${repeatCount}-position-${i + 1}`;
          return (
            <span key={stableKey}>
              <LogoText />
            </span>
          );
        })}
      </div>
    </Link>
  );
}

export default function ContactSalesPage() {
  const router = useRouter();
  const [pinDialogOpen, setPinDialogOpen] = useState(false);
  const [pinValue, setPinValue] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  const handlePinDialogOpenChange = (nextOpen: boolean) => {
    setPinDialogOpen(nextOpen);
    if (!nextOpen) {
      setPinValue("");
      setPinError(null);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-12 sm:pt-20 sm:pb-16 text-center">
        <Typography.Heading1 className="text-5xl sm:text-6xl md:text-6xl lg:text-7xl font-black mb-6 leading-tight max-w-3xl mx-auto">
          Scale with <Logo variant="minimal" size="lg" />
        </Typography.Heading1>

        <Typography.Body className="md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 sm:mb-12 leading-relaxed">
          Get enterprise-grade access with custom solutions, dedicated support,
          and advanced features tailored to your organization's needs.
        </Typography.Body>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-primary text-primary text-sm font-semibold mb-8 shadow-lg">
          <LuDatabaseZap className="h-4 w-4" />
          Enterprise Ready
        </div>
        <div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            type="button"
            className="w-full sm:w-auto"
            onClick={() => {
              setPinDialogOpen(true);
              setPinValue("");
              setPinError(null);
            }}
          >
            Register Enterprise
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/signin">Log in</Link>
          </Button>
        </div>
        <div className="mt-4 flex justify-center">
          <Button
            asChild
            type="button"
            className="w-full sm:w-auto bg-background text-primary py-2 border border-primary rounded-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:text-primary-foreground hover:-translate-y-0.5 flex items-center justify-center gap-2 text-md"
          >
            <a href="mailto:blairify.team@gmail.com">
              <FaRegPaperPlane className="w-5 h-5" />
              Contact Sales Team
            </a>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 bg-background dark:bg-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between max-w-4xl mx-auto px-4 sm:px-6 text-center sm:text-left">
          <Logo size="sm" />
          <div className="flex flex-col items-center gap-2 sm:items-end">
            <div className="flex items-center gap-4">
              <a
                href="https://www.instagram.com/blairtalk"
                aria-label="Blairify on Instagram"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://x.com/BlairifyTeam"
                aria-label="Blairify on X (Twitter)"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                <SiX className="h-5 w-5" />
              </a>
              <a
                href="https://www.linkedin.com/company/blairify"
                aria-label="Blairify on LinkedIn"
                target="_blank"
                rel="noreferrer"
                className="text-foreground/80 hover:text-primary transition-colors"
              >
                <Linkedin className="h-5 w-5" />
              </a>
            </div>
            <Typography.Caption className="text-foreground text-sm">
              &copy; 2025 Blairify. All rights reserved.
            </Typography.Caption>
          </div>
        </div>
      </footer>

      <Dialog open={pinDialogOpen} onOpenChange={handlePinDialogOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enter enterprise access PIN</DialogTitle>
            <DialogDescription>
              Enter the 6-digit PIN provided by the Blairify Sales team to
              register your enterprise.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();

              if (pinValue === "300820") {
                setPinError(null);
                setPinDialogOpen(false);
                router.push("/auth/signup?pin=300820");
                return;
              }

              setPinError("Incorrect PIN. Please try again.");
            }}
          >
            <div className="space-y-2 text-left">
              <Label htmlFor="enterprise-pin">Access PIN</Label>
              <Input
                id="enterprise-pin"
                type="password"
                inputMode="numeric"
                autoComplete="one-time-code"
                maxLength={6}
                value={pinValue}
                onChange={(event) => {
                  setPinValue(event.target.value);
                  if (pinError) {
                    setPinError(null);
                  }
                }}
              />
              {pinError ? (
                <p className="text-xs text-destructive">{pinError}</p>
              ) : null}
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => handlePinDialogOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Continue</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
