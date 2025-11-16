import SignupForm from "./signup-form";

export default async function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 px-4">
      <div className="w-full max-w-xl rounded-xl border bg-card/80 p-8 shadow-lg backdrop-blur">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">
            Create your enterprise account
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up your company and first admin user to access the dashboard.
          </p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
