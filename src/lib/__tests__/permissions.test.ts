import { describe, expect, it } from "@jest/globals";

import type { User } from "@/db/schema/auth";
import { hasPermission, requirePermission } from "../permissions";

function buildUser(overrides: Partial<User>): User {
  const now = new Date();
  return {
    id: "user-id",
    enterpriseId: "enterprise-id",
    email: "user@example.com",
    passwordHash: "hash",
    fullName: "Test User",
    jobTitle: "Role",
    role: "RECRUITER",
    createdAt: now,
    isActive: true,
    ...overrides,
  };
}

describe("permissions", () => {
  describe("manage_users", () => {
    it("allows enterprise admin", () => {
      const admin = buildUser({ role: "ENTERPRISE_ADMIN" });

      expect(hasPermission(admin, "manage_users")).toBe(true);
      expect(() => requirePermission(admin, "manage_users")).not.toThrow();
    });

    it("blocks recruiter", () => {
      const recruiter = buildUser({ role: "RECRUITER" });

      expect(hasPermission(recruiter, "manage_users")).toBe(false);
      expect(() => requirePermission(recruiter, "manage_users")).toThrow(
        /manage_users/,
      );
    });

    it("blocks read-only user", () => {
      const readOnly = buildUser({ role: "READ_ONLY" });

      expect(hasPermission(readOnly, "manage_users")).toBe(false);
      expect(() => requirePermission(readOnly, "manage_users")).toThrow(
        /manage_users/,
      );
    });
  });
});
