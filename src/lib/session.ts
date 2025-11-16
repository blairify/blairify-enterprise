import "server-only";

import { eq } from "drizzle-orm";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import type { Enterprise, Session, User } from "@/db/schema/auth";
import { enterprises, sessions, users } from "@/db/schema/auth";

const SESSION_COOKIE_NAME = "bea_session";
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

interface AuthContext {
  user: User;
  enterprise: Enterprise;
  session: Session;
}

async function getClientInfo() {
  const h = await headers();
  const forwardedFor = h.get("x-forwarded-for");
  const ip = forwardedFor?.split(",")[0]?.trim();
  const userAgent = h.get("user-agent") ?? undefined;

  return {
    ipAddress: ip,
    userAgent,
  };
}

export async function createSession(user: User): Promise<void> {
  const cookieStore = await cookies();

  const sessionId = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  const clientInfo = await getClientInfo();

  await db.insert(sessions).values({
    id: sessionId,
    userId: user.id,
    enterpriseId: user.enterpriseId,
    expiresAt,
    ipAddress: clientInfo.ipAddress,
    userAgent: clientInfo.userAgent,
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getCurrentAuth(): Promise<AuthContext | null> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  if (!sessionId) {
    return null;
  }

  const rows = await db
    .select({
      session: sessions,
      user: users,
      enterprise: enterprises,
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .innerJoin(enterprises, eq(enterprises.id, sessions.enterpriseId))
    .where(eq(sessions.id, sessionId))
    .limit(1);

  const row = rows[0];

  if (!row) {
    await clearSessionCookie();
    return null;
  }

  if (row.session.expiresAt <= new Date()) {
    await db.delete(sessions).where(eq(sessions.id, sessionId));
    await clearSessionCookie();
    return null;
  }

  return {
    session: row.session,
    user: row.user,
    enterprise: row.enterprise,
  };
}

export async function requireAuth(): Promise<AuthContext> {
  const auth = await getCurrentAuth();

  if (!auth) {
    redirect("/signin");
  }

  return auth;
}
