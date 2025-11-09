# User Registration Feature

## Overview

Added a complete user registration system that allows new users to create accounts with their own enterprise and organization.

## What Was Added

### 1. Registration API Route (`/api/auth/register`)

**File**: `src/app/api/auth/register/route.ts`

**Features**:
- Email and password validation
- Password strength requirement (minimum 8 characters)
- Duplicate email detection
- Password hashing with bcrypt (10 salt rounds)
- Automatic enterprise and organization creation
- User created as `ENTERPRISE_ADMIN` (first user in new enterprise)
- Automatic login after registration

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "securepassword123",
  "name": "John Doe",
  "enterpriseName": "Acme Corp",        // Optional
  "organisationName": "Engineering"      // Optional
}
```

**Behavior**:
- If `enterpriseName` is provided: Creates new enterprise with that name
- If `enterpriseName` is omitted: Creates enterprise named "{Name}'s Enterprise"
- If `organisationName` is provided: Uses that for the organization
- If `organisationName` is omitted: Creates organization named "Main"
- Generates URL-friendly slugs automatically
- Checks for duplicate enterprise slugs

**Response** (201 Created):
```json
{
  "success": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "ENTERPRISE_ADMIN",
    "enterpriseId": "uuid",
    "organisationId": "uuid"
  }
}
```

### 2. Signup Page (`/signup`)

**File**: `src/app/signup/page.tsx`

**Features**:
- Modern, responsive form design
- Required fields:
  - Full Name
  - Email
  - Password (min 8 characters)
  - Confirm Password
- Optional fields:
  - Company Name
  - Team/Department Name
- Real-time validation:
  - Password match check
  - Password length validation
  - Email format validation
- Loading states during submission
- Toast notifications for success/error
- Automatic redirect to dashboard after signup
- Link to login page for existing users

### 3. Updated Login Page

**File**: `src/app/login/page.tsx`

**Changes**:
- Added "Sign up" link for new users
- Improved styling and layout
- Better separation of demo notes

## User Flow

### New User Registration

1. User visits `/signup` or clicks "Sign up" from login page
2. Fills out registration form:
   - Required: Name, Email, Password, Confirm Password
   - Optional: Company Name, Team Name
3. Submits form
4. System validates input:
   - Email format
   - Password strength (8+ chars)
   - Passwords match
   - Email not already registered
5. System creates:
   - New enterprise (with auto-generated slug)
   - New organization under enterprise
   - New user as ENTERPRISE_ADMIN
6. Password is hashed with bcrypt
7. Session is created and cookie is set
8. User is redirected to `/dashboard`

### Example Registration Scenarios

#### Scenario 1: Full Company Info
```
Name: Jane Smith
Email: jane@acme.com
Password: SecurePass123
Company: Acme Corporation
Team: Engineering

Result:
- Enterprise: "Acme Corporation" (slug: acme-corporation)
- Organization: "Engineering" (slug: engineering)
- User: Jane Smith (ENTERPRISE_ADMIN)
```

#### Scenario 2: Minimal Info
```
Name: John Doe
Email: john@example.com
Password: MyPassword123

Result:
- Enterprise: "John Doe's Enterprise" (slug: john-does-enterprise)
- Organization: "Main" (slug: main)
- User: John Doe (ENTERPRISE_ADMIN)
```

## Security Features

### Password Security
- Minimum 8 characters required
- Hashed with bcrypt (10 salt rounds)
- Never stored in plain text
- Confirm password validation on client side

### Email Validation
- Format validation (regex)
- Duplicate detection
- Case-sensitive storage

### Slug Generation
- Automatic URL-friendly slug creation
- Lowercase conversion
- Special character removal
- Duplicate slug detection for enterprises

### Session Security
- JWT token with 7-day expiration
- HTTP-only cookies
- Secure flag in production
- SameSite protection

## Testing

### Test Registration via UI

1. Start the dev server: `pnpm dev`
2. Navigate to `http://localhost:3001/signup`
3. Fill out the form:
   ```
   Name: Test User
   Email: test@example.com
   Password: testpass123
   Confirm Password: testpass123
   Company: Test Company
   Team: Test Team
   ```
4. Click "Create Account"
5. Should redirect to `/dashboard` with active session

### Test Registration via API

```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newuser@example.com",
    "password": "securepass123",
    "name": "New User",
    "enterpriseName": "My Company",
    "organisationName": "My Team"
  }' \
  -c cookies.txt
```

### Verify Database

After registration, check the database:

```sql
-- Check enterprise was created
SELECT * FROM enterprise WHERE slug = 'my-company';

-- Check organization was created
SELECT * FROM organisation WHERE slug = 'my-team';

-- Check user was created with hashed password
SELECT id, email, name, role, password_hash 
FROM "user" 
WHERE email = 'newuser@example.com';

-- Verify password_hash is bcrypt format (starts with $2b$)
```

## Error Handling

### Client-Side Validation
- Password mismatch: "Passwords do not match"
- Short password: "Password must be at least 8 characters long"
- Empty fields: Browser native validation

### Server-Side Validation
- Invalid email format: 400 "Invalid email address"
- Duplicate email: 409 "User with this email already exists"
- Duplicate enterprise: 400 "Enterprise with this name already exists"
- Short password: 400 "Password must be at least 8 characters long"
- Missing fields: 400 "Email, password, and name are required"

## Database Schema Impact

No schema changes required - uses existing tables:
- `enterprise` - Stores company information
- `organisation` - Stores team/department information
- `user` - Stores user accounts with `password_hash` field

## Public Routes

The following routes are accessible without authentication:
- `/login` - Login page
- `/signup` - Registration page
- `/api/auth/login` - Login endpoint
- `/api/auth/register` - Registration endpoint
- `/api/auth/logout` - Logout endpoint
- `/api/interview/consume-invite` - Public interview invite consumption

## Next Steps

### Recommended Enhancements

1. **Email Verification**
   - Send verification email after registration
   - Require email confirmation before full access

2. **Password Strength Indicator**
   - Visual feedback on password strength
   - Suggest improvements

3. **CAPTCHA**
   - Add reCAPTCHA to prevent bot registrations

4. **Terms of Service**
   - Add checkbox for ToS acceptance
   - Store acceptance timestamp

5. **Welcome Email**
   - Send welcome email with getting started guide
   - Include login link and support information

6. **Onboarding Flow**
   - Guide new users through initial setup
   - Create sample job listing
   - Explain key features

7. **Social Login**
   - Add Google/GitHub OAuth options
   - Simplify registration process

## File Structure

```
/src
  /app
    /api
      /auth
        /register
          route.ts          # Registration endpoint
        /login
          route.ts          # Login endpoint
        /logout
          route.ts          # Logout endpoint
        /me
          route.ts          # Get session endpoint
    /signup
      page.tsx              # Registration page
    /login
      page.tsx              # Login page (updated with signup link)
  /lib
    /auth
      session.ts            # Session management utilities
```

## Troubleshooting

### "User with this email already exists"
- Email is already registered
- Try logging in instead
- Use password reset if forgotten (not yet implemented)

### "Enterprise with this name already exists"
- Company name slug conflicts with existing enterprise
- Try a different company name
- Or leave blank to use default

### "Password must be at least 8 characters long"
- Password is too short
- Use minimum 8 characters
- Consider adding numbers, uppercase, and symbols

### Registration succeeds but not logged in
- Check browser cookies are enabled
- Check SESSION_SECRET is set in .env
- Check browser console for errors

### TypeScript errors
- Run `pnpm install` to ensure all dependencies are installed
- Run `npx prisma generate` to regenerate Prisma client
