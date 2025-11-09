/**
 * Database client wrapper with automatic tenant context
 * Automatically sets RLS session variables from request headers
 */

import { PrismaClient } from "@prisma/client";
import { headers } from "next/headers";
import { setTenantContext } from "./session-context";

/**
 * Get tenant context from Next.js headers
 * This works in Server Components, API Routes, and Server Actions
 */
async function getTenantContextFromRequest(): Promise<{
  enterpriseId: string | null;
  organizationId: string | null;
}> {
  const headersList = await headers();
  
  const enterpriseId = headersList.get("x-enterprise-id");
  const organizationId = 
    headersList.get("x-organization-id") || 
    headersList.get("x-organisation-id"); // Support both spellings
  
  return {
    enterpriseId,
    organizationId,
  };
}

/**
 * Singleton Prisma client instance
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const basePrisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = basePrisma;
}

/**
 * Database client with automatic tenant context
 * 
 * This wrapper automatically sets tenant context from request headers
 * before executing any query. Use this in API routes and Server Components.
 * 
 * @example
 * ```typescript
 * // In an API route
 * import { db } from "@/lib/db/client";
 * 
 * export async function GET() {
 *   // Tenant context is automatically set from headers
 *   const jobs = await db.jobListing.findMany();
 *   return Response.json({ jobs });
 * }
 * ```
 * 
 * @example
 * ```typescript
 * // In a Server Component
 * import { db } from "@/lib/db/client";
 * 
 * export default async function JobsPage() {
 *   // Tenant context is automatically set
 *   const jobs = await db.jobListing.findMany();
 *   return <div>{jobs.map(job => ...)}</div>;
 * }
 * ```
 */
export const db = new Proxy(basePrisma, {
  get(target, prop, receiver) {
    const original = Reflect.get(target, prop, receiver);
    
    // If it's a model (e.g., db.user, db.jobListing)
    if (typeof original === "object" && original !== null) {
      return new Proxy(original, {
        get(modelTarget, modelProp, modelReceiver) {
          const modelMethod = Reflect.get(modelTarget, modelProp, modelReceiver);
          
          // If it's a query method (findMany, create, update, etc.)
          if (typeof modelMethod === "function") {
            return async (...args: unknown[]) => {
              // Get tenant context from headers
              const { enterpriseId, organizationId } = await getTenantContextFromRequest();
              
              // Set tenant context if we have an enterprise ID
              if (enterpriseId) {
                await setTenantContext(target, enterpriseId, organizationId || undefined);
              }
              
              // Execute the original method
              return modelMethod.apply(modelTarget, args);
            };
          }
          
          return modelMethod;
        },
      });
    }
    
    // For non-model methods (like $transaction, $executeRaw, etc.)
    if (typeof original === "function") {
      return async (...args: unknown[]) => {
        // Get tenant context from headers
        const { enterpriseId, organizationId } = await getTenantContextFromRequest();
        
        // Set tenant context if we have an enterprise ID
        if (enterpriseId) {
          await setTenantContext(target, enterpriseId, organizationId || undefined);
        }
        
        // Execute the original method
        return original.apply(target, args);
      };
    }
    
    return original;
  },
});

/**
 * Raw Prisma client without automatic tenant context
 * Use this when you need to bypass tenant isolation (e.g., system operations)
 * 
 * @example
 * ```typescript
 * // System-level operation (no tenant context)
 * import { rawDb } from "@/lib/db/client";
 * 
 * const allEnterprises = await rawDb.enterprise.findMany();
 * ```
 */
export const rawDb = basePrisma;

/**
 * Execute a database transaction with automatic tenant context
 * 
 * @example
 * ```typescript
 * import { dbTransaction } from "@/lib/db/client";
 * 
 * const result = await dbTransaction(async (tx) => {
 *   // Tenant context is automatically set
 *   const user = await tx.user.create({ ... });
 *   const job = await tx.jobListing.create({ ... });
 *   return { user, job };
 * });
 * ```
 */
export async function dbTransaction<T>(
  callback: (tx: Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">) => Promise<T>
): Promise<T> {
  // Get tenant context from headers
  const { enterpriseId, organizationId } = await getTenantContextFromRequest();
  
  return basePrisma.$transaction(async (tx) => {
    // Set tenant context within the transaction
    if (enterpriseId) {
      await setTenantContext(tx, enterpriseId, organizationId || undefined);
    }
    
    // Execute the callback
    return callback(tx);
  });
}

/**
 * Type-safe database client
 * Export the type for use in function signatures
 */
export type Database = typeof db;
