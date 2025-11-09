/**
 * API route for user login
 * POST /api/auth/login
 */

import { compare } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/session-context";

interface LoginRequest {
  email: string;
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user by email
    const userData = await prisma.user.findFirst({
      where: { email },
      select: {
        id: true,
        enterpriseId: true,
        orgId: true,
        email: true,
        name: true,
        role: true,
        passwordHash: true,
      },
    });

    if (!userData) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // For demo purposes, if no password_hash exists, accept any password
    // In production, you should require password_hash
    if (userData.passwordHash) {
      const isValidPassword = await compare(password, userData.passwordHash);
      if (!isValidPassword) {
        return NextResponse.json(
          { error: "Invalid email or password" },
          { status: 401 },
        );
      }
    }

    // Create session
    const sessionToken = await createSession({
      userId: userData.id,
      enterpriseId: userData.enterpriseId,
      organisationId: userData.orgId,
      role: userData.role,
      email: userData.email,
      name: userData.name,
    });

    // Set session cookie
    await setSessionCookie(sessionToken);

    return NextResponse.json({
      success: true,
      user: {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role,
        enterpriseId: userData.enterpriseId,
        organisationId: userData.orgId,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}
