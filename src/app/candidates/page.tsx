import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { CandidateListTable } from "@/app/dashboard/candidates/candidate-list-table";
import { CreateCandidateForm } from "@/app/dashboard/candidates/create-candidate-form";
import { DashboardLayout } from "@/components/dashboard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { withEnterpriseDb } from "@/db/client";
import { candidates } from "@/db/schema/auth";
import { hasPermission, requirePermission } from "@/lib/permissions";
import { requireAuth } from "@/lib/server-auth";

export const metadata: Metadata = {
  title: "Candidates | Blairify Enterprise",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function CandidatesPage() {
  const auth = await requireAuth();

  try {
    requirePermission(auth.user, "manage_candidates");
  } catch {
    redirect("/build-interview");
  }

  const userName = auth.user.fullName;
  const userEmail = auth.user.email;
  const enterpriseName = auth.enterprise.name;
  const canManageUsers = hasPermission(auth.user, "manage_users");

  const enterpriseCandidates = await withEnterpriseDb(
    auth.enterprise.id,
    async (tenantDb) =>
      tenantDb
        .select()
        .from(candidates)
        .where(eq(candidates.enterpriseId, auth.enterprise.id)),
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
            <CardTitle>Add candidate</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateCandidateForm />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Existing candidates</CardTitle>
          </CardHeader>
          <CardContent>
            <CandidateListTable candidates={enterpriseCandidates} />
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
