import { and, eq } from "drizzle-orm";

import { Typography } from "@/components/common/atoms/typography";
import { db } from "@/db/client";
import {
  publicInterviewAttempts,
  publicInterviewLinks,
} from "@/db/schema/auth";
import { PublicInterviewRunner } from "./public-interview-runner";

export const metadata = {
  title: "Interview | Blairify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicInterviewAttemptPage({
  params,
}: {
  params: Promise<{ publicId: string; attemptId: string }>;
}) {
  const { publicId, attemptId } = await params;

  const link = await db
    .select()
    .from(publicInterviewLinks)
    .where(eq(publicInterviewLinks.publicId, publicId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!link) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <Typography.Body className="text-sm">
          Invalid interview link.
        </Typography.Body>
      </div>
    );
  }

  const attempt = await db
    .select()
    .from(publicInterviewAttempts)
    .where(
      and(
        eq(publicInterviewAttempts.id, attemptId),
        eq(publicInterviewAttempts.publicInterviewLinkId, link.id),
      ),
    )
    .limit(1)
    .then((rows) => rows[0] ?? null);

  if (!attempt) {
    return (
      <div className="mx-auto w-full max-w-xl px-4 py-10">
        <Typography.Body className="text-sm">
          Invalid interview attempt.
        </Typography.Body>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <PublicInterviewRunner
        publicId={publicId}
        attemptId={attemptId}
        linkTitle={link.title}
        plan={link.plan}
        isCompleted={attempt.status === "completed"}
      />
    </div>
  );
}
