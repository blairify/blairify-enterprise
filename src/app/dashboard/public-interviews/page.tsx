import Link from "next/link";
import { Typography } from "@/components/common/atoms/typography";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { hasPermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";
import { getPublicInterviewLinksForEnterprise } from "./actions";
import { PublicInterviewLinksTable } from "./public-interview-links-table";

export const metadata = {
  title: "Public interviews | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicInterviewsPage() {
  const auth = await requireAuth();

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  const links = await getPublicInterviewLinksForEnterprise();
  const rows = links.map((link) => ({
    id: link.id,
    title: link.title,
    publicId: link.publicId,
    publicPath: `/i/${link.publicId}`,
    createdAtLabel: link.createdAt.toLocaleString(),
  }));

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <Card>
        <CardHeader className="space-y-2">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle>Public interview links</CardTitle>
              <Typography.SubCaption className="mt-1 text-xs text-muted-foreground">
                Share one link per job. Track candidates and edit the question
                bank.
              </Typography.SubCaption>
            </div>
            <Link
              href="/build-interview"
              className="text-sm font-medium underline underline-offset-4"
            >
              Create new link
            </Link>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {rows.length === 0 ? (
            <Typography.Body className="text-sm text-muted-foreground">
              No links yet.
            </Typography.Body>
          ) : (
            <PublicInterviewLinksTable links={rows} />
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
}
