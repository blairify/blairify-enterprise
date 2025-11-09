# Setup Guide - Multi-Tenant SaaS Platform

This guide walks you through setting up the multi-tenant SaaS platform from scratch.

## Prerequisites

- Node.js 18+ and pnpm/npm/yarn
- A Neon Postgres account ([neon.tech](https://neon.tech))
- PostgreSQL client (psql) or database GUI tool

## Step-by-Step Setup

### 1. Clone and Install Dependencies

```bash
cd blairify-enterprise
pnpm install
```

### 2. Create Neon Database

1. Go to [console.neon.tech](https://console.neon.tech)
2. Create a new project
3. Copy the connection strings:
   - **Pooled connection** (for application): `postgresql://...?pgbouncer=true`
   - **Direct connection** (for migrations): `postgresql://...` (without pgbouncer)

### 3. Configure Environment Variables

Create `.env` file:

```bash
cp .env.example .env
```

Update with your Neon credentials:

```env
# Pooled connection for application (serverless)
DATABASE_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require&pgbouncer=true&connect_timeout=15"

# Direct connection for migrations
DIRECT_URL="postgresql://user:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require"

# Session secret for JWT (generate a random string)
SESSION_SECRET="your-secret-key-min-32-chars-change-in-production"

# Your other environment variables
MISTRAL_API_KEY="your_mistral_api_key_here"
```

### 4. Run Database Migrations

Apply the SQL migrations to create tables and RLS policies:

```bash
# Using psql - Run migrations in order
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql
psql $DIRECT_URL -f prisma/migrations/002_add_password_hash.sql

# Or using Neon SQL Editor in the console
# Copy and paste the contents of each migration file
```

**Verify migration:**
```bash
psql $DIRECT_URL -c "\dt"
```

You should see tables: `enterprise`, `organisation`, `user`, `job_listing`, etc.

### 5. Generate Prisma Client

```bash
npx prisma generate
```

This will generate TypeScript types from your Prisma schema and resolve the TypeScript errors.

### 6. Seed Initial Data (Optional)

Create a seed script or manually insert test data:

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

### 7. Authentication Setup

The application now uses a custom JWT-based authentication system. Authentication is already implemented with:

- **Session Management**: JWT tokens stored in HTTP-only cookies
- **Login Page**: `/login` - Simple email/password authentication
- **API Routes**:
  - `POST /api/auth/login` - User login
  - `POST /api/auth/logout` - User logout
  - `GET /api/auth/me` - Get current session
- **Middleware**: Automatically protects all routes except public paths

**Note**: For demo purposes, if a user has no `password_hash`, any password will work. In production, you should require password hashes for all users.

### 8. Run Development Server

```bash
pnpm dev
```

The application will be available at `http://localhost:3000`

### 9. Test API Endpoints

#### Create an invite token:

```bash
curl -X POST http://localhost:3000/api/interview/create-invite \
  -H "Content-Type: application/json" \
  -H "x-enterprise-id: 550e8400-e29b-41d4-a716-446655440000" \
  -H "x-organisation-id: 550e8400-e29b-41d4-a716-446655440001" \
  -H "x-user-id: 550e8400-e29b-41d4-a716-446655440002" \
  -d '{
    "jobListingId": "YOUR_JOB_ID",
    "maxUses": 1,
    "expiresInHours": 168
  }'
```

#### Consume an invite token:

```bash
curl -X POST http://localhost:3000/api/interview/consume-invite \
  -H "Content-Type: application/json" \
  -d '{
    "code": "INVITE_CODE_FROM_ABOVE",
    "candidateEmail": "candidate@example.com",
    "candidateName": "Jane Doe"
  }'
```

## Verification Checklist

- [ ] Database tables created successfully
- [ ] RLS policies enabled on all tenant-scoped tables
- [ ] Prisma client generated without errors
- [ ] Environment variables configured
- [ ] Authentication middleware implemented
- [ ] Test data seeded (optional)
- [ ] API endpoints responding correctly
- [ ] TypeScript compilation successful

## Common Issues

### Issue: "relation does not exist"

**Solution**: Run the migration again:
```bash
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql
```

### Issue: TypeScript errors on Prisma models

**Solution**: Regenerate Prisma client:
```bash
npx prisma generate
```

### Issue: RLS policies blocking queries

**Solution**: Ensure session variables are set correctly:
```typescript
await withTenantContext(prisma, context, async () => {
  // Your query here
});
```

### Issue: Connection pool exhausted

**Solution**: Use `DATABASE_URL` with `pgbouncer=true` for serverless functions

## Next Steps

1. **Implement Authentication**: Complete the `getSession` function in middleware
2. **Build UI**: Create pages for job listings, interviews, and admin dashboard
3. **Add Authorization**: Implement role-based access control
4. **Configure CI/CD**: Set up automated deployments
5. **Add Monitoring**: Integrate error tracking and analytics

## Resources

- [Neon Documentation](https://neon.tech/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [PostgreSQL RLS Guide](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
