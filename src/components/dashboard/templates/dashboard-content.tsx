"use client";

import { Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function DashboardContent() {
  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="rounded-full bg-muted p-6 mb-4">
            <Target className="h-12 w-12 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-2">No Interview Data Yet</h3>
          <p className="text-muted-foreground text-center max-w-md mb-6">
            Start your first interview to see your performance metrics, progress
            insights, and personalized recommendations.
          </p>
          <div className="flex gap-3">
            <Button asChild>
              <a href="/configure">Start Your First Interview</a>
            </Button>
            <Button variant="outline" asChild>
              <a href="/practice">Browse Practice Questions</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
