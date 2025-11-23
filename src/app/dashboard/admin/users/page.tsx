import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/dashboard/templates/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withEnterpriseDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

import { CreateUserForm } from "./create-user-form";
import { UserListTable } from "./user-list-table";

export const metadata: Metadata = {
  title: "User Management | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminUsersPage() {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_users");
  } catch {
    redirect("/dashboard");
  }

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;

  const enterpriseUsers = await withEnterpriseDb(
    auth.enterprise.id,
    async (tenantDb) =>
      tenantDb
        .select()
        .from(users)
        .where(eq(users.enterpriseId, auth.enterprise.id)),
  );

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add user to your enterprise</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateUserForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing users</CardTitle>
          </CardHeader>
          <CardContent>
            <UserListTable users={enterpriseUsers} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
