import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import Logo from "@/components/common/atoms/logo-blairify";
import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AuthShellProps {
  mode: "signin" | "signup";
  title: string;
  description: string;
  children: ReactNode;
}

export function AuthShell({
  mode,
  title,
  description,
  children,
}: AuthShellProps) {
  const opposite = (() => {
    switch (mode) {
      case "signin":
        return {
          prompt: "Don't have an account?",
          label: "Sign up",
          href: "/auth/signup?pin=300820",
        } as const;
      case "signup":
        return {
          prompt: "Already have an account?",
          label: "Log in",
          href: "/auth/signin",
        } as const;
      default: {
        const _never: never = mode;
        throw new Error(`Unhandled auth mode in AuthShell: ${_never}`);
      }
    }
  })();

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-3">
      <div className="w-full max-w-5xl">
        <Card className="md:hidden w-full rounded-3xl border border-border/60 bg-card/95 shadow-2xl backdrop-blur py-4 gap-4">
          <CardHeader className="space-y-3 px-4">
            <div className="flex items-center justify-between">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-1 text-xs bg-background/60 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-background/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Link href="/">
                  <span aria-hidden="true">←</span> Back to home
                </Link>
              </Button>
              <Logo variant="iconOnly" className="opacity-80" iconSize={18} />
            </div>

            <div className="text-center">
              <CardTitle className="text-xl">{title}</CardTitle>
              <CardDescription className="text-sm">
                {description}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="px-4">
            <div className="space-y-6">{children}</div>
            <Typography.Body className="mt-6 text-center text-sm text-muted-foreground">
              <span className="mr-1">{opposite.prompt}</span>
              <Link
                href={opposite.href}
                className="text-primary hover:underline focus-visible:underline focus-visible:outline-none"
              >
                {opposite.label}
              </Link>
            </Typography.Body>
          </CardContent>
        </Card>

        <div className="hidden md:grid w-full grid-cols-2 rounded-3xl overflow-hidden border border-border/60 shadow-2xl">
          <div className="flex flex-col items-center justify-center bg-[hsl(var(--blairify-bg-200))] text-foreground relative min-h-[32rem]">
            <div className="relative w-56 h-56">
              <Image
                src="/icon0.svg"
                alt="Blairify logo"
                fill
                priority
                className="object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="w-full bg-card p-6 sm:p-10 flex flex-col justify-center min-h-[32rem]">
            <div className="flex justify-end mb-4">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className="gap-2 text-xs border border-border/60 text-muted-foreground hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <Link href="/">
                  <span aria-hidden="true">←</span> Back to home
                </Link>
              </Button>
            </div>

            <div className="text-center">
              <Typography.Heading1 className="text-2xl font-semibold text-foreground">
                {title}
              </Typography.Heading1>
              <Typography.Body className="text-sm text-muted-foreground">
                {description}
              </Typography.Body>
            </div>

            <div className="mt-6 flex-1 flex flex-col">
              <div className="space-y-6">{children}</div>
              <Typography.Body className="mt-6 text-center text-sm text-muted-foreground">
                <span className="mr-1">{opposite.prompt}</span>
                <Link
                  href={opposite.href}
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {opposite.label}
                </Link>
              </Typography.Body>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
