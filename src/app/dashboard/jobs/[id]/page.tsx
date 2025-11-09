"use client";

import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Copy,
  Link as LinkIcon,
  Mail,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function JobDetailPage() {
  const params = useParams();
  const [isGenerating, setIsGenerating] = useState(false);
  const [inviteCode, setInviteCode] = useState<string | null>(null);
  const [expiresInHours, setExpiresInHours] = useState("168");

  // Mock data - replace with actual API call
  const job = {
    id: params.id,
    title: "Senior Software Engineer",
    description:
      "We are looking for an experienced software engineer to join our team.",
    status: "active",
    candidates: 12,
    createdAt: "2024-01-15",
  };

  const handleGenerateInvite = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch("/api/interview/create-invite", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-enterprise-id": "e32a4df7-976f-4e8f-9938-fb46c7bbccd0",
          "x-organisation-id": "661ac515-72e2-4c7b-bfc3-4a4f321be8c6",
          "x-user-id": "73fe5871-5454-4658-af22-ea9c3a0c4459",
        },
        body: JSON.stringify({
          jobListingId: params.id,
          maxUses: 1,
          expiresInHours: parseInt(expiresInHours, 10),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setInviteCode(data.inviteToken.code);
        toast.success("Invite code generated successfully!");
      } else {
        toast.error(data.error || "Failed to generate invite code");
      }
    } catch (error) {
      toast.error("Failed to generate invite code");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const inviteUrl = inviteCode
    ? `${window.location.origin}/interview/${inviteCode}`
    : "";

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <Link href="/dashboard/jobs">
          <Button variant="ghost" size="sm" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold">{job.title}</h1>
            <p className="text-muted-foreground">{job.description}</p>
          </div>
          <Badge
            variant="outline"
            className="bg-green-500/10 text-green-500 border-green-500/20"
          >
            {job.status}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Total Candidates
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{job.candidates}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Completed
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">8</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Pending
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">4</div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Candidates */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Candidates</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                        {String.fromCharCode(64 + i)}
                      </div>
                      <div>
                        <p className="text-sm font-medium">Candidate {i}</p>
                        <p className="text-xs text-muted-foreground">
                          candidate{i}@example.com
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className="bg-green-500/10 text-green-500 border-green-500/20"
                      >
                        <CheckCircle2 className="mr-1 h-3 w-3" />
                        Completed
                      </Badge>
                      <Button variant="ghost" size="sm">
                        View
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Generate Invite */}
          <Card>
            <CardHeader>
              <CardTitle>Invite Candidates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="expires">Expires In (hours)</Label>
                <Input
                  id="expires"
                  type="number"
                  value={expiresInHours}
                  onChange={(e) => setExpiresInHours(e.target.value)}
                  placeholder="168"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Default: 7 days (168 hours)
                </p>
              </div>

              <Button
                onClick={handleGenerateInvite}
                disabled={isGenerating}
                className="w-full"
              >
                {isGenerating ? "Generating..." : "Generate Invite Link"}
              </Button>

              {inviteCode && (
                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <Label className="text-xs">Invite Code</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={inviteCode} readOnly className="text-sm" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(inviteCode)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Invite URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input value={inviteUrl} readOnly className="text-sm" />
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => copyToClipboard(inviteUrl)}
                      >
                        <LinkIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" className="w-full">
                        <Mail className="mr-2 h-4 w-4" />
                        Email Invite
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Email Invite</DialogTitle>
                        <DialogDescription>
                          Send this interview invite to a candidate
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="email">Candidate Email</Label>
                          <Input
                            id="email"
                            type="email"
                            placeholder="candidate@example.com"
                          />
                        </div>
                        <Button className="w-full">Send Invite</Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Job Info */}
          <Card>
            <CardHeader>
              <CardTitle>Job Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Created:</span>
                <span>{new Date(job.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Candidates:</span>
                <span>{job.candidates}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
