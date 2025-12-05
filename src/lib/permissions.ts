import "server-only";

import type { User } from "@/db/schema/auth";

export type AppPermissionKey =
  | "manage_users"
  | "manage_jobs"
  | "manage_candidates"
  | "view_reports"
  | "manage_organisations";

const ROLE_PERMISSIONS: Record<User["role"], AppPermissionKey[]> = {
  ENTERPRISE_ADMIN: [
    "manage_users",
    "manage_jobs",
    "manage_candidates",
    "view_reports",
    "manage_organisations",
  ],
  RECRUITER: ["manage_jobs", "manage_candidates", "manage_organisations"],
  READ_ONLY: ["view_reports"],
};

export function hasPermission(
  user: User,
  permission: AppPermissionKey,
): boolean {
  return ROLE_PERMISSIONS[user.role].includes(permission);
}

export function requirePermission(
  user: User,
  permission: AppPermissionKey,
): void {
  if (!hasPermission(user, permission)) {
    throw new Error(`Forbidden: missing permission ${permission}`);
  }
}
