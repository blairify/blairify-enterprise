/**
 * Next.js middleware for multi-tenant authentication and context propagation
 * Extracts tenant identity from authenticated session and forwards via headers
 */

import { jwtVerify } from "jose";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

interface SessionData {
  userId: string;
  enterpriseId: string;
  organisationId: string | null;
  role: string;
  email: string;
  name: string;
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-change-in-production",
);

/**
 * Get authenticated session from JWT cookie
 */
async function getSession(request: NextRequest): Promise<SessionData | null> {
  const sessionCookie = request.cookies.get("session")?.value;

  if (!sessionCookie) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie, SECRET_KEY);
    return payload as unknown as SessionData;
  } catch (_error) {
    return null;
  }
}

/**
 * Paths that don't require authentication
 */
const publicPaths = [
  "/api/auth",
  "/login",
  "/signup",
  "/api/interview/consume-invite", // Public endpoint for candidates
];

/**
 * Check if path is public
 */
function isPublicPath(pathname: string): boolean {
  return publicPaths.some((path) => pathname.startsWith(path));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public paths without authentication
  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  // Get authenticated session
  const session = await getSession(request);

  // Redirect to login if not authenticated
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate required tenant context
  if (!session.enterpriseId || !session.userId) {
    return NextResponse.json(
      { error: "Invalid session: missing tenant context" },
      { status: 401 },
    );
  }

  // Create response with tenant context headers
  const response = NextResponse.next();

  // Set tenant context headers for downstream API routes
  response.headers.set("x-enterprise-id", session.enterpriseId);
  response.headers.set("x-user-id", session.userId);

  if (session.organisationId) {
    response.headers.set("x-organisation-id", session.organisationId);
  }

  // Optional: Set user role for authorization checks
  response.headers.set("x-user-role", session.role);

  return response;
}

/**
 * Configure which routes the middleware runs on
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
};
