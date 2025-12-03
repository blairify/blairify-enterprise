"use client";

import Image from "next/image";
import Link from "next/link";
import { FaRegPaperPlane } from "react-icons/fa";
import { LuDatabaseZap } from "react-icons/lu";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";

interface LogoProps {
  variant?: "stacked" | "minimal";
  className?: string;
  repeatCount?: number;
  size?: "sm" | "md" | "lg" | "xl";
}

const DEFAULT_REPEAT_COUNT = 7;

export const LogoText = () => <>Blairify</>;

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
          <Button asChild className="w-full sm:w-auto">
            <Link href="/auth/signup">Register enterprise in beta system</Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/auth/signin">Log in</Link>
          </Button>
        </div>
      </section>

      <section className="mx-auto mt-16 px-4 sm:px-0 flex flex-col items-center justify-center gap-8">
        <div className="bg-card border border-border/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center max-w-sm">
          <div className="p-6 rounded-2xl">
            <Image
              src="/assets/mail.png"
              alt="Sales mail link"
              width={200}
              height={200}
              className="h-auto mx-auto"
            />
          </div>
        </div>
        <Button
          asChild
          type="button"
          className="w-60 sm:w-auto mb-10 bg-background text-primary py-2 border border-primary rounded-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:text-primary-foreground hover:-translate-y-0.5 flex items-center justify-center gap-2 text-md"
        >
          <a href="mailto:blairify.team@gmail.com">
            <FaRegPaperPlane className="w-5 h-5" />
            Contact Sales Team
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-4 bg-background dark:bg-card">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between max-w-4xl mx-auto px-4 sm:px-6 text-center sm:text-left">
          <Logo size="sm" />
          <Typography.Caption className="text-foreground text-sm">
            &copy; 2025 Blairify. All rights reserved.
          </Typography.Caption>
        </div>
      </footer>
    </div>
  );
}
