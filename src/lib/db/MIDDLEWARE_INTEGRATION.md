# Middleware + Tenant Context Integration

## How It Works

The middleware and tenant context system work together to provide seamless multi-tenant data isolation:

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. User Request                                                 │
│    Cookie: session=<JWT>                                        │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. Middleware (src/middleware.ts)                               │
│    - Reads JWT from cookie                                      │
│    - Verifies signature                                         │
│    - Extracts: { userId, enterpriseId, organisationId }         │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. Headers Added to Request                                     │
│    x-enterprise-id: "uuid-123"                                  │
│    x-organization-id: "uuid-456"                                │
│    x-user-id: "uuid-789"                                        │
│    x-user-role: "RECRUITER"                                     │
│    x-user-email: "user@company.com"                             │
│    x-user-name: "John Doe"                                      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. API Route Handler                                            │
│    - Extracts headers using getTenantContextFromHeaders()       │
│    - Sets PostgreSQL session vars using setTenantContext()      │
└────────────────┬────────────────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. Database Query with RLS                                      │
│    - PostgreSQL filters data automatically                      │
│    - Only returns data for the tenant                           │
└─────────────────────────────────────────────────────────────────┘
```

## Complete Example

### Step 1: User Logs In

```typescript
// src/app/api/auth/login/route.ts
import { SignJWT } from "jose";

export async function POST(request: Request) {
  const { email, password } = await request.json();
  
  // Verify credentials...
  const user = await verifyUser(email, password);
  
  // Create JWT with tenant context
  const token = await new SignJWT({
    userId: user.id,
    enterpriseId: user.enterpriseId,
    organisationId: user.orgId,
    role: user.role,
    email: user.email,
    name: user.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("24h")
    .sign(SECRET_KEY);
  
  // Set cookie
  const response = NextResponse.json({ success: true });
  response.cookies.set("session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 86400, // 24 hours
  });
  
  return response;
}
```

### Step 2: Middleware Processes Request

The middleware automatically:
1. Reads the `session` cookie
2. Verifies the JWT
3. Extracts tenant context
4. Adds headers to the request

**No code needed - it's automatic!**

### Step 3: API Route Uses Tenant Context

```typescript
// src/app/api/jobs/route.ts
import { prisma, getTenantContextFromHeaders, setTenantContext } from "@/lib/db/session-context";

export async function GET(request: Request) {
  // Extract tenant context from headers (set by middleware)
  const context = getTenantContextFromHeaders(request.headers);
  
  // Set PostgreSQL session variables for RLS
  await setTenantContext(
    prisma,
    context.enterpriseId,
    context.organisationId || undefined
  );
  
  // Query is automatically filtered by RLS
  const jobs = await prisma.jobListing.findMany({
    include: {
      enterprise: true,
      organisation: true,
    }
  });
  
  return Response.json({ jobs });
}
```

### Step 4: Alternative - Direct Header Access

If you don't want to use the helper functions:

```typescript
// src/app/api/jobs/route.ts
import { prisma } from "@/lib/db/session-context";

export async function GET(request: Request) {
  const enterpriseId = request.headers.get("x-enterprise-id");
  const orgId = request.headers.get("x-organization-id");
  
  if (!enterpriseId) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  
  // Set tenant context
  await prisma.$executeRawUnsafe(
    `SET LOCAL app.enterprise_id = '${enterpriseId}'`
  );
  
  if (orgId) {
    await prisma.$executeRawUnsafe(
      `SET LOCAL app.organization_id = '${orgId}'`
    );
  }
  
  // Queries are now tenant-scoped
  const jobs = await prisma.jobListing.findMany();
  
  return Response.json({ jobs });
}
```

## Available Headers

After middleware runs, these headers are available in all API routes:

| Header | Description | Example |
|--------|-------------|---------|
| `x-enterprise-id` | Enterprise UUID | `"550e8400-e29b-41d4-a716-446655440000"` |
| `x-organization-id` | Organization UUID (optional) | `"660e8400-e29b-41d4-a716-446655440001"` |
| `x-organisation-id` | British spelling variant | Same as above |
| `x-user-id` | User UUID | `"770e8400-e29b-41d4-a716-446655440002"` |
| `x-user-role` | User role | `"RECRUITER"`, `"ENTERPRISE_ADMIN"` |
| `x-user-email` | User email | `"john@company.com"` |
| `x-user-name` | User display name | `"John Doe"` |

## Protected Routes

The middleware automatically protects all routes except:

- `/` - Homepage
- `/auth` - Auth page
- `/login` - Login page
- `/signup` - Signup page
- `/api/auth/*` - Auth API routes
- `/interview/*` - Public interview pages
- `/api/interview/consume-invite` - Public invite endpoint

All other routes require authentication and will have tenant context headers.

## Testing

### Test Middleware Locally

```bash
# 1. Login to get a session cookie
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@company.com","password":"password"}' \
  -c cookies.txt

# 2. Make authenticated request
curl http://localhost:3000/api/jobs \
  -b cookies.txt \
  -v  # Verbose to see headers
```

### Verify Headers in API Route

```typescript
export async function GET(request: Request) {
  // Log all headers for debugging
  console.log("Headers:", {
    enterpriseId: request.headers.get("x-enterprise-id"),
    orgId: request.headers.get("x-organization-id"),
    userId: request.headers.get("x-user-id"),
    role: request.headers.get("x-user-role"),
  });
  
  // Your logic here...
}
```

## Security Notes

### 1. **Headers are Server-Side Only**
The `x-*` headers are only available in:
- ✅ API Routes (`/app/api/**/route.ts`)
- ✅ Server Components
- ✅ Server Actions
- ❌ Client Components (headers not accessible)

### 2. **Never Trust Client Headers**
The middleware sets these headers - don't accept them from the client:

```typescript
// ❌ WRONG - Client could fake these
const enterpriseId = request.headers.get("x-enterprise-id");

// ✅ CORRECT - Middleware sets these from verified JWT
// Just use them directly after middleware runs
```

### 3. **JWT Secret Must Be Secure**
```bash
# Generate a strong secret
openssl rand -base64 32

# Set in .env
SESSION_SECRET=<your-generated-secret>
```

### 4. **Cookie Security**
The session cookie is:
- ✅ `httpOnly` - Not accessible via JavaScript
- ✅ `secure` - Only sent over HTTPS in production
- ✅ `sameSite: lax` - CSRF protection
- ✅ Short-lived - 24 hour expiration

## Troubleshooting

### Issue: Headers are undefined

**Cause**: Route is not protected by middleware

**Solution**: Check `config.matcher` in middleware.ts

### Issue: "Missing tenant context" error

**Cause**: JWT doesn't contain required fields

**Solution**: Ensure JWT includes `userId`, `enterpriseId`

### Issue: RLS policies not working

**Cause**: Session variables not set

**Solution**: Call `setTenantContext()` before queries

### Issue: Getting data from wrong tenant

**Cause**: Not setting tenant context, or setting it incorrectly

**Solution**: Always call `setTenantContext()` with correct IDs from headers
