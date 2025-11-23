import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { withEnterpriseDb } from "@/db/client";
import { users } from "@/db/schema/auth";
import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import { signupRequestExample } from "@/lib/validation/blairify-auth";

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

describe("multi-tenancy RLS", () => {
  it("withEnterpriseDb scopes users by enterprise", async () => {
    const suffix = uniqueSuffix();

    const domainA = `enterprise-a-${suffix}.example.com`;
    const domainB = `enterprise-b-${suffix}.example.com`;

    const emailA = `admin-a-${suffix}@${domainA}`;
    const emailB = `admin-b-${suffix}@${domainB}`;

    const signupA = {
      ...signupRequestExample,
      email: emailA,
      companyDomain: domainA,
    };

    const signupB = {
      ...signupRequestExample,
      email: emailB,
      companyDomain: domainB,
    };

    const resultA = await signupEnterpriseAdmin(signupA);

    if (!resultA.ok) {
      throw new Error(`Signup A failed: ${resultA.error}`);
    }

    const enterpriseA = resultA.value.enterprise;
    const userA = resultA.value.user;

    const resultB = await signupEnterpriseAdmin(signupB);

    if (!resultB.ok) {
      throw new Error(`Signup B failed: ${resultB.error}`);
    }

    const enterpriseB = resultB.value.enterprise;
    const userB = resultB.value.user;

    const usersForA = await withEnterpriseDb(enterpriseA.id, async (tenantDb) =>
      tenantDb
        .select()
        .from(users)
        .where(eq(users.enterpriseId, enterpriseA.id)),
    );

    const usersForB = await withEnterpriseDb(enterpriseB.id, async (tenantDb) =>
      tenantDb
        .select()
        .from(users)
        .where(eq(users.enterpriseId, enterpriseB.id)),
    );

    const idsForA = usersForA.map((user) => user.id);
    const idsForB = usersForB.map((user) => user.id);

    expect(idsForA).toContain(userA.id);
    expect(idsForA).not.toContain(userB.id);

    expect(idsForB).toContain(userB.id);
    expect(idsForB).not.toContain(userA.id);
  });
});
