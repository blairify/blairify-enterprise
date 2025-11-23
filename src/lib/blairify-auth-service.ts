import "server-only";

import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import type { Enterprise, User } from "@/db/schema/auth";
import { enterprises, users } from "@/db/schema/auth";
import { createSession } from "@/lib/session";
import type {
  CreateEnterpriseUserRequest,
  SigninRequest,
  SignupRequest,
} from "@/lib/validation/blairify-auth";

export type SignupResult = {
  enterprise: Enterprise;
  user: User;
};

export type SigninResult = {
  enterprise: Enterprise;
  user: User;
};

export type SignupServiceError =
  | "ENTERPRISE_DOMAIN_EXISTS"
  | "EMAIL_ALREADY_EXISTS";

export type SigninServiceError =
  | "INVALID_EMAIL_DOMAIN"
  | "INVALID_CREDENTIALS"
  | "USER_INACTIVE";

export type SignupServiceResponse =
  | { ok: true; value: SignupResult }
  | { ok: false; error: SignupServiceError; message: string };

export type SigninServiceResponse =
  | { ok: true; value: SigninResult }
  | { ok: false; error: SigninServiceError; message: string };

export type CreateUserServiceError = "EMAIL_ALREADY_EXISTS";

export type CreateUserServiceResponse =
  | { ok: true; value: User }
  | { ok: false; error: CreateUserServiceError; message: string };

export async function signupEnterpriseAdmin(
  input: SignupRequest,
): Promise<SignupServiceResponse> {
  const existingEnterprise = await db
    .select({ id: enterprises.id })
    .from(enterprises)
    .where(eq(enterprises.domain, input.companyDomain))
    .limit(1);

  if (existingEnterprise.length > 0) {
    return {
      ok: false,
      error: "ENTERPRISE_DOMAIN_EXISTS",
      message: "An enterprise with this domain already exists.",
    };
  }

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, input.email.toLowerCase()))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      ok: false,
      error: "EMAIL_ALREADY_EXISTS",
      message: "A user with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const { enterprise, user } = await db.transaction(async (tx) => {
    const [enterpriseRow] = await tx
      .insert(enterprises)
      .values({
        name: input.companyName,
        domain: input.companyDomain,
      })
      .returning();

    if (!enterpriseRow) {
      throw new Error("Failed to create enterprise");
    }

    const [userRow] = await tx
      .insert(users)
      .values({
        enterpriseId: enterpriseRow.id,
        email: input.email.toLowerCase(),
        passwordHash,
        fullName: input.fullName,
        jobTitle: input.jobTitle,
        role: "ENTERPRISE_ADMIN",
      })
      .returning();

    if (!userRow) {
      throw new Error("Failed to create user");
    }

    return { enterprise: enterpriseRow, user: userRow };
  });

  await createSession(user);

  return { ok: true, value: { enterprise, user } };
}

export async function signinUser(
  input: SigninRequest,
): Promise<SigninServiceResponse> {
  const email = input.email.toLowerCase();

  const rows = await db
    .select({ user: users, enterprise: enterprises })
    .from(users)
    .innerJoin(enterprises, eq(users.enterpriseId, enterprises.id))
    .where(eq(users.email, email))
    .limit(1);

  const row = rows[0];

  if (!row || !row.user.isActive) {
    return {
      ok: false,
      error: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  const passwordMatches = await bcrypt.compare(
    input.password,
    row.user.passwordHash,
  );

  if (!passwordMatches) {
    return {
      ok: false,
      error: "INVALID_CREDENTIALS",
      message: "Invalid email or password.",
    };
  }

  await createSession(row.user);

  return {
    ok: true,
    value: { enterprise: row.enterprise, user: row.user },
  };
}

export async function createEnterpriseUser(
  enterpriseId: string,
  input: CreateEnterpriseUserRequest,
): Promise<CreateUserServiceResponse> {
  const email = input.email.toLowerCase();

  const existingUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existingUser.length > 0) {
    return {
      ok: false,
      error: "EMAIL_ALREADY_EXISTS",
      message: "A user with this email already exists.",
    };
  }

  const passwordHash = await bcrypt.hash(input.password, 10);

  const [user] = await db
    .insert(users)
    .values({
      enterpriseId,
      email,
      passwordHash,
      fullName: input.fullName,
      jobTitle: input.jobTitle,
      role: input.role,
    })
    .returning();

  if (!user) {
    throw new Error("Failed to create user");
  }

  return { ok: true, value: user };
}
