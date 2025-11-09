# Multi-Tenant SaaS Platform - AI Interview System

A secure, scalable multi-tenant SaaS platform built with Next.js, Prisma, and Neon Postgres, featuring Row-Level Security (RLS) for tenant isolation.

## Architecture

### Tenant Hierarchy
```
Enterprise (Top-level tenant)
  └── Organisation (Sub-account)
      ├── Users (Enterprise Admins, Org Admins, Recruiters, Candidates)
      ├── Job Listings
      ├── Question Templates (Enterprise-wide or custom per job)
      ├── AI Interview Sessions
      └── Single-use Interview Access Codes
```

### Security Model

**Row-Level Security (RLS)**: All tenant-scoped tables enforce data isolation using PostgreSQL RLS policies that check session variables:
- `app.enterprise_id` - Enterprise context
- `app.organisation_id` - Organisation context (nullable for enterprise-level features)
- `app.user_id` - User context

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Database**: Neon Postgres (serverless PostgreSQL)
- **ORM**: Prisma
- **Security**: Row-Level Security (RLS)
- **Language**: TypeScript

## Project Structure

```
/prisma
  /migrations
    001_initial_schema.sql    # Database schema with RLS policies
  schema.prisma               # Prisma schema definition

/src
  /app
    /api
      /interview
        /create-invite         # Create interview invite tokens
        /consume-invite        # Consume invite tokens (public endpoint)
  /lib
    /db
      session-context.ts       # Database session context helper
  middleware.ts                # Tenant extraction middleware
```

## Setup

### 1. Install Dependencies

```bash
npm install
# or
pnpm install
# or
yarn install
```

### 2. Configure Environment Variables

Copy `.env.example` to `.env` and configure your Neon database:

```bash
cp .env.example .env
```

Update the following variables:
```env
# Get these from your Neon project dashboard
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require&pgbouncer=true&connect_timeout=15"
DIRECT_URL="postgresql://user:password@host:5432/database?sslmode=require"
```

### 3. Run Database Migrations

```bash
# Apply the SQL migration directly to your Neon database
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql

# Or use your preferred PostgreSQL client
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Run Development Server

```bash
npm run dev
# or
pnpm dev
# or
yarn dev
```

## Database Schema

### Core Tables

- **enterprise**: Top-level tenant
- **organisation**: Sub-account under enterprise
- **user**: Users with roles (enterprise_admin, org_admin, recruiter, candidate)
- **job_listing**: Job postings
- **question_template**: Reusable question sets (enterprise-wide or org-specific)
- **job_template**: Links jobs to question templates
- **interview_session**: Interview sessions with question snapshots
- **invite_token**: Single-use access codes for interviews

### Tenant Isolation

Every tenant-scoped table includes:
- `enterprise_id UUID NOT NULL`
- `org_id UUID` (nullable for enterprise-level features)
- `created_at TIMESTAMPTZ`
- `updated_at TIMESTAMPTZ`

## API Routes

### Create Interview Invite

**POST** `/api/interview/create-invite`

Creates a single-use invite token for a job listing.

**Headers:**
- `x-enterprise-id`: Enterprise ID (set by middleware)
- `x-organisation-id`: Organisation ID (set by middleware)
- `x-user-id`: User ID (set by middleware)

**Request Body:**
```json
{
  "jobListingId": "uuid",
  "maxUses": 1,
  "expiresInHours": 168
}
```

**Response:**
```json
{
  "success": true,
  "inviteToken": {
    "id": "uuid",
    "code": "secure-random-code",
    "maxUses": 1,
    "uses": 0,
    "expiresAt": "2024-01-01T00:00:00Z",
    "jobListing": {
      "id": "uuid",
      "title": "Software Engineer"
    }
  }
}
```

### Consume Interview Invite

**POST** `/api/interview/consume-invite`

Public endpoint for candidates to consume an invite token and start an interview.

**Request Body:**
```json
{
  "code": "secure-random-code",
  "candidateEmail": "candidate@example.com",
  "candidateName": "John Doe"
}
```

**Response:**
```json
{
  "success": true,
  "interviewSession": {
    "id": "uuid",
    "jobListing": {
      "id": "uuid",
      "title": "Software Engineer",
      "description": "..."
    },
    "questionsSnapshot": {
      "questions": [...]
    },
    "status": "pending"
  }
}
```

## Security Features

### 1. Row-Level Security (RLS)

All queries are automatically scoped to the correct tenant using PostgreSQL RLS policies:

```sql
CREATE POLICY job_listing_tenant_isolation ON job_listing
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );
```

### 2. Session Context

The `withTenantContext` helper ensures session variables are set before each query:

```typescript
await withTenantContext(prisma, context, async () => {
  // All queries here are automatically scoped to the tenant
  return prisma.jobListing.findMany();
});
```

### 3. Single-Use Tokens

Invite tokens use row-level locking to prevent race conditions:

```typescript
await prisma.$transaction(async (tx) => {
  // SELECT FOR UPDATE locks the row
  const token = await tx.$queryRaw`
    SELECT * FROM invite_token WHERE code = ${code} FOR UPDATE
  `;
  
  // Validate and increment usage
  if (token.uses >= token.maxUses) {
    throw new Error('Token already used');
  }
  
  await tx.$executeRaw`
    UPDATE invite_token SET uses = uses + 1 WHERE id = ${token.id}
  `;
});
```

## Authentication

The middleware extracts tenant context from your authentication provider. You need to implement the `getSession` function in `src/middleware.ts`:

```typescript
// Example with NextAuth
import { getToken } from 'next-auth/jwt';

async function getSession(request: NextRequest) {
  const token = await getToken({ req: request });
  return token ? {
    user: {
      id: token.sub,
      enterpriseId: token.enterpriseId,
      organisationId: token.organisationId,
      role: token.role,
    }
  } : null;
}
```

## Development

### Run Prisma Studio

```bash
npx prisma studio
```

### Reset Database

```bash
# Drop all tables and re-run migrations
psql $DIRECT_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql
```

### Generate New Migration

After modifying `schema.prisma`:

```bash
npx prisma migrate dev --name migration_name
```

## Production Considerations

1. **Connection Pooling**: Use `DATABASE_URL` with `pgbouncer=true` for serverless functions
2. **Direct Connections**: Use `DIRECT_URL` for migrations and long-running operations
3. **RLS Performance**: Ensure indexes exist on `enterprise_id` and `org_id` columns
4. **Session Variables**: Always set session variables before queries
5. **Transaction Isolation**: Use `Serializable` isolation level for critical operations

## License

MIT
