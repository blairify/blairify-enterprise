# Tenant Context Usage Guide

## Overview

The `setTenantContext` function sets PostgreSQL session variables that Row Level Security (RLS) policies use to enforce multi-tenant data isolation.

## Function Signature

```typescript
async function setTenantContext<T>(
  db: T,
  enterpriseId: string,
  organizationId?: string
): Promise<T>
```

## How It Works

When called, it executes these PostgreSQL commands:

```sql
SET LOCAL app.enterprise_id = '<enterpriseId>';
SET LOCAL app.organization_id = '<organizationId>'; -- if provided
```

All subsequent queries in the same transaction/connection will be filtered by RLS policies using these values.

## Usage Examples

### Example 1: Simple API Route

```typescript
import { prisma, setTenantContext } from "@/lib/db/session-context";

export async function GET(request: Request) {
  const enterpriseId = request.headers.get("x-enterprise-id");
  const orgId = request.headers.get("x-organization-id");
  
  // Set tenant context
  await setTenantContext(prisma, enterpriseId!, orgId || undefined);
  
  // All queries are now automatically filtered by RLS
  const jobs = await prisma.jobListing.findMany();
  
  return Response.json({ jobs });
}
```

### Example 2: Within a Transaction

```typescript
import { prisma, setTenantContext } from "@/lib/db/session-context";

export async function POST(request: Request) {
  const { enterpriseId, orgId } = await request.json();
  
  const result = await prisma.$transaction(async (tx) => {
    // Set context within the transaction
    await setTenantContext(tx, enterpriseId, orgId);
    
    // All operations in this transaction are tenant-scoped
    const user = await tx.user.create({
      data: {
        email: "user@example.com",
        name: "John Doe",
        enterpriseId,
        orgId,
        role: "RECRUITER"
      }
    });
    
    const job = await tx.jobListing.create({
      data: {
        title: "Software Engineer",
        enterpriseId,
        orgId,
        // ... other fields
      }
    });
    
    return { user, job };
  });
  
  return Response.json(result);
}
```

### Example 3: Enterprise-Level Operations (No Organization)

```typescript
import { prisma, setTenantContext } from "@/lib/db/session-context";

// Get all organizations for an enterprise
export async function getEnterpriseOrganizations(enterpriseId: string) {
  // Don't pass organizationId for enterprise-level queries
  await setTenantContext(prisma, enterpriseId);
  
  const orgs = await prisma.organisation.findMany();
  return orgs;
}
```

### Example 4: SSO Authentication Flow

```typescript
import { prisma, setTenantContext } from "@/lib/db/session-context";

export async function handleSSOCallback(
  enterpriseId: string,
  ssoUserId: string,
  email: string
) {
  return await prisma.$transaction(async (tx) => {
    // Set enterprise context
    await setTenantContext(tx, enterpriseId);
    
    // Find SSO connection (automatically filtered by RLS)
    const ssoConnection = await tx.ssoConnection.findFirst({
      where: { enabled: true }
    });
    
    // Provision user (RLS ensures they're created in correct enterprise)
    const user = await tx.user.create({
      data: {
        enterpriseId,
        email,
        name: email.split('@')[0],
        role: 'RECRUITER',
        ssoEnabled: true,
        ssoOnly: true
      }
    });
    
    // Create SSO link
    await tx.ssoUserLink.create({
      data: {
        userId: user.id,
        ssoConnectionId: ssoConnection!.id,
        ssoUserId,
        ssoEmail: email
      }
    });
    
    return user;
  });
}
```

### Example 5: Using with Existing Helper Functions

```typescript
import { 
  prisma, 
  setTenantContext,
  getTenantContextFromHeaders 
} from "@/lib/db/session-context";

export async function GET(request: Request) {
  // Extract context from headers (set by middleware)
  const context = getTenantContextFromHeaders(request.headers);
  
  // Set tenant context
  await setTenantContext(
    prisma, 
    context.enterpriseId, 
    context.organisationId || undefined
  );
  
  // Queries are now tenant-scoped
  const data = await prisma.jobListing.findMany();
  
  return Response.json({ data });
}
```

## Important Notes

### 1. **Use `SET LOCAL` for Transaction Safety**
The function uses `SET LOCAL` which means:
- Variables are scoped to the current transaction
- They're automatically cleared when the transaction ends
- Safe for connection pooling

### 2. **Always Set Context Before Queries**
```typescript
// ✅ CORRECT
await setTenantContext(prisma, enterpriseId, orgId);
const data = await prisma.jobListing.findMany();

// ❌ WRONG - queries run without tenant context
const data = await prisma.jobListing.findMany();
await setTenantContext(prisma, enterpriseId, orgId);
```

### 3. **Organization ID is Optional**
```typescript
// Enterprise-level query (all organizations)
await setTenantContext(prisma, enterpriseId);

// Organization-specific query
await setTenantContext(prisma, enterpriseId, orgId);
```

### 4. **Works with Both Prisma Client and Transaction Client**
```typescript
// Regular client
await setTenantContext(prisma, enterpriseId);

// Transaction client
await prisma.$transaction(async (tx) => {
  await setTenantContext(tx, enterpriseId);
});
```

## RLS Policy Reference

The session variables set by this function are used by RLS policies:

```sql
-- Example RLS policy
CREATE POLICY tenant_isolation ON job_listing
  FOR ALL
  USING (
    enterprise_id = current_setting('app.enterprise_id', true)::uuid
    AND (
      organization_id = current_setting('app.organization_id', true)::uuid
      OR current_setting('app.organization_id', true) = ''
    )
  );
```

## Migration to setTenantContext

If you're currently using `withTenantContext` or `withTenantTransaction`, you can migrate:

### Before (Old Way)
```typescript
await withTenantContext(prisma, context, async () => {
  const jobs = await prisma.jobListing.findMany();
  return jobs;
});
```

### After (New Way)
```typescript
await setTenantContext(prisma, context.enterpriseId, context.organisationId);
const jobs = await prisma.jobListing.findMany();
```

The new way is simpler and more flexible!
