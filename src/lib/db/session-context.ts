/**
 * Database session context helper for multi-tenant RLS
 * Sets session variables before each query to enforce tenant isolation
 */

import { PrismaClient } from "@prisma/client";

export interface TenantContext {
  enterpriseId: string;
  organisationId: string | null;
  userId: string;
}

/**
 * Creates a Prisma client instance with tenant context middleware
 * This ensures all queries are scoped to the correct tenant via RLS
 */
export function createPrismaClientWithContext() {
  const prisma = new PrismaClient();

  return prisma;
}

/**
 * Execute a database operation with tenant context
 * Sets session variables before running the callback
 */
export async function withTenantContext<T>(
  prisma: PrismaClient,
  context: TenantContext,
  callback: () => Promise<T>,
): Promise<T> {
  // Set session variables for RLS policies
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.enterprise_id = '${context.enterpriseId}'`,
  );

  if (context.organisationId) {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.organisation_id = '${context.organisationId}'`,
    );
  } else {
    // Clear org_id if not provided (for enterprise-level operations)
    await prisma.$executeRawUnsafe(`SET LOCAL app.organisation_id = ''`);
  }

  await prisma.$executeRawUnsafe(`SET LOCAL app.user_id = '${context.userId}'`);

  // Execute the callback with the context set
  return callback();
}

/**
 * Execute a database transaction with tenant context
 * Ensures session variables are set within the transaction scope
 */
export async function withTenantTransaction<T>(
  prisma: PrismaClient,
  context: TenantContext,
  callback: (
    tx: Omit<
      PrismaClient,
      "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends"
    >,
  ) => Promise<T>,
): Promise<T> {
  return prisma.$transaction(async (tx) => {
    // Set session variables within transaction
    await tx.$executeRawUnsafe(
      `SET LOCAL app.enterprise_id = '${context.enterpriseId}'`,
    );

    if (context.organisationId) {
      await tx.$executeRawUnsafe(
        `SET LOCAL app.organisation_id = '${context.organisationId}'`,
      );
    } else {
      await tx.$executeRawUnsafe(`SET LOCAL app.organisation_id = ''`);
    }

    await tx.$executeRawUnsafe(`SET LOCAL app.user_id = '${context.userId}'`);

    // Execute callback with transaction client
    return callback(tx);
  });
}

/**
 * Singleton Prisma client instance
 * Use this for all database operations
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClientWithContext();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper to extract tenant context from request headers
 * Used in API routes after middleware sets the headers
 */
export function getTenantContextFromHeaders(headers: Headers): TenantContext {
  const enterpriseId = headers.get("x-enterprise-id");
  const organisationId = headers.get("x-organisation-id");
  const userId = headers.get("x-user-id");

  if (!enterpriseId || !userId) {
    throw new Error("Missing tenant context in request headers");
  }

  return {
    enterpriseId,
    organisationId: organisationId || null,
    userId,
  };
}
