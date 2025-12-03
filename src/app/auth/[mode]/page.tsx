import { redirect } from "next/navigation";

import { AuthShell } from "@/components/common/organisms/auth-shell";
import SigninForm from "../../signin/signin-form";
import SignupForm from "../../signup/signup-form";

type AuthMode = "signin" | "signup";

interface AuthPageProps {
  params: Promise<{
    mode: string;
  }>;
}

function normalizeAuthModeParam(modeParam: string): AuthMode {
  if (modeParam === "signin" || modeParam === "signup") {
    return modeParam;
  }

  redirect("/auth/signin");
}

export default async function AuthPage({ params }: AuthPageProps) {
  const resolvedParams = await params;
  const mode = normalizeAuthModeParam(resolvedParams.mode);

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
