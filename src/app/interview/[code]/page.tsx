"use client";

import { CheckCircle2, Clock, Mic, Video } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";

interface InterviewSession {
  id: string;
  candidateUserId: string;
  jobListing: {
    title: string;
  };
  questionsSnapshot: {
    questions: Array<{
      id: string;
      text: string;
      type: string;
    }>;
  };
}

export default function InterviewPage() {
  const params = useParams();
  const [step, setStep] = useState<"info" | "interview" | "complete">("info");
  const [candidateName, setCandidateName] = useState("");
  const [candidateEmail, setCandidateEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});

  const handleStartInterview = async () => {
    if (!candidateName || !candidateEmail) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch("/api/interview/consume-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code: params.code,
          candidateEmail,
          candidateName,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSession(data.interviewSession);
        setStep("interview");
        toast.success("Interview started!");
      } else {
        toast.error(data.error || "Failed to start interview");
      }
    } catch (error) {
      toast.error("Failed to start interview");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = () => {
    if (!session) return;

    if (currentQuestion < session.questionsSnapshot.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setStep("complete");
      toast.success("Interview completed!");
    }
  };

  const handleResponseChange = (questionId: string, value: string) => {
    setResponses({
      ...responses,
      [questionId]: value,
    });
  };

  const progress =
    session && session.questionsSnapshot.questions.length > 0
      ? ((currentQuestion + 1) / session.questionsSnapshot.questions.length) *
        100
      : 0;

  if (step === "info") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <Video className="h-8 w-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">
              Welcome to Your Interview
            </CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Please provide your information to begin
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={candidateName}
                onChange={(e) => setCandidateName(e.target.value)}
                placeholder="John Doe"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={candidateEmail}
                onChange={(e) => setCandidateEmail(e.target.value)}
                placeholder="john@example.com"
              />
            </div>
            <Button
              onClick={handleStartInterview}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? "Starting..." : "Start Interview"}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              By continuing, you agree to our terms and conditions
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (step === "interview" && session) {
    const question = session.questionsSnapshot.questions[currentQuestion];

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold">
                  {session.jobListing.title}
                </h1>
                <p className="text-sm text-muted-foreground">
                  Question {currentQuestion + 1} of{" "}
                  {session.questionsSnapshot.questions.length}
                </p>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>5:00</span>
              </div>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-xl">{question.text}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={responses[question.id] || ""}
                onChange={(e) =>
                  handleResponseChange(question.id, e.target.value)
                }
                placeholder="Type your answer here..."
                className="min-h-[200px]"
              />

              <div className="flex items-center gap-4">
                <Button variant="outline" size="lg" className="flex-1" disabled>
                  <Mic className="mr-2 h-4 w-4" />
                  Record Audio
                </Button>
                <Button variant="outline" size="lg" className="flex-1" disabled>
                  <Video className="mr-2 h-4 w-4" />
                  Record Video
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Navigation */}
          <div className="flex justify-between">
            <Button
              variant="outline"
              onClick={() =>
                setCurrentQuestion(Math.max(0, currentQuestion - 1))
              }
              disabled={currentQuestion === 0}
            >
              Previous
            </Button>
            <Button onClick={handleNextQuestion} size="lg">
              {currentQuestion ===
              session.questionsSnapshot.questions.length - 1
                ? "Complete Interview"
                : "Next Question"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "complete") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-primary/5 p-4">
        <Card className="w-full max-w-md text-center">
          <CardHeader>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <CardTitle className="text-2xl">Interview Complete!</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">
              Thank you for completing the interview. We'll review your
              responses and get back to you soon.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="rounded-lg bg-muted p-4 text-left">
                <p className="text-sm font-medium mb-2">What's Next?</p>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Our team will review your responses</li>
                  <li>• You'll hear from us within 3-5 business days</li>
                  <li>• Check your email for updates</li>
                </ul>
              </div>
              <Button className="w-full" asChild>
                <a href="/">Return to Home</a>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}
