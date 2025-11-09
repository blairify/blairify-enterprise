/**
 * API route for user registration
 * POST /api/auth/register
 */

import { hash } from "bcryptjs";
import { type NextRequest, NextResponse } from "next/server";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { prisma } from "@/lib/db/session-context";

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  enterpriseName?: string;
  organisationName?: string;
}

/**
 * Generate a URL-friendly slug from a string
 */
function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { email, password, name, enterpriseName, organisationName } = body;

    // Validate input
    if (!email || !password || !name) {
      return NextResponse.json(
        { error: "Email, password, and name are required" },
        { status: 400 },
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters long" },
        { status: 400 },
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "User with this email already exists" },
        { status: 409 },
      );
    }

    // Hash password
    const passwordHash = await hash(password, 10);

    // Create enterprise, organisation, and user in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create enterprise (or use existing if provided)
      let enterpriseId: string;
      let orgId: string;

      if (enterpriseName) {
        // Create new enterprise with unique slug
        let enterpriseSlug = generateSlug(enterpriseName);
        
        // Check if enterprise slug exists and make it unique
        const existingEnterprise = await tx.enterprise.findFirst({
          where: { slug: enterpriseSlug },
          select: { id: true },
        });

        if (existingEnterprise) {
          // Add random suffix to make slug unique
          enterpriseSlug = `${enterpriseSlug}-${Math.random().toString(36).substring(2, 8)}`;
        }

        const newEnterprise = await tx.enterprise.create({
          data: {
            name: enterpriseName,
            slug: enterpriseSlug,
          },
          select: { id: true },
        });
        enterpriseId = newEnterprise.id;

        // Create organisation under the new enterprise
        const orgSlug = generateSlug(organisationName || "main");
        const newOrg = await tx.organisation.create({
          data: {
            enterpriseId: enterpriseId,
            name: organisationName || "Main",
            slug: orgSlug,
          },
          select: { id: true },
        });
        orgId = newOrg.id;
      } else {
        // For demo: Create a default enterprise and org with unique slug
        const defaultEnterpriseName = `${name}'s Enterprise`;
        const baseSlug = generateSlug(defaultEnterpriseName);
        // Always make it unique with random suffix for default enterprises
        const enterpriseSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 8)}`;

        const newEnterprise = await tx.enterprise.create({
          data: {
            name: defaultEnterpriseName,
            slug: enterpriseSlug,
          },
          select: { id: true },
        });
        enterpriseId = newEnterprise.id;

        const newOrg = await tx.organisation.create({
          data: {
            enterpriseId: enterpriseId,
            name: "Main",
            slug: "main",
          },
          select: { id: true },
        });
        orgId = newOrg.id;
      }

      // Create user as ENTERPRISE_ADMIN (first user in new enterprise)
      const newUser = await tx.user.create({
        data: {
          enterpriseId: enterpriseId,
          orgId: orgId,
          email: email,
          name: name,
          passwordHash: passwordHash,
          role: "ENTERPRISE_ADMIN",
        },
        select: {
          id: true,
          enterpriseId: true,
          orgId: true,
          email: true,
          name: true,
          role: true,
        },
      });

      return newUser;
    });

    // Create session
    const sessionToken = await createSession({
      userId: result.id,
      enterpriseId: result.enterpriseId,
      organisationId: result.orgId,
      role: result.role,
      email: result.email,
      name: result.name,
    });

    // Set session cookie
    await setSessionCookie(sessionToken);

    return NextResponse.json(
      {
        success: true,
        user: {
          id: result.id,
          email: result.email,
          name: result.name,
          role: result.role,
          enterpriseId: result.enterpriseId,
          organisationId: result.orgId,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Registration error:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
