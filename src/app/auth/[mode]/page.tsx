import { redirect } from "next/navigation";

import { AuthShell } from "@/components/common/organisms/auth-shell";
import SigninForm from "../../signin/signin-form";
import SignupForm from "../../signup/signup-form";

type AuthMode = "signin" | "signup";

const ENTERPRISE_SIGNUP_PIN = "300820";

interface AuthPageProps {
  params: Promise<{
    mode: string;
  }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function normalizeAuthModeParam(modeParam: string): AuthMode {
  if (modeParam === "signin" || modeParam === "signup") {
    return modeParam;
  }

  redirect("/auth/signin");
}

export default async function AuthPage({
  params,
  searchParams,
}: AuthPageProps) {
  const resolvedParams = await params;
  const mode = normalizeAuthModeParam(resolvedParams.mode);

  if (mode === "signup") {
    const resolvedSearchParams = await searchParams;
    const rawPin = resolvedSearchParams.pin;
    const pin = Array.isArray(rawPin) ? rawPin[0] : rawPin;

    if (pin !== ENTERPRISE_SIGNUP_PIN) {
      redirect("/");
    }
  }

  const { title, description } = (() => {
    switch (mode) {
      case "signin":
        return {
          title: "Sign in to your account",
          description:
            "Enter your work email and password to access the dashboard.",
        };
      case "signup":
        return {
          title: "Create your enterprise account",
          description:
            "Set up your company and first admin user to access the dashboard.",
        };
      default: {
        const _never: never = mode;
        throw new Error(`Unhandled auth mode in content: ${_never}`);
      }
    }
  })();

  const Form = (() => {
    switch (mode) {
      case "signin":
        return SigninForm;
      case "signup":
        return SignupForm;
      default: {
        const _never: never = mode;
        throw new Error(`Unhandled auth mode in form: ${_never}`);
      }
    }
  })();

  return (
    <AuthShell mode={mode} title={title} description={description} key={mode}>
      <Form />
    </AuthShell>
  );
}
