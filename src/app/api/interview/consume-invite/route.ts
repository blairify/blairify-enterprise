/**
 * API route to consume interview invite tokens
 * POST /api/interview/consume-invite
 *
 * This is a PUBLIC endpoint - candidates use invite codes without authentication
 * Implements single-use transaction with row-level locking
 */

import { Prisma } from "@prisma/client";
import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/session-context";

interface ConsumeInviteRequest {
  code: string;
  candidateEmail: string;
  candidateName: string;
}

interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

interface QuestionsSnapshot {
  questions: Question[];
}

interface ConsumeInviteResponse {
  success: boolean;
  interviewSession?: {
    id: string;
    jobListing: {
      id: string;
      title: string;
      description: string;
    };
    questionsSnapshot: QuestionsSnapshot;
    status: string;
  };
  error?: string;
}

export async function POST(
  request: NextRequest,
): Promise<NextResponse<ConsumeInviteResponse>> {
  try {
    // Parse request body
    const body: ConsumeInviteRequest = await request.json();
    const { code, candidateEmail, candidateName } = body;

    // Validate input
    if (!code || !candidateEmail || !candidateName) {
      return NextResponse.json(
        {
          success: false,
          error: "code, candidateEmail, and candidateName are required",
        },
        { status: 400 },
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(candidateEmail)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 },
      );
    }

    // Execute single-use transaction with row-level locking
    const result = await prisma.$transaction(
      async (tx) => {
        // Step 1: SELECT FOR UPDATE to lock the invite token row
        // This prevents concurrent consumption of the same token
        const inviteToken = await tx.$queryRaw<
          Array<{
            id: string;
            enterprise_id: string;
            org_id: string;
            job_listing_id: string;
            code: string;
            max_uses: number;
            uses: number;
            expires_at: Date;
          }>
        >`
        SELECT * FROM invite_token 
        WHERE code = ${code}
        FOR UPDATE
      `;

        // Check if token exists
        if (!inviteToken || inviteToken.length === 0) {
          throw new Error("Invalid invite code");
        }

        const token = inviteToken[0];

        // Step 2: Validate token is not expired
        if (new Date(token.expires_at) < new Date()) {
          throw new Error("Invite code has expired");
        }

        // Step 3: Validate token has not exceeded max uses
        if (token.uses >= token.max_uses) {
          throw new Error("Invite code has already been used");
        }

        // Step 4: Get job listing and question templates
        // Note: We bypass RLS here since this is a public endpoint
        const jobListing = await tx.$queryRaw<
          Array<{
            id: string;
            enterprise_id: string;
            org_id: string;
            title: string;
            description: string;
            status: string;
          }>
        >`
        SELECT id, enterprise_id, org_id, title, description, status
        FROM job_listing
        WHERE id = ${token.job_listing_id}
      `;

        if (!jobListing || jobListing.length === 0) {
          throw new Error("Job listing not found");
        }

        const job = jobListing[0];

        if (job.status !== "active") {
          throw new Error("Job listing is not active");
        }

        // Step 5: Get or create candidate user
        // Check if candidate already exists
        const candidate = await tx.$queryRaw<
          Array<{
            id: string;
          }>
        >`
        SELECT id FROM "user"
        WHERE enterprise_id = ${token.enterprise_id}
        AND email = ${candidateEmail}
      `;

        let candidateId: string;

        if (candidate && candidate.length > 0) {
          candidateId = candidate[0].id;
        } else {
          // Create new candidate user
          const newCandidate = await tx.$queryRaw<
            Array<{
              id: string;
            }>
          >`
          INSERT INTO "user" (enterprise_id, org_id, email, name, role)
          VALUES (${token.enterprise_id}, ${token.org_id}, ${candidateEmail}, ${candidateName}, 'CANDIDATE')
          RETURNING id
        `;
          candidateId = newCandidate[0].id;
        }

        // Step 6: Get question templates for the job
        const jobTemplates = await tx.$queryRaw<
          Array<{
            question_template_id: string | null;
            custom_questions: Prisma.JsonValue;
          }>
        >`
        SELECT question_template_id, custom_questions
        FROM job_template
        WHERE job_listing_id = ${token.job_listing_id}
      `;

        // Build questions snapshot
        const questionsSnapshot: QuestionsSnapshot = { questions: [] };

        if (jobTemplates && jobTemplates.length > 0) {
          for (const template of jobTemplates) {
            // Get template questions if template_id exists
            if (template.question_template_id) {
              const questionTemplate = await tx.$queryRaw<
                Array<{
                  questions: Prisma.JsonValue;
                }>
              >`
              SELECT questions
              FROM question_template
              WHERE id = ${template.question_template_id}
            `;

              if (questionTemplate && questionTemplate.length > 0) {
                const templateQuestions = questionTemplate[0].questions;
                if (Array.isArray(templateQuestions)) {
                  questionsSnapshot.questions.push(
                    ...(templateQuestions as unknown as Question[]),
                  );
                }
              }
            }

            // Add custom questions
            if (template.custom_questions) {
              const customQuestions = template.custom_questions;
              if (Array.isArray(customQuestions)) {
                questionsSnapshot.questions.push(
                  ...(customQuestions as unknown as Question[]),
                );
              }
            }
          }
        }

        // Default questions if none configured
        if (questionsSnapshot.questions.length === 0) {
          questionsSnapshot.questions = [
            { id: "1", text: "Tell us about yourself", type: "text" },
            {
              id: "2",
              text: "Why are you interested in this position?",
              type: "text",
            },
          ];
        }

        // Step 7: Create interview session
        const interviewSession = await tx.$queryRaw<
          Array<{
            id: string;
          }>
        >`
        INSERT INTO interview_session (
          enterprise_id, org_id, job_listing_id, candidate_id, 
          invite_token_id, questions_snapshot, status
        )
        VALUES (
          ${token.enterprise_id}, ${token.org_id}, ${token.job_listing_id}, 
          ${candidateId}, ${token.id}, ${JSON.stringify(questionsSnapshot)}::jsonb, 'pending'
        )
        RETURNING id
      `;

        const sessionId = interviewSession[0].id;

        // Step 8: Increment token usage count
        await tx.$executeRaw`
        UPDATE invite_token 
        SET uses = uses + 1, updated_at = NOW()
        WHERE id = ${token.id}
      `;

        // Return session details
        return {
          sessionId,
          jobListing: {
            id: job.id,
            title: job.title,
            description: job.description,
          },
          questionsSnapshot,
        };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000, // 10 second timeout
      },
    );

    // Return success response
    return NextResponse.json(
      {
        success: true,
        interviewSession: {
          id: result.sessionId,
          jobListing: result.jobListing,
          questionsSnapshot: result.questionsSnapshot,
          status: "pending",
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Error consuming invite token:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 400 },
      );
    }

    return NextResponse.json(
      { success: false, error: "Failed to consume invite token" },
      { status: 500 },
    );
  }
}
