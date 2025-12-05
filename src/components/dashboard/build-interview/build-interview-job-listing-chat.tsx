"use client";

import { useState } from "react";
import type { JobListingQuestions } from "@/app/dashboard/build-interview/actions";
import { aiGenerateQuestionsFromJobListing } from "@/app/dashboard/build-interview/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function BuildInterviewJobListingChat() {
  const [jobListing, setJobListing] = useState("");
  const [result, setResult] = useState<JobListingQuestions | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = jobListing.trim();

    if (!trimmed) {
      return;
    }

    setError(null);
    setIsGenerating(true);

    try {
      const questions = await aiGenerateQuestionsFromJobListing(trimmed);
      setResult(questions);
    } catch {
      setError(
        "Something went wrong while generating questions. Please try again.",
      );
    } finally {
      setIsGenerating(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Build from job listing</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="job-listing">Job listing</Label>
            <Textarea
              id="job-listing"
              value={jobListing}
              onChange={(event) => setJobListing(event.target.value)}
              placeholder="Paste the full job listing here..."
              rows={8}
            />
          </div>
          <div className="flex items-center justify-end">
            <Button type="submit" disabled={isGenerating || !jobListing.trim()}>
              {isGenerating ? "Generating questions..." : "Generate questions"}
            </Button>
          </div>
        </form>

        {error ? <p className="text-xs text-destructive">{error}</p> : null}

        {result ? (
          <div className="space-y-2 border-t pt-3 text-sm">
            <p className="font-medium">Suggested interview questions</p>
            <ol className="list-decimal space-y-1 pl-4 text-xs">
              {result.questions.map((question: string, index: number) => (
                <li key={index}>{question}</li>
              ))}
            </ol>
            {result.notes ? (
              <div className="space-y-1 pt-2">
                <p className="text-muted-foreground">Notes</p>
                <p className="text-xs whitespace-pre-line">{result.notes}</p>
              </div>
            ) : null}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}
