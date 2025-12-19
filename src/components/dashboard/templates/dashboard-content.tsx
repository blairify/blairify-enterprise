"use client";

import { Target } from "lucide-react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Target className="size-12 text-muted-foreground" />
          </div>
          <Typography.Heading3 className="text-xl font-semibold mb-2">
            No Interview Data Yet
          </Typography.Heading3>
          <Typography.Body className="text-muted-foreground text-center max-w-md mb-6">
            Start your first interview to see your performance metrics, progress
            insights, and personalized recommendations.
          </Typography.Body>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button asChild className="w-full sm:w-auto">
              <a href="/configure">Start Your First Interview</a>
            </Button>
            <Button variant="outline" asChild className="w-full sm:w-auto">
              <a href="/practice">Browse Practice Questions</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
