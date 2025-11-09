"use client";

import { Eye, Mail, MapPin, Phone, Search, Star } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

// Mock data
const candidates = [
  {
    id: "1",
    name: "Alice Johnson",
    email: "alice@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    jobTitle: "Senior Software Engineer",
    status: "completed",
    score: 85,
    interviewDate: "2024-01-15",
  },
  {
    id: "2",
    name: "Bob Smith",
    email: "bob@example.com",
    phone: "+1 (555) 234-5678",
    location: "New York, NY",
    jobTitle: "Product Manager",
    status: "completed",
    score: 92,
    interviewDate: "2024-01-14",
  },
  {
    id: "3",
    name: "Carol White",
    email: "carol@example.com",
    phone: "+1 (555) 345-6789",
    location: "Austin, TX",
    jobTitle: "UX Designer",
    status: "in_progress",
    score: null,
    interviewDate: "2024-01-16",
  },
  {
    id: "4",
    name: "David Brown",
    email: "david@example.com",
    phone: "+1 (555) 456-7890",
    location: "Seattle, WA",
    jobTitle: "DevOps Engineer",
    status: "pending",
    score: null,
    interviewDate: null,
  },
  {
    id: "5",
    name: "Eve Davis",
    email: "eve@example.com",
    phone: "+1 (555) 567-8901",
    location: "Boston, MA",
    jobTitle: "Senior Software Engineer",
    status: "completed",
    score: 78,
    interviewDate: "2024-01-13",
  },
  {
    id: "6",
    name: "Frank Miller",
    email: "frank@example.com",
    phone: "+1 (555) 678-9012",
    location: "Denver, CO",
    jobTitle: "Data Scientist",
    status: "completed",
    score: 88,
    interviewDate: "2024-01-12",
  },
];

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredCandidates = candidates.filter(
    (candidate) =>
      candidate.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      candidate.jobTitle.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const getScoreColor = (score: number | null) => {
    if (score === null) return "";
    if (score >= 90) return "text-green-600";
    if (score >= 75) return "text-blue-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Candidates</h1>
        <p className="text-muted-foreground">
          View and manage all candidates who have completed interviews
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search candidates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Candidates Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredCandidates.map((candidate) => (
          <Card
            key={candidate.id}
            className="hover:shadow-lg transition-shadow"
          >
            <CardContent className="p-6">
              <div className="mb-4 flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-lg font-semibold text-primary">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold">{candidate.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {candidate.jobTitle}
                    </p>
                  </div>
                </div>
                {candidate.score !== null && (
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span
                      className={`font-semibold ${getScoreColor(candidate.score)}`}
                    >
                      {candidate.score}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{candidate.email}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="h-4 w-4" />
                  <span>{candidate.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>{candidate.location}</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between">
                <Badge
                  variant="outline"
                  className={
                    candidate.status === "completed"
                      ? "bg-green-500/10 text-green-500 border-green-500/20"
                      : candidate.status === "in_progress"
                        ? "bg-blue-500/10 text-blue-500 border-blue-500/20"
                        : "bg-yellow-500/10 text-yellow-500 border-yellow-500/20"
                  }
                >
                  {candidate.status === "completed"
                    ? "Completed"
                    : candidate.status === "in_progress"
                      ? "In Progress"
                      : "Pending"}
                </Badge>
                {candidate.interviewDate && (
                  <span className="text-xs text-muted-foreground">
                    {new Date(candidate.interviewDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              <Button variant="outline" className="mt-4 w-full">
                <Eye className="mr-2 h-4 w-4" />
                View Profile
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredCandidates.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No candidates found</p>
        </div>
      )}
    </div>
  );
}
