import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CreateOrganisationForm } from "@/app/dashboard/organisations/create-organisation-form";
import { OrganisationListTable } from "@/app/dashboard/organisations/organisation-list-table";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withEnterpriseDb } from "@/db/client";
import { organisations } from "@/db/schema/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Organisation Management | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function OrganisationsPage() {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_organisations");
  } catch {
    redirect("/build-interview");
  }

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  const enterpriseOrganisations = await withEnterpriseDb(
    auth.enterprise.id,
    async (tenantDb) =>
      tenantDb
        .select()
        .from(organisations)
        .where(eq(organisations.enterpriseId, auth.enterprise.id)),
  );

  return (
    <DashboardLayout
      userName={userName}
      userEmail={userEmail}
      enterpriseName={enterpriseName}
      canManageUsers={canManageUsers}
    >
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Add organisation</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateOrganisationForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing organisations</CardTitle>
          </CardHeader>
          <CardContent>
            <OrganisationListTable organisations={enterpriseOrganisations} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
