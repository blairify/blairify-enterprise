import { eq } from "drizzle-orm";

import { Typography } from "@/components/common/atoms/typography";
import { Card, CardContent } from "@/components/ui/card";
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-background via-background to-muted/30 px-4 py-12">
      <div className="w-full max-w-lg">
        <div className="mb-8 text-center">
          <Typography.Heading2 className="mb-2">
            {link?.title ?? "Interview"}
          </Typography.Heading2>
          <Typography.Caption className="text-muted-foreground">
            Please provide your details to begin
          </Typography.Caption>
        </div>
        <Card className="shadow-xl shadow-primary/5">
          <CardContent className="pt-6">
            <PublicInterviewIntakeForm publicId={publicId} />
          </CardContent>
        </Card>
        <Typography.SubCaption className="mt-6 block text-center text-muted-foreground">
          Powered by Blairify
        </Typography.SubCaption>
      </div>
    </div>
  );
}
