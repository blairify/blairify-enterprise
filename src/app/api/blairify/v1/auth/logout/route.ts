import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions } from "@/db/schema/auth";
import { clearSessionCookie, getCurrentAuth } from "@/lib/session";

export async function POST(): Promise<Response> {
  const auth = await getCurrentAuth();

  if (!auth) {
    await clearSessionCookie();

    return Response.json({ success: true }, { status: 200 });
  }

  await db.delete(sessions).where(eq(sessions.id, auth.session.id));
  await clearSessionCookie();

  return Response.json({ success: true }, { status: 200 });
}
