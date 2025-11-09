/**
 * API route to create interview invite tokens
 * POST /api/interview/create-invite
 */

import { randomBytes } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import {
  getTenantContextFromHeaders,
  prisma,
  withTenantContext,
} from "@/lib/db/session-context";

interface CreateInviteRequest {
  jobListingId: string;
  maxUses?: number;
  expiresInHours?: number;
}

/**
 * Generate a secure random invite code
 */
function generateInviteCode(): string {
  return randomBytes(16).toString("base64url");
}

export async function POST(request: NextRequest) {
  try {
    // Extract tenant context from headers (set by middleware)
    const context = getTenantContextFromHeaders(request.headers);

    // Parse request body
    const body: CreateInviteRequest = await request.json();
    const { jobListingId, maxUses = 1, expiresInHours = 168 } = body; // Default 7 days

    // Validate input
    if (!jobListingId) {
      return NextResponse.json(
        { error: "jobListingId is required" },
        { status: 400 },
      );
    }

    if (maxUses < 1 || maxUses > 1000) {
      return NextResponse.json(
        { error: "maxUses must be between 1 and 1000" },
        { status: 400 },
      );
    }

    if (expiresInHours < 1 || expiresInHours > 8760) {
      // Max 1 year
      return NextResponse.json(
        { error: "expiresInHours must be between 1 and 8760" },
        { status: 400 },
      );
    }

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + expiresInHours);

    // Create invite token with tenant context
    const inviteToken = await withTenantContext(prisma, context, async () => {
      // First verify the job listing exists and belongs to the tenant
      const jobListing = await prisma.jobListing.findUnique({
        where: { id: jobListingId },
        select: {
          id: true,
          enterpriseId: true,
          orgId: true,
          status: true,
        },
      });

      if (!jobListing) {
        throw new Error("Job listing not found");
      }

      if (jobListing.status !== "active") {
        throw new Error("Job listing is not active");
      }

      // Verify tenant context matches
      if (
        jobListing.enterpriseId !== context.enterpriseId ||
        jobListing.orgId !== context.organisationId
      ) {
        throw new Error("Job listing does not belong to your organization");
      }

      // Generate unique code
      let code = generateInviteCode();
      let attempts = 0;
      const maxAttempts = 5;

      // Ensure code is unique (unlikely collision, but handle it)
      while (attempts < maxAttempts) {
        const existing = await prisma.inviteToken.findUnique({
          where: { code },
        });

        if (!existing) break;

        code = generateInviteCode();
        attempts++;
      }

      if (attempts >= maxAttempts) {
        throw new Error("Failed to generate unique invite code");
      }

      // Create the invite token
      return prisma.inviteToken.create({
        data: {
          enterpriseId: context.enterpriseId,
          orgId: context.organisationId || context.enterpriseId,
          jobListingId,
          code,
          maxUses,
          expiresAt,
        },
        include: {
          jobListing: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      });
    });

    // Return the created invite token
    return NextResponse.json(
      {
        success: true,
        inviteToken: {
          id: inviteToken.id,
          code: inviteToken.code,
          maxUses: inviteToken.maxUses,
          uses: inviteToken.uses,
          expiresAt: inviteToken.expiresAt,
          jobListing: inviteToken.jobListing,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error creating invite token:", error);

    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json(
      { error: "Failed to create invite token" },
      { status: 500 },
    );
  }
}
