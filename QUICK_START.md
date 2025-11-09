# Quick Start Guide

Get your multi-tenant SaaS platform running in 5 minutes.

## Prerequisites

- Node.js 18+ installed
- pnpm/npm/yarn installed
- Neon account ([sign up free](https://neon.tech))

## Setup Steps

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Database

Create a Neon project and copy your connection strings:

```bash
cp .env.example .env
```

Edit `.env`:
```env
DATABASE_URL="postgresql://user:pass@host/db?pgbouncer=true&sslmode=require"
DIRECT_URL="postgresql://user:pass@host/db?sslmode=require"
```

### 3. Run Migration

```bash
pnpm db:migrate
```

Or manually:
```bash
psql $DIRECT_URL -f prisma/migrations/001_initial_schema.sql
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

### 5. Seed Test Data

```bash
pnpm db:setup
```

This creates:
- Test enterprise "Acme Corporation"
- Test organisation "Engineering Team"
- Admin and recruiter users
- Sample job listing with questions

### 6. Start Development Server

```bash
pnpm dev
```

Visit `http://localhost:3000`

## Test the API

### Create an Invite Token

```bash
curl -X POST http://localhost:3000/api/interview/create-invite \
  -H "Content-Type: application/json" \
  -H "x-enterprise-id: YOUR_ENTERPRISE_ID" \
  -H "x-organisation-id: YOUR_ORG_ID" \
  -H "x-user-id: YOUR_USER_ID" \
  -d '{
    "jobListingId": "YOUR_JOB_ID",
    "maxUses": 1,
    "expiresInHours": 168
  }'
```

**Response:**
```json
{
  "success": true,
  "inviteToken": {
    "code": "abc123...",
    "expiresAt": "2024-01-15T00:00:00Z"
  }
}
```

### Consume an Invite Token

```bash
curl -X POST http://localhost:3000/api/interview/consume-invite \
  -H "Content-Type: application/json" \
  -d '{
    "code": "abc123...",
    "candidateEmail": "candidate@example.com",
    "candidateName": "Jane Doe"
  }'
```

**Response:**
```json
{
  "success": true,
  "interviewSession": {
    "id": "session-uuid",
    "jobListing": {
      "title": "Senior Software Engineer"
    },
    "questionsSnapshot": { ... }
  }
}
```

## Common Commands

```bash
# Development
pnpm dev                 # Start dev server
pnpm build              # Build for production
pnpm start              # Start production server

# Database
pnpm db:migrate         # Run migrations
pnpm db:setup           # Seed test data
pnpm db:studio          # Open Prisma Studio

# Code Quality
pnpm fix                # Format and lint code
pnpm test               # Run tests
```

## Next Steps

1. **Implement Authentication**: Update `src/middleware.ts` with your auth provider
2. **Build UI**: Create pages for job listings and interviews
3. **Add Features**: Implement video recording, AI analysis, etc.
4. **Deploy**: Deploy to Vercel, Netlify, or your preferred platform

## Troubleshooting

### TypeScript Errors

Run `npx prisma generate` to generate Prisma client types.

### Connection Errors

Verify your `DATABASE_URL` and `DIRECT_URL` in `.env`.

### RLS Policy Issues

Ensure session variables are set:
```typescript
await withTenantContext(prisma, context, async () => {
  // Your query
});
```

## Resources

- [Full Documentation](./README.md)
- [Architecture Guide](./ARCHITECTURE.md)
- [Setup Guide](./SETUP.md)
- [Neon Docs](https://neon.tech/docs)
- [Prisma Docs](https://www.prisma.io/docs)
