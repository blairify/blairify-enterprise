# Authentication Migration Summary

## Changes Made

### 1. Removed Firebase Dependencies
- Removed `firebase` and `firebase-admin` from `package.json`
- No Firebase code was actually in use, so no code removal was needed

### 2. Added New Dependencies
- `jose@^5.9.6` - JWT token handling
- `bcryptjs@^2.4.3` - Password hashing
- `@types/bcryptjs@^2.4.6` - TypeScript types for bcryptjs

### 3. Created Custom Authentication System

#### Session Management (`src/lib/auth/session.ts`)
- JWT-based session tokens stored in HTTP-only cookies
- Session duration: 7 days
- Session data includes: userId, enterpriseId, organisationId, role, email, name
- Functions:
  - `createSession()` - Create JWT token
  - `verifySession()` - Verify and decode JWT
  - `setSessionCookie()` - Set session cookie
  - `getSession()` - Get current session
  - `clearSession()` - Clear session cookie

#### API Routes
Created three auth endpoints:

1. **POST `/api/auth/login`** (`src/app/api/auth/login/route.ts`)
   - Accepts email and password
   - Validates credentials against database
   - Creates session and sets cookie
   - Returns user data

2. **POST `/api/auth/logout`** (`src/app/api/auth/logout/route.ts`)
   - Clears session cookie
   - Returns success message

3. **GET `/api/auth/me`** (`src/app/api/auth/me/route.ts`)
   - Returns current user session data
   - Returns 401 if not authenticated

#### Login Page (`src/app/login/page.tsx`)
- Modern, responsive login form
- Email and password inputs
- Loading states
- Toast notifications for success/error
- Redirects to original destination after login
- Demo note: accepts any password if no hash exists

### 4. Updated Middleware (`src/middleware.ts`)
- Replaced placeholder auth with JWT verification
- Extracts session from cookie
- Validates session and tenant context
- Sets tenant headers for downstream routes
- Redirects to `/login` if not authenticated

### 5. Database Schema Updates

#### Prisma Schema (`prisma/schema.prisma`)
- Added `passwordHash` field to User model (optional)

#### Migration (`prisma/migrations/002_add_password_hash.sql`)
```sql
ALTER TABLE "user" ADD COLUMN password_hash TEXT;
```

### 6. Environment Variables
Added new required variable:
```env
SESSION_SECRET="your-secret-key-min-32-chars-change-in-production"
```

## Multi-Tenant Architecture (Already Implemented)

The system uses a **shared schema + Row Level Security (RLS)** tenancy model:

### Database Structure
- **Enterprise** (top-level tenant)
  - **Organisation** (sub-account)
    - **Users** (enterprise admins, org admins, recruiters, candidates)
    - **Job Listings**
    - **Question Templates** (enterprise-wide or org-specific)
    - **Interview Sessions**
    - **Invite Tokens** (single-use codes)

### RLS Implementation
Every tenant-scoped table includes:
- `enterprise_id UUID`
- `org_id UUID` (nullable for enterprise-level items)
- `created_at timestamp`
- `updated_at timestamp`

RLS policies enforce:
```sql
enterprise_id = current_setting('app.enterprise_id')
AND (org_id = current_setting('app.organisation_id') OR org_id IS NULL)
```

### Session Context (`src/lib/db/session-context.ts`)
- `withTenantContext()` - Execute queries with tenant context
- `withTenantTransaction()` - Execute transactions with tenant context
- `getTenantContextFromHeaders()` - Extract context from request headers

### Middleware Flow
1. Request arrives
2. Middleware extracts JWT session from cookie
3. Validates session contains: userId, enterpriseId, organisationId, role
4. Sets headers: `x-enterprise-id`, `x-user-id`, `x-organisation-id`, `x-user-role`
5. API routes extract headers and set session variables
6. RLS policies automatically filter data

### API Routes
- **POST `/api/interview/create-invite`** - Create interview invite tokens
- **POST `/api/interview/consume-invite`** - Consume invite (public endpoint)
  - Uses row-level locking: `SELECT ... FOR UPDATE`
  - Validates token not expired and not exceeded max uses
  - Increments usage count atomically
  - Creates interview session

## Setup Instructions

### 1. Install Dependencies
```bash
pnpm install
```

### 2. Run Migrations
```bash
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql
psql $DIRECT_URL -f prisma/migrations/002_add_password_hash.sql
```

### 3. Generate Prisma Client
```bash
npx prisma generate
```

### 4. Set Environment Variables
Add to `.env`:
```env
SESSION_SECRET="your-secret-key-min-32-chars-change-in-production"
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
```

### 5. Seed Test Data
```sql
-- Create test enterprise
INSERT INTO enterprise (id, name, slug) 
VALUES ('550e8400-e29b-41d4-a716-446655440000', 'Acme Corp', 'acme-corp');

-- Create test organisation
INSERT INTO organisation (id, enterprise_id, name, slug)
VALUES (
  '550e8400-e29b-41d4-a716-446655440001',
  '550e8400-e29b-41d4-a716-446655440000',
  'Engineering Team',
  'engineering'
);

-- Create test admin user
INSERT INTO "user" (id, enterprise_id, org_id, email, name, role)
VALUES (
  '550e8400-e29b-41d4-a716-446655440002',
  '550e8400-e29b-41d4-a716-446655440000',
  '550e8400-e29b-41d4-a716-446655440001',
  'admin@acme.com',
  'Admin User',
  'ORG_ADMIN'
);
```

### 6. Start Development Server
```bash
pnpm dev
```

### 7. Test Login
1. Navigate to `http://localhost:3000`
2. You'll be redirected to `/login`
3. Enter: `admin@acme.com` with any password
4. You'll be redirected to `/dashboard`

## Security Notes

### Current Implementation (Demo-Friendly)
- If user has no `password_hash`, any password is accepted
- This allows easy testing without setting up passwords

### Production Requirements
1. **Require Password Hashes**
   - Update login route to reject users without `password_hash`
   - Hash passwords before storing: `await hash(password, 10)`

2. **Secure Session Secret**
   - Generate strong random secret (min 32 characters)
   - Store in environment variable, never commit to git
   - Rotate periodically

3. **HTTPS Only**
   - Ensure `secure: true` for cookies in production
   - Session cookies are already HTTP-only and SameSite

4. **Rate Limiting**
   - Add rate limiting to login endpoint
   - Prevent brute force attacks

5. **Password Requirements**
   - Enforce minimum length (8+ characters)
   - Require complexity (uppercase, lowercase, numbers, symbols)

## Testing the System

### Test Authentication
```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@acme.com","password":"test123"}' \
  -c cookies.txt

# Get current session
curl http://localhost:3000/api/auth/me \
  -b cookies.txt

# Logout
curl -X POST http://localhost:3000/api/auth/logout \
  -b cookies.txt
```

### Test Multi-Tenancy
```bash
# Create invite token (requires authentication)
curl -X POST http://localhost:3000/api/interview/create-invite \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "jobListingId": "YOUR_JOB_ID",
    "maxUses": 1,
    "expiresInHours": 168
  }'

# Consume invite token (public endpoint)
curl -X POST http://localhost:3000/api/interview/consume-invite \
  -H "Content-Type: application/json" \
  -d '{
    "code": "INVITE_CODE",
    "candidateEmail": "candidate@example.com",
    "candidateName": "Jane Doe"
  }'
```

## File Structure

```
/prisma
  /migrations
    001_initial_schema.sql          # Initial tables + RLS
    002_add_password_hash.sql       # Add password field
  schema.prisma                     # Prisma schema

/src
  /app
    /api
      /auth
        /login/route.ts             # Login endpoint
        /logout/route.ts            # Logout endpoint
        /me/route.ts                # Get session endpoint
      /interview
        /create-invite/route.ts     # Create invite token
        /consume-invite/route.ts    # Consume invite token
    /login
      page.tsx                      # Login page
  /lib
    /auth
      session.ts                    # Session management
    /db
      session-context.ts            # Tenant context helpers
  middleware.ts                     # Auth + tenant middleware

package.json                        # Updated dependencies
SETUP.md                           # Setup instructions
AUTH_MIGRATION_SUMMARY.md          # This file
```

## Next Steps

1. **Run `pnpm install`** to install new dependencies
2. **Run migrations** to add password_hash column
3. **Generate Prisma client** with `npx prisma generate`
4. **Seed test data** to create a test user
5. **Start dev server** and test login flow
6. **Build UI** for dashboard, job listings, etc.
7. **Add password hashing** for production users
8. **Implement role-based access control** in routes

## Troubleshooting

### TypeScript Errors
If you see "Cannot find module 'jose'" or similar:
```bash
pnpm install
npx prisma generate
```

### Login Not Working
1. Check database has test user
2. Verify SESSION_SECRET is set
3. Check browser console for errors
4. Verify cookies are being set (DevTools > Application > Cookies)

### RLS Blocking Queries
Ensure you're using `withTenantContext()`:
```typescript
await withTenantContext(prisma, context, async () => {
  return prisma.user.findMany();
});
```

### 404 on /login
The middleware is working! The login page is now created at `/src/app/login/page.tsx`
