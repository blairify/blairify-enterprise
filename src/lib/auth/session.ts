/**
 * Session management for authentication
 * Uses secure HTTP-only cookies for session storage
 */

import { jwtVerify, SignJWT } from "jose";
import { cookies } from "next/headers";

export interface SessionData {
  userId: string;
  enterpriseId: string;
  organisationId: string | null;
  role: string;
  email: string;
  name: string;
  [key: string]: string | null; // Index signature for JWT compatibility
}

const SECRET_KEY = new TextEncoder().encode(
  process.env.SESSION_SECRET || "your-secret-key-change-in-production",
);

const SESSION_DURATION = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Create a new session token
 */
export async function createSession(data: SessionData): Promise<string> {
  const token = await new SignJWT(data)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(SECRET_KEY);

  return token;
}

/**
 * Verify and decode a session token
 */
export async function verifySession(
  token: string,
): Promise<SessionData | null> {
  try {
    const { payload } = await jwtVerify(token, SECRET_KEY);
    return payload as unknown as SessionData;
  } catch (_error) {
    return null;
  }
}

/**
 * Set session cookie
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });
}

/**
 * Get session from cookie
 */
export async function getSession(): Promise<SessionData | null> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("session");

  if (!sessionCookie) {
    return null;
  }

  return verifySession(sessionCookie.value);
}

/**
 * Clear session cookie
 */
export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
