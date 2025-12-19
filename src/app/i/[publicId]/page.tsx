import { eq } from "drizzle-orm";

import { Typography } from "@/components/common/atoms/typography";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { db } from "@/db/client";
import { publicInterviewLinks } from "@/db/schema/auth";
import { PublicInterviewIntakeForm } from "./public-interview-intake-form";

export const metadata = {
  title: "Interview | Blairify",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PublicInterviewEntryPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;

  const link = await db
    .select({ title: publicInterviewLinks.title })
    .from(publicInterviewLinks)
    .where(eq(publicInterviewLinks.publicId, publicId))
    .limit(1)
    .then((rows) => rows[0] ?? null);

  return (
    <div className="mx-auto w-full max-w-xl px-4 py-10">
      <Card>
        <CardHeader>
          <CardTitle>{link?.title ?? "Interview"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Typography.Body className="text-sm text-muted-foreground">
            Please provide your details before starting the interview.
          </Typography.Body>
          <PublicInterviewIntakeForm publicId={publicId} />
        </CardContent>
      </Card>
    </div>
  );
}
