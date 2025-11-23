"use client";

import Image from "next/image";
import Link from "next/link";
import { FaRegPaperPlane } from "react-icons/fa";
import {
  LuChartSpline,
  LuDatabaseZap,
  LuShield,
  LuUsers,
} from "react-icons/lu";
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
    "!font-stretch-extra-expanded text-black !font-extrabold dark:text-white";
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
  const features = [
    {
      icon: LuDatabaseZap,
      title: "Enterprise Solutions",
      desc: "Tailored packages for large organizations",
    },
    {
      icon: LuUsers,
      title: "Dedicated Support",
      desc: "Priority assistance from our expert team",
    },
    {
      icon: LuChartSpline,
      title: "Advanced Features",
      desc: "Unlock premium capabilities and integrations",
    },
    {
      icon: LuShield,
      title: "Enhanced Security",
      desc: "Enterprise-grade protection for your data",
    },
  ];

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
      </section>
      <section className="w-full dark:bg-[#262624] bg-white mx-auto border-y border-muted-foreground/40">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid gap-5 sm:gap-6 grid-cols-2 lg:grid-cols-4 dark:bg-[#262624]">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-primary-foreground p-4 sm:p-6 rounded-2xl border border-border hover:shadow-xl transition-all hover:-translate-y-1 dark:bg-[#262624] dark:border-primary"
            >
              <feature.icon className="size-8 mb-4 mx-auto dark:text-primary" />
              <Typography.Body
                color="secondary"
                className="mb-2 px-2 text-center dark:text-primary"
              >
                {feature.title}
              </Typography.Body>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-16 px-4 sm:px-0 flex flex-col items-center justify-center gap-8">
        <div className="bg-white border border-muted-foreground/40 rounded-2xl shadow-2xl overflow-hidden flex flex-col items-center justify-center max-w-sm">
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
          className="w-60 sm:w-auto mb-10 bg-background text-primary py-2 border border-primary rounded-lg hover:bg-primary/90 transition-all hover:shadow-xl hover:text-white hover:-translate-y-0.5 flex items-center justify-center gap-2 text-md"
        >
          <a href="mailto:blairify.team@gmail.com">
            <FaRegPaperPlane className="w-5 h-5" />
            Contact Sales Team
          </a>
        </Button>
      </section>

      {/* Footer */}
      <footer className="border-t border-muted-foreground/40 py-4 bg-background dark:bg-[#262624]">
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
