# Architecture Documentation

## Multi-Tenant Architecture Overview

This platform uses a **shared schema with Row-Level Security (RLS)** approach for multi-tenancy, providing strong isolation guarantees at the database level while maintaining operational simplicity.

## Tenant Hierarchy

```
┌─────────────────────────────────────────┐
│           Enterprise                     │
│  (Top-level tenant)                      │
│  - Owns all data                         │
│  - Can have multiple organisations       │
└────────────┬────────────────────────────┘
             │
             ├─────────────────────────────┐
             │                             │
    ┌────────▼─────────┐         ┌────────▼─────────┐
    │  Organisation 1  │         │  Organisation 2  │
    │  (Sub-account)   │         │  (Sub-account)   │
    └────────┬─────────┘         └────────┬─────────┘
             │                             │
             ├─────────────────────────────┤
             │                             │
    ┌────────▼─────────┐         ┌────────▼─────────┐
    │   Users          │         │   Job Listings   │
    │   - Admins       │         │   - Active       │
    │   - Recruiters   │         │   - Draft        │
    │   - Candidates   │         │   - Closed       │
    └──────────────────┘         └──────────────────┘
```

## Data Isolation Strategy

### 1. Row-Level Security (RLS)

Every tenant-scoped table has RLS policies that automatically filter rows based on session variables:

```sql
-- Example RLS policy
CREATE POLICY job_listing_tenant_isolation ON job_listing
    USING (
        enterprise_id::text = current_setting('app.enterprise_id', true)
        AND org_id::text = current_setting('app.organisation_id', true)
    );
```

### 2. Session Variables

Before each database operation, we set session variables:

```typescript
SET LOCAL app.enterprise_id = 'uuid';
SET LOCAL app.organisation_id = 'uuid';
SET LOCAL app.user_id = 'uuid';
```

These variables are:
- **LOCAL**: Scoped to the current transaction
- **Automatic**: Set by the `withTenantContext` helper
- **Secure**: Cannot be bypassed by application code

### 3. Request Flow

```
┌─────────────┐
│   Client    │
└──────┬──────┘
       │ HTTP Request
       ▼
┌─────────────────────────────────────┐
│         Middleware                   │
│  1. Authenticate user                │
│  2. Extract tenant context           │
│  3. Set headers                      │
└──────┬──────────────────────────────┘
       │ Headers: x-enterprise-id,
       │          x-organisation-id,
       │          x-user-id
       ▼
┌─────────────────────────────────────┐
│         API Route                    │
│  1. Extract context from headers     │
│  2. Call withTenantContext()         │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│    Session Context Helper            │
│  1. Begin transaction                │
│  2. SET LOCAL app.* variables        │
│  3. Execute query                    │
└──────┬──────────────────────────────┘
       │
       ▼
┌─────────────────────────────────────┐
│         PostgreSQL                   │
│  1. Apply RLS policies               │
│  2. Filter rows by tenant            │
│  3. Return results                   │
└─────────────────────────────────────┘
```

## Database Schema Design

### Core Principles

1. **UUID Primary Keys**: All tables use UUIDs for globally unique identifiers
2. **Tenant Columns**: Every tenant-scoped table has `enterprise_id` and `org_id`
3. **Timestamps**: All tables track `created_at` and `updated_at`
4. **Cascading Deletes**: Foreign keys cascade to maintain referential integrity

### Table Relationships

```
enterprise
    ├── organisation (1:N)
    ├── user (1:N)
    ├── question_template (1:N)
    └── job_listing (1:N)

organisation
    ├── user (1:N)
    ├── job_listing (1:N)
    └── job_template (1:N)

job_listing
    ├── job_template (1:N)
    ├── interview_session (1:N)
    └── invite_token (1:N)

question_template
    └── job_template (1:N)

invite_token
    └── interview_session (1:N)

user (candidate)
    └── interview_session (1:N)
```

## Security Considerations

### 1. Least Privilege

- **RLS Policies**: Automatically enforce tenant isolation
- **Session Variables**: Set per-transaction, cannot leak between requests
- **Role-Based Access**: User roles control what actions can be performed

### 2. Single-Use Tokens

Invite tokens use row-level locking to prevent race conditions:

```typescript
// Lock the row for update
SELECT * FROM invite_token WHERE code = $code FOR UPDATE;

// Check validity
if (uses >= max_uses) throw new Error('Already used');

// Increment usage
UPDATE invite_token SET uses = uses + 1 WHERE id = $id;
```

### 3. Public Endpoints

The `/api/interview/consume-invite` endpoint is public (no authentication required) but:
- Uses raw SQL to bypass RLS (intentionally)
- Validates token expiration and usage limits
- Creates candidate users in the correct tenant context
- Uses serializable transaction isolation

## Performance Optimization

### 1. Connection Pooling

```env
# Pooled connection for serverless
DATABASE_URL="...?pgbouncer=true&connect_timeout=15"

# Direct connection for migrations
DIRECT_URL="..."
```

### 2. Indexes

Critical indexes for tenant queries:

```sql
CREATE INDEX idx_job_listing_enterprise_org 
    ON job_listing(enterprise_id, org_id);

CREATE INDEX idx_interview_session_enterprise_org 
    ON interview_session(enterprise_id, org_id);
```

### 3. Query Patterns

**Good**: Queries that use tenant indexes
```typescript
// Automatically filtered by RLS
const jobs = await prisma.jobListing.findMany({
  where: { status: 'active' }
});
```

**Bad**: Queries that bypass RLS
```typescript
// Don't do this - bypasses tenant isolation
const jobs = await prisma.$queryRaw`SELECT * FROM job_listing`;
```

## Scalability

### Horizontal Scaling

- **Stateless API**: No session state in application servers
- **Connection Pooling**: PgBouncer handles connection management
- **Neon Autoscaling**: Database scales automatically with load

### Vertical Scaling

- **Neon Compute**: Upgrade compute units as needed
- **Read Replicas**: Add read replicas for read-heavy workloads
- **Caching**: Add Redis for frequently accessed data

## Monitoring & Observability

### Key Metrics

1. **Tenant Isolation**: Monitor RLS policy effectiveness
2. **Query Performance**: Track slow queries per tenant
3. **Connection Pool**: Monitor pool utilization
4. **Token Usage**: Track invite token consumption patterns

### Logging

```typescript
// Log tenant context with every request
console.log({
  enterpriseId: context.enterpriseId,
  organisationId: context.organisationId,
  userId: context.userId,
  action: 'create_invite',
  timestamp: new Date().toISOString(),
});
```

## Disaster Recovery

### Backup Strategy

1. **Neon Automatic Backups**: Point-in-time recovery up to 7 days
2. **Manual Backups**: Export critical data regularly
3. **Branch-based Testing**: Test migrations on Neon branches

### Recovery Procedures

1. **Point-in-time Restore**: Restore to specific timestamp
2. **Branch Restore**: Restore from a Neon branch
3. **Tenant-level Restore**: Restore specific tenant data

## Future Enhancements

### Potential Improvements

1. **Tenant-level Analytics**: Per-tenant usage metrics
2. **Custom Domains**: Allow enterprises to use custom domains
3. **Data Residency**: Support region-specific data storage
4. **Audit Logging**: Track all data access and modifications
5. **Rate Limiting**: Per-tenant rate limits
6. **Quotas**: Enforce usage limits per tenant tier

### Migration Path

If you need to migrate to a different tenancy model:

1. **Database-per-tenant**: Create separate databases for large tenants
2. **Schema-per-tenant**: Use PostgreSQL schemas for isolation
3. **Hybrid**: Mix approaches based on tenant size

## References

- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Neon Documentation](https://neon.tech/docs)
- [Prisma Multi-tenancy Guide](https://www.prisma.io/docs/guides/database/multi-tenancy)
- [AWS Multi-tenant SaaS Best Practices](https://aws.amazon.com/partners/programs/saas/)
