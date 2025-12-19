import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { logoutAction } from "./actions";

export default function LogoutPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm rounded-xl border bg-card/80 p-8 shadow-lg backdrop-blur">
        <Typography.Heading1 className="mb-4 text-center text-2xl font-semibold tracking-tight">
          Sign out
        </Typography.Heading1>
        <Typography.Body className="mb-6 text-center text-sm text-muted-foreground">
          You can sign out of your Blairify Enterprise account below.
        </Typography.Body>
        <form action={logoutAction} className="space-y-4">
          <Button type="submit" variant="destructive" className="w-full">
            Sign out
          </Button>
        </form>
      </div>
    </div>
  );
}
