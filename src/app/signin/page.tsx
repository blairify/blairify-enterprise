import SigninForm from "./signin-form";

export default async function SigninPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="w-full max-w-md rounded-xl border bg-card/80 p-8 shadow-lg backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Sign in to your account
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your work email and password to access the dashboard.
          </p>
        </div>
        <SigninForm />
      </div>
    </div>
  );
}
