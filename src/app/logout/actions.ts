"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db/client";
import { sessions } from "@/db/schema/auth";
import { clearSessionCookie, getCurrentAuth } from "@/lib/session";

export async function logoutAction(): Promise<void> {
  const auth = await getCurrentAuth();

  if (!auth) {
    await clearSessionCookie();
    redirect("/auth/signin");
  }

  await db.delete(sessions).where(eq(sessions.id, auth.session.id));
  await clearSessionCookie();
  redirect("/auth/signin");
}

export async function logoutAllSessionsAction(): Promise<void> {
  const auth = await getCurrentAuth();

  if (!auth) {
    await clearSessionCookie();
    redirect("/auth/signin");
  }

  await db.delete(sessions).where(eq(sessions.userId, auth.user.id));
  await clearSessionCookie();
  redirect("/auth/signin");
}
