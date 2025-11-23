import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card/80 p-8 shadow-lg backdrop-blur">
        <h1 className="mb-4 text-center text-2xl font-semibold tracking-tight">
          Sign out
        </h1>
        <p className="mb-6 text-center text-sm text-muted-foreground">
          You can sign out of your Blairify Enterprise account below.
        </p>
        <form action={logoutAction} className="space-y-4">
          <Button type="submit" variant="destructive" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
