import { describe, expect, it } from "@jest/globals";
import { eq } from "drizzle-orm";

import { withEnterpriseDb } from "@/db/client";
import type { User } from "@/db/schema/auth";
import { organisations } from "@/db/schema/auth";
import { signupEnterpriseAdmin } from "@/lib/blairify-auth-service";
import { createOrganisation } from "@/lib/organisations-service";
import { requirePermission } from "@/lib/permissions";
import { signupRequestExample } from "@/lib/validation/blairify-auth";

function uniqueSuffix(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

describe("organisations service", () => {
  it("scopes organisations by enterprise when using withEnterpriseDb", async () => {
    const suffix = uniqueSuffix();

    const domainA = `enterprise-org-a-${suffix}.example.com`;
    const domainB = `enterprise-org-b-${suffix}.example.com`;

    const emailA = `admin-org-a-${suffix}@${domainA}`;
    const emailB = `admin-org-b-${suffix}@${domainB}`;

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

    const resultB = await signupEnterpriseAdmin(signupB);

    if (!resultB.ok) {
      throw new Error(`Signup B failed: ${resultB.error}`);
    }

    const enterpriseB = resultB.value.enterprise;

    const orgName = `Engineering-${suffix}`;

    const createdA = await createOrganisation(enterpriseA.id, {
      name: orgName,
      description: "Engineering org for enterprise A",
    });

    if (!createdA.ok) {
      throw new Error(`Create organisation A failed: ${createdA.error}`);
    }

    const createdB = await createOrganisation(enterpriseB.id, {
      name: orgName,
      description: "Engineering org for enterprise B",
    });

    if (!createdB.ok) {
      throw new Error(`Create organisation B failed: ${createdB.error}`);
    }

    const orgsForA = await withEnterpriseDb(enterpriseA.id, async (tenantDb) =>
      tenantDb
        .select()
        .from(organisations)
        .where(eq(organisations.name, orgName)),
    );

    const orgsForB = await withEnterpriseDb(enterpriseB.id, async (tenantDb) =>
      tenantDb
        .select()
        .from(organisations)
        .where(eq(organisations.name, orgName)),
    );

    const scopedCorrectly =
      orgsForA.some((org) => org.enterpriseId === enterpriseA.id) &&
      orgsForB.some((org) => org.enterpriseId === enterpriseB.id);

    expect(scopedCorrectly).toBe(true);
  });

  it("rejects duplicate organisation name within the same enterprise", async () => {
    const suffix = uniqueSuffix();

    const domain = `enterprise-org-dup-${suffix}.example.com`;
    const email = `admin-org-dup-${suffix}@${domain}`;

    const signupInput = {
      ...signupRequestExample,
      email,
      companyDomain: domain,
    };

    const signupResult = await signupEnterpriseAdmin(signupInput);

    if (!signupResult.ok) {
      throw new Error(`Signup failed: ${signupResult.error}`);
    }

    const enterprise = signupResult.value.enterprise;

    const orgName = `Sales-${suffix}`;

    const first = await createOrganisation(enterprise.id, {
      name: orgName,
      description: "Sales org",
    });

    if (!first.ok) {
      throw new Error(`First organisation creation failed: ${first.error}`);
    }

    const second = await createOrganisation(enterprise.id, {
      name: orgName,
      description: "Duplicate sales org",
    });

    const duplicateRejected =
      !second.ok && second.error === "ORGANISATION_NAME_EXISTS";

    expect(duplicateRejected).toBe(true);
  });

  it("does not grant manage_organisations to READ_ONLY users", () => {
    const readonlyUser: User = {
      id: "00000000-0000-0000-0000-000000000000",
      enterpriseId: "00000000-0000-0000-0000-000000000001",
      email: "read.only@example.com",
      passwordHash: "test-hash",
      fullName: "Read Only User",
      jobTitle: "Viewer",
      role: "READ_ONLY",
      createdAt: new Date(),
      isActive: true,
    };

    let threw = false;

    try {
      requirePermission(readonlyUser, "manage_organisations");
    } catch {
      threw = true;
    }

    expect(threw).toBe(true);
  });
});
