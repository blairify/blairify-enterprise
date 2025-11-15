# Blairify Enterprise – Auth & Authorization v1 (Drizzle + Neon + RLS)

## 1. Scope of this step

This first step focuses only on:

- **Authentication**
  - Email + password sign up and sign in for enterprise users.
  - Sessions for `enterprise.blairify.com` only.

- **Authorization**
  - Basic **multi-tenant** separation:
    - Each enterprise has its own isolated data.
    - Users belong to exactly one enterprise.
  - **Permission tree**, not just roles:
    - Roles (e.g. ENTERPRISE_ADMIN | RECRUITER | READ_ONLY).
    - Fine-grained permissions stored in DB and enforced in the app.
  - **Row-Level Security (RLS)** in Neon for hard data isolation.

Out of scope for this step:

- SSO / OAuth.
- Password reset / magic links.
- Advanced audit logs.
- UI for managing permission trees (we start with sensible defaults in DB).

---

## 2. High-level architecture

### 2.1 Stack

- **Database**: Neon Postgres (single multi-tenant cluster).
- **ORM**: Drizzle ORM + `@neondatabase/serverless`.
- **Migrations**: `drizzle-kit`.
- **Backend**: Next.js App Router (existing app), running at `enterprise.blairify.com`.
- **Frontend**: React + Next.js server components and server actions.
- **Auth**:
  - Email/password users stored in Postgres.
  - Hashed passwords with `bcrypt`.
  - Session cookies signed (e.g. with `jose` or Node crypto).
  - Session + tenant info exposed via a server-side `getCurrentUser()` helper.

### 2.2 Relationship to blairify.com

- Marketing/B2C site: `https://blairify.com` (separate repo).
- Enterprise product: `https://enterprise.blairify.com` (this repo).
- Access pattern:
  - Users land on `blairify.com`.
  - “Enterprise” CTA sends them to `enterprise.blairify.com`.

---

## 3. Data model (Drizzle + Postgres)

### 3.1 Core tables

- `enterprises`
  - `id` (PK)
  - `name` (display name, e.g. "Acme")
  - `domain` (primary company domain, e.g. "acme.com")
  - `created_at`
- `users`
  - `id` (PK)
  - `enterprise_id` (FK → enterprises.id)
  - `email` (unique within enterprise space)
  - `password_hash`
  - `full_name`
  - `job_title` (e.g. "Head of Talent", optional)
  - `role` (ENUM: ENTERPRISE_ADMIN | RECRUITER | READ_ONLY)
  - `created_at`
  - `is_active`
- `permissions`
  - `id` (PK)
  - `key` (e.g. `manage_jobs`, `manage_candidates`, `view_reports`)
  - `description`
- `role_permissions`
  - `id` (PK)
  - `role` (enum)
  - `permission_id` (FK → permissions.id)

This combination supports a **permission tree**:

- Data is scoped by `enterprise_id`.
- **Roles** are high-level.
- **Permissions** define capabilities.
- In v1, permissions are mostly derived from roles; later we can add overrides at user level if needed.

### 3.2 Session table

- `sessions`
  - `id` (PK)
  - `user_id`
  - `enterprise_id` (active enterprise context)
  - `created_at`
  - `expires_at`
  - `ip_address` (optional)
  - `user_agent` (optional)

We store the `session_id` in an HTTP-only cookie.

---

## 4. Multi-tenancy & RLS

### 4.1 Multi-tenant model

- We use **one Postgres database** for all enterprises.
- Every tenant-owned table has an `enterprise_id` column.
- RLS ensures that queries from one enterprise cannot see or modify data from another.

### 4.2 RLS strategy

We will:

1. Create a dedicated Postgres role, e.g. `app_user`.
2. Enable RLS on tenant tables (e.g. `users`, `enterprises`, `jobs`, etc.).
3. Use a custom setting to hold the current `enterprise_id`, e.g.:

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

4. For each request from the app we will:
   - Look up the session cookie.
   - Resolve `user_id` and `enterprise_id`.
   - For the lifetime of that database call, run:

     ```sql
     SET LOCAL app.current_enterprise_id = '<enterprise-id>';
     ```

   - Then execute Drizzle queries; RLS automatically filters rows.

For Neon’s serverless driver we encapsulate this in a helper that:

- Creates a connection.
- Runs `SET LOCAL app.current_enterprise_id = $1`.
- Executes the Drizzle query in the same call.

We apply this `USING` + `WITH CHECK` pattern to **all tenant tables** (for example: `users`, `jobs`, `interviews`, `candidates`).

`enterprise_id` is **never** accepted from client input. It always comes from the resolved session (via the `sessions` table), and RLS enforces that all reads and writes stay inside that enterprise.

### 4.3 Authorization in the app layer

On top of RLS, we implement **app-level checks**:

- `requirePermission('manage_jobs')`
- `requireRole('ENTERPRISE_ADMIN')`, etc.

These helpers will read:

- `role` from the user record (and from memberships later if we extend the model).
- Permission flags from `role_permissions` and any future overrides.

---

## 5. Auth flows

### 5.1 Sign up (enterprise admin)

**Goal**: Create a new enterprise + first admin user.

Flow:

1. User arrives at `enterprise.blairify.com/signup`.
2. Form fields:
   - Full name
   - Work email
   - Password + confirmation
   - Company name (enterprise display name)
   - Company domain (e.g. "acme.com")
   - Your role/position in the company (e.g. "Head of Talent")
3. Server action:
   - Validate input (Zod) on the server.
   - Start a transaction:
     - Insert `enterprise`.
     - Insert `user` with hashed password (`bcrypt`), `enterprise_id` and role `ENTERPRISE_ADMIN`.
   - Create `session` row.
   - Set HTTP-only session cookie.
4. Redirect to `/dashboard`.

Implementation details:

- Sign-up form as **Server Component + Server Action**:
  - Use `useActionState` for optimistic submit/validation messages.

### 5.2 Sign in

**Goal**: Authenticate an existing user into the correct enterprise.

Flow:

1. User visits `enterprise.blairify.com/signin`.
2. Form: email + password.
3. Server action:
   - Lookup user by email.
   - Verify password with `bcrypt.compare`.
   - Read `enterprise_id` and `role` from the user record.
   - Insert `session` record.
   - Set HTTP-only session cookie with `session_id`.
4. Redirect to `/dashboard`.

### 5.3 Sign out

- Server action `logout`:
  - Delete `session` record.
  - Clear cookie.
  - Redirect to `/signin`.

---

## 6. Integration in Next.js

### 6.1 Session helper

Create a server-side helper, e.g. `src/lib/session.ts`:

- `getCurrentSession()`
  - Reads cookie.
  - Fetches session + user + enterprise.
- `getCurrentUser()`
  - Wraps `getCurrentSession`, returns a typed user + permissions.
- `requireUser()` / `requirePermission()` for server components and server actions.

### 6.2 Route protection

- **Server Components / pages**
  - At the top of dashboard routes, call `const user = await requireUser();`
  - If no user → redirect to `/signin`.
- **API routes**
  - Wrap handlers in an auth guard that:
    - Resolves user & enterprise.
    - Sets `SET LOCAL app.current_enterprise_id`.
    - Ensures required permissions.

---

## 7. Implementation plan (phased)

1. **Set up Drizzle + Neon**
   - Add dependencies, env config, Drizzle config.
   - Create schema files for auth + tenant tables.
   - Run initial migration.

2. **Implement RLS**
   - Create Postgres role(s).
   - Add RLS policies for core tables.
   - Validate RLS with manual queries.

3. **Build auth flows**
   - Sign up page (enterprise admin).
   - Sign in page.
   - Sign out action.
   - Session helpers.

4. **Protect a minimal dashboard**
   - Wrap `/dashboard` with `requireUser`.
   - Expose user + enterprise info in layout.
   - Verify RLS by querying tenant-scoped data.

5. **Add basic permission checks**
   - Implement role/permission helpers.
   - Gate one or two actions (e.g. "Create Job") by permission.

This completes the **first step**: a secure, multi-tenant auth & authz foundation for Blairify Enterprise.
