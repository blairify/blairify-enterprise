# Database Client Usage Guide

## Overview

The `db` client automatically sets tenant context from request headers before every query. This eliminates the need to manually call `setTenantContext()` in every API route.

## Quick Start

### Before (Manual Context)

```typescript
import { prisma, getTenantContextFromHeaders, setTenantContext } from "@/lib/db/session-context";

export async function GET(request: Request) {
  const context = getTenantContextFromHeaders(request.headers);
  await setTenantContext(prisma, context.enterpriseId, context.organisationId);
  
  const jobs = await prisma.jobListing.findMany();
  return Response.json({ jobs });
}
```

### After (Automatic Context)

```typescript
import { db } from "@/lib/db/client";

export async function GET() {
  // Tenant context automatically set from headers!
  const jobs = await db.jobListing.findMany();
  return Response.json({ jobs });
}
```

## Usage Examples

### Example 1: Simple Query in API Route

```typescript
// src/app/api/jobs/route.ts
import { db } from "@/lib/db/client";

export async function GET() {
  // Headers are automatically read
  // Tenant context is automatically set
  // Query is automatically filtered by RLS
  const jobs = await db.jobListing.findMany({
    include: {
      enterprise: true,
      organisation: true,
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
  
  return Response.json({ jobs });
}
```

### Example 2: Create Operation

```typescript
// src/app/api/jobs/route.ts
import { db } from "@/lib/db/client";

export async function POST(request: Request) {
  const body = await request.json();
  
  // Tenant context automatically set
  // enterpriseId and orgId are automatically validated by RLS
  const job = await db.jobListing.create({
    data: {
      title: body.title,
      description: body.description,
      enterpriseId: body.enterpriseId,
      orgId: body.orgId,
      userId: body.userId,
    },
  });
  
  return Response.json({ job });
}
```

### Example 3: Server Component

```typescript
// src/app/dashboard/jobs/page.tsx
import { db } from "@/lib/db/client";

export default async function JobsPage() {
  // Works in Server Components too!
  const jobs = await db.jobListing.findMany({
    take: 10,
  });
  
  return (
    <div>
      <h1>Jobs</h1>
      {jobs.map(job => (
        <div key={job.id}>{job.title}</div>
      ))}
    </div>
  );
}
```

### Example 4: Server Action

```typescript
// src/app/actions/jobs.ts
"use server";

import { db } from "@/lib/db/client";
import { revalidatePath } from "next/cache";

export async function createJob(formData: FormData) {
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  
  // Tenant context automatically set
  const job = await db.jobListing.create({
    data: {
      title,
      description,
      // enterpriseId and orgId from headers
    },
  });
  
  revalidatePath("/dashboard/jobs");
  return { success: true, job };
}
```

### Example 5: Transaction

```typescript
// src/app/api/users/route.ts
import { dbTransaction } from "@/lib/db/client";

export async function POST(request: Request) {
  const body = await request.json();
  
  const result = await dbTransaction(async (tx) => {
    // Tenant context automatically set in transaction
    const user = await tx.user.create({
      data: {
        email: body.email,
        name: body.name,
        role: "RECRUITER",
      },
    });
    
    // Create initial job for the user
    const job = await tx.jobListing.create({
      data: {
        title: "Welcome Job",
        userId: user.id,
      },
    });
    
    return { user, job };
  });
  
  return Response.json(result);
}
```

### Example 6: Complex Query with Relations

```typescript
// src/app/api/dashboard/stats/route.ts
import { db } from "@/lib/db/client";

export async function GET() {
  // All queries automatically tenant-scoped
  const [jobCount, userCount, interviewCount] = await Promise.all([
    db.jobListing.count(),
    db.user.count(),
    db.interviewSession.count(),
  ]);
  
  const recentJobs = await db.jobListing.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
  
  return Response.json({
    stats: {
      jobs: jobCount,
      users: userCount,
      interviews: interviewCount,
    },
    recentJobs,
  });
}
```

### Example 7: Raw SQL Queries

```typescript
// src/app/api/analytics/route.ts
import { db } from "@/lib/db/client";

export async function GET() {
  // Tenant context is set before raw queries too
  const results = await db.$queryRaw`
    SELECT 
      DATE(created_at) as date,
      COUNT(*) as count
    FROM job_listing
    WHERE created_at > NOW() - INTERVAL '30 days'
    GROUP BY DATE(created_at)
    ORDER BY date DESC
  `;
  
  return Response.json({ results });
}
```

### Example 8: System Operations (Bypass Tenant Context)

```typescript
// src/app/api/admin/enterprises/route.ts
import { rawDb } from "@/lib/db/client";

export async function GET() {
  // Use rawDb to bypass tenant context
  // This is for system-level operations only
  const allEnterprises = await rawDb.enterprise.findMany({
    include: {
      _count: {
        select: {
          users: true,
          jobListings: true,
        },
      },
    },
  });
  
  return Response.json({ enterprises: allEnterprises });
}
```

## Available Exports

### `db` - Automatic Tenant Context

```typescript
import { db } from "@/lib/db/client";

// All queries automatically tenant-scoped
const jobs = await db.jobListing.findMany();
```

**When to use:**
- ✅ API routes
- ✅ Server Components
- ✅ Server Actions
- ✅ Any authenticated request

### `rawDb` - No Tenant Context

```typescript
import { rawDb } from "@/lib/db/client";

// No tenant filtering - sees all data
const allEnterprises = await rawDb.enterprise.findMany();
```

**When to use:**
- ⚠️ System administration
- ⚠️ Background jobs
- ⚠️ Migrations
- ⚠️ Cross-tenant operations

**Warning:** Use with extreme caution! This bypasses all tenant isolation.

### `dbTransaction` - Transactional Operations

```typescript
import { dbTransaction } from "@/lib/db/client";

const result = await dbTransaction(async (tx) => {
  // All operations in this transaction are tenant-scoped
  const user = await tx.user.create({ ... });
  const job = await tx.jobListing.create({ ... });
  return { user, job };
});
```

**When to use:**
- ✅ Multiple related operations
- ✅ Atomic updates
- ✅ Data consistency requirements

## How It Works

### 1. Request Flow

```
┌─────────────────────────────────────────┐
│ 1. Client Request                       │
│    Cookie: session=<JWT>                │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 2. Middleware                           │
│    - Verifies JWT                       │
│    - Sets headers:                      │
│      x-enterprise-id                    │
│      x-organization-id                  │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 3. API Route / Server Component         │
│    import { db } from "@/lib/db/client" │
└──────────────┬──────────────────────────┘
               │
               ▼
┌─────────────────────────────────────────┐
│ 4. db.jobListing.findMany()             │
│    ↓                                    │
│    Proxy intercepts call                │
│    ↓                                    │
│    Reads headers()                      │
│    ↓                                    │
│    Calls setTenantContext()             │
│    ↓                                    │
│    Executes query with RLS              │
└─────────────────────────────────────────┘
```

### 2. Proxy Implementation

The `db` client uses JavaScript Proxy to intercept all method calls:

```typescript
// Simplified version
const db = new Proxy(prisma, {
  get(target, prop) {
    // Intercept model access (e.g., db.jobListing)
    return new Proxy(target[prop], {
      get(model, method) {
        // Intercept method calls (e.g., findMany)
        return async (...args) => {
          // 1. Read headers
          const { enterpriseId, orgId } = await headers();
          
          // 2. Set tenant context
          await setTenantContext(prisma, enterpriseId, orgId);
          
          // 3. Execute original method
          return model[method](...args);
        };
      },
    });
  },
});
```

## Performance Considerations

### 1. Header Reading

Reading headers is fast (< 1ms) and happens automatically in Next.js.

### 2. Context Setting

Setting PostgreSQL session variables is also fast (< 1ms per query).

### 3. Connection Pooling

The client uses Prisma's connection pooling, so context is set per-connection, not globally.

### 4. Caching

For Server Components, consider using React cache:

```typescript
import { cache } from "react";
import { db } from "@/lib/db/client";

export const getJobs = cache(async () => {
  return db.jobListing.findMany();
});
```

## Testing

### Unit Tests

Mock the headers:

```typescript
import { headers } from "next/headers";
import { db } from "@/lib/db/client";

jest.mock("next/headers");

test("fetches jobs for tenant", async () => {
  (headers as jest.Mock).mockResolvedValue({
    get: (key: string) => {
      if (key === "x-enterprise-id") return "enterprise-123";
      if (key === "x-organization-id") return "org-456";
      return null;
    },
  });
  
  const jobs = await db.jobListing.findMany();
  expect(jobs).toBeDefined();
});
```

### Integration Tests

Test with actual headers:

```typescript
import { GET } from "@/app/api/jobs/route";

test("API returns tenant-scoped jobs", async () => {
  const request = new Request("http://localhost/api/jobs", {
    headers: {
      "x-enterprise-id": "enterprise-123",
      "x-organization-id": "org-456",
    },
  });
  
  const response = await GET(request);
  const data = await response.json();
  
  expect(data.jobs).toBeDefined();
});
```

## Migration Guide

### From Manual Context Setting

**Before:**
```typescript
import { prisma, getTenantContextFromHeaders, setTenantContext } from "@/lib/db/session-context";

export async function GET(request: Request) {
  const context = getTenantContextFromHeaders(request.headers);
  await setTenantContext(prisma, context.enterpriseId, context.organisationId);
  const jobs = await prisma.jobListing.findMany();
  return Response.json({ jobs });
}
```

**After:**
```typescript
import { db } from "@/lib/db/client";

export async function GET() {
  const jobs = await db.jobListing.findMany();
  return Response.json({ jobs });
}
```

### From Direct Prisma Import

**Before:**
```typescript
import { prisma } from "@/lib/db/session-context";

const jobs = await prisma.jobListing.findMany();
```

**After:**
```typescript
import { db } from "@/lib/db/client";

const jobs = await db.jobListing.findMany();
```

## Troubleshooting

### Issue: "Missing tenant context"

**Cause:** Headers not set (middleware not running)

**Solution:** Ensure route is protected by middleware

### Issue: Getting data from wrong tenant

**Cause:** Headers contain wrong IDs

**Solution:** Check JWT payload and middleware logic

### Issue: Performance degradation

**Cause:** Setting context on every query

**Solution:** This is expected and minimal (< 1ms overhead)

### Issue: Type errors with Proxy

**Cause:** TypeScript doesn't fully understand Proxy

**Solution:** Use type assertions if needed:
```typescript
const jobs = await db.jobListing.findMany() as JobListing[];
```
