import Link from "next/link";
import type { ReactNode } from "react";

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
          href: "/auth/signup",
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
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl grid gap-10 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] items-center">
        <section className="space-y-8">
          <div className="inline-flex items-center rounded-full border border-border/60 bg-background/60 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
            {mode === "signin" ? "Enterprise access" : "Get started in minutes"}
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-xl">
              {description}
            </p>
          </div>

          <ul className="space-y-3 text-sm sm:text-base text-muted-foreground max-w-xl">
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary" />
              <span>Multi-tenant, enterprise-ready interview workflows.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/80" />
              <span>Granular access control for your hiring team.</span>
            </li>
            <li className="flex gap-3">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary/70" />
              <span>
                Audit-ready activity tracking across candidates and flows.
              </span>
            </li>
          </ul>
        </section>

        <section className="w-full max-w-md justify-self-center">
          <Card className="border-border bg-card/95 shadow-2xl backdrop-blur">
            <CardHeader className="space-y-2 text-left">
              <CardTitle className="text-xl sm:text-2xl font-semibold tracking-tight">
                {mode === "signin" ? "Sign in" : "Create account"}
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                {mode === "signin"
                  ? "Use your work email to access your Blairify Enterprise workspace."
                  : "Set up your first admin and enterprise workspace in a few steps."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-2 pb-6">
              <div className="space-y-6">{children}</div>
              <p className="mt-6 text-center text-sm text-muted-foreground">
                <span className="mr-1">{opposite.prompt}</span>
                <Link
                  href={opposite.href}
                  className="text-primary hover:underline focus-visible:underline focus-visible:outline-none"
                >
                  {opposite.label}
                </Link>
              </p>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
