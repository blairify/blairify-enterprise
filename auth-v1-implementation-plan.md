# Blairify Enterprise – Auth v1 Implementation Plan

This document turns `technical-overview-auth.md` into concrete build steps.

## Phase 0 – Prerequisites

- **Infrastructure**
  - Create a Neon Postgres project + database for `enterprise.blairify.com`.
  - Create an application DB user (e.g. `app_user`) with limited privileges.
- **Environment variables**
  - Add `DATABASE_URL` for Neon (app user).
  - Add any Drizzle-specific env if needed (e.g. `DRIZZLE_DATABASE_URL`).
- **Repo hygiene**
  - Confirm old Prisma/legacy auth flows are not used anymore (we will replace them incrementally).

## Phase 1 – Drizzle + Neon setup

1. **Add dependencies**
   - `drizzle-orm`
   - `drizzle-kit`
   - `@neondatabase/serverless`
   - `zod` (for schema validation if not already present).
2. **Create Drizzle config** (root)
   - `drizzle.config.ts` pointing to:
     - `schema` folder (e.g. `src/db/schema`).
     - `migrations` folder.
     - `DATABASE_URL` env.
3. **Create DB client helper** (e.g. `src/db/client.ts`)
   - Initialize neon client with `DATABASE_URL`.
   - Export a `getDbForEnterprise(enterpriseId)` helper that:
     - Opens a connection.
     - Runs `SET LOCAL app.current_enterprise_id = $1`.
     - Returns a Drizzle instance bound to that connection.

## Phase 2 – Schema: enterprises, users, sessions, permissions

1. **Create schema file(s)** (e.g. `src/db/schema/auth.ts`)
   - `enterprises` table:
     - `id` (PK, uuid or similar)
     - `name`, `domain`, `created_at`.
   - `users` table:
     - `id` (PK)
     - `enterprise_id` (FK → `enterprises.id`)
     - `email` (unique within enterprise)
     - `password_hash`
     - `full_name`
     - `job_title`
     - `role` (ENUM: `ENTERPRISE_ADMIN` | `RECRUITER` | `READ_ONLY`)
     - `created_at`, `is_active`.
   - `sessions` table:
     - `id` (PK)
     - `user_id`
     - `enterprise_id`
     - `created_at`, `expires_at`
     - optional: `ip_address`, `user_agent`.
   - `permissions` and `role_permissions` tables:
     - As described in `technical-overview-auth.md`.
2. **Generate migration**
   - Use `drizzle-kit` to generate SQL from the schema.
3. **Apply migration**
   - Run migration against the Neon database.

## Phase 3 – RLS and Postgres security

1. **Create a manual SQL migration** for RLS (or extend generated migration):
   - Enable RLS on all tenant tables: `enterprises`, `users`, `jobs`, `interviews`, `candidates`, etc.
   - For each tenant table, create policies following the pattern:

     ```sql
     ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;

     CREATE POLICY jobs_select
     ON jobs
     FOR SELECT
     USING (enterprise_id::text = current_setting('app.current_enterprise_id', true));

     CREATE POLICY jobs_write
     ON jobs
     FOR INSERT, UPDATE, DELETE
     USING (enterprise_id::text = current_setting('app.current_enterprise_id', true))
     WITH CHECK (enterprise_id::text = current_setting('app.current_enterprise_id', true));
     ```

   - Ensure `enterprise_id` is **required** and cannot be NULL for tenant tables.
2. **Lock down roles**
   - Ensure the app connects as `app_user`.
   - Revoke direct access for other roles except what migrations need.
3. **Document RLS rules** (short summary in the migration or README snippet).

## Phase 4 – Session & auth helpers

1. **Session cookie config**
   - Decide cookie name (e.g. `bea_session`).
   - Decide expiry, secure flags, domain (`enterprise.blairify.com`).
2. **Session helper** (e.g. `src/lib/session.ts`)
   - `createSession(user)` – inserts into `sessions`, returns `session_id`.
   - `getCurrentSession()` – reads cookie, fetches session + user + enterprise.
   - `deleteSession(sessionId)` – for logout.
3. **Auth helper**
   - `getCurrentUser()` – wraps `getCurrentSession`, returns typed user + permissions.
   - `requireUser()` – throws/redirects to `/signin` if not authenticated.
   - `requirePermission(key)` – checks derived permissions.

## Phase 5 – Signup flow (enterprise + first admin)

1. **Page**: `src/app/signup/page.tsx`
   - Server component with a server action (React 19 / Next actions style).
   - Form fields:
     - Full name
     - Work email
     - Password + confirmation
     - Company name
     - Company domain
     - User role/position label
2. **Server action logic**
   - Validate with Zod.
   - Start transaction via Drizzle:
     - Insert `enterprise` with `name` + `domain`.
     - Insert `user` with `enterprise_id`, hashed password, `role = ENTERPRISE_ADMIN`.
     - Insert `session` for this user.
   - Set HTTP-only session cookie.
   - Redirect to `/dashboard`.
3. **Edge cases**
   - Enterprise domain already exists → show error (prevent duplicates for now).
   - Email already used in that enterprise → show error.

## Phase 6 – Signin & logout

1. **Page**: `src/app/signin/page.tsx`
   - Server component with email + password form.
2. **Server action**
   - Lookup user by email.
   - Verify password with `bcrypt.compare`.
   - Ensure `is_active = true`.
   - Create `session` record (with user’s `enterprise_id`).
   - Set session cookie and redirect to `/dashboard`.
3. **Logout action**
   - Server action `logout` (e.g. in `src/app/(auth)/logout/action.ts`).
   - Delete session row.
   - Clear cookie and redirect to `/signin`.

## Phase 7 – Protecting dashboard & wiring tenant context

1. **Protect dashboard routes**
   - In `src/app/dashboard/layout.tsx` (or equivalent), call `requireUser()` in a server component and redirect unauthenticated users.
   - Pass the current user/enterprise into the layout as props or via a context.
2. **Use tenant-aware DB helper**
   - When querying tenant tables, always go through `getDbForEnterprise(currentEnterpriseId)` so `SET LOCAL app.current_enterprise_id` is executed and RLS is active.
3. **Basic UI integration**
   - Show current enterprise name and user name in the navbar.
   - Add a simple "Account" or "Sign out" entry that triggers the logout action.

## Phase 8 – Permissions (minimal)

1. **Seed default permissions**
   - Create a short list of permission keys in `permissions`.
   - Insert default mappings in `role_permissions` (e.g. ENTERPRISE_ADMIN → all, RECRUITER → manage_jobs/manage_candidates, READ_ONLY → view_* only).
2. **Enforce a first permission**
   - Example: `requirePermission('manage_jobs')` on "Create job".
   - This ensures the pattern is tested early.

## Phase 9 – Hardening & checks

- **Monitoring & logging**
  - Log failed sign-in attempts (without storing raw passwords).
  - Log RLS-related errors to catch misconfigurations.
- **Manual verification**
  - Create two enterprises in a test environment.
  - Ensure users from one enterprise cannot see jobs/users of the other, even when trying crafted URLs.
- **Tests (later)**
  - Add integration tests around signup/signin and basic RLS queries.

This plan should be executed incrementally, verifying RLS and auth behaviour after each phase before adding more features.
