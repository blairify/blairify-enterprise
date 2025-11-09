"use client";

import {
  AlertCircle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Filter,
  Search,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Mock data
const interviews = [
  {
    id: "1",
    candidateName: "Alice Johnson",
    candidateEmail: "alice@example.com",
    jobTitle: "Senior Software Engineer",
    status: "completed",
    startedAt: "2024-01-15T10:00:00",
    completedAt: "2024-01-15T10:45:00",
    score: 85,
  },
  {
    id: "2",
    candidateName: "Bob Smith",
    candidateEmail: "bob@example.com",
    jobTitle: "Product Manager",
    status: "completed",
    startedAt: "2024-01-14T14:00:00",
    completedAt: "2024-01-14T14:30:00",
    score: 92,
  },
  {
    id: "3",
    candidateName: "Carol White",
    candidateEmail: "carol@example.com",
    jobTitle: "UX Designer",
    status: "in_progress",
    startedAt: "2024-01-16T09:00:00",
    completedAt: null,
    score: null,
  },
  {
    id: "4",
    candidateName: "David Brown",
    candidateEmail: "david@example.com",
    jobTitle: "DevOps Engineer",
    status: "pending",
    startedAt: null,
    completedAt: null,
    score: null,
  },
  {
    id: "5",
    candidateName: "Eve Davis",
    candidateEmail: "eve@example.com",
    jobTitle: "Senior Software Engineer",
    status: "expired",
    startedAt: null,
    completedAt: null,
    score: null,
  },
];

const statusConfig = {
  completed: {
    label: "Completed",
    color: "bg-green-500/10 text-green-500 border-green-500/20",
    icon: CheckCircle2,
  },
  in_progress: {
    label: "In Progress",
    color: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    icon: AlertCircle,
  },
  pending: {
    label: "Pending",
    color: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    icon: Clock,
  },
  expired: {
    label: "Expired",
    color: "bg-gray-500/10 text-gray-500 border-gray-500/20",
    icon: XCircle,
  },
};

export default function InterviewsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const filteredInterviews = interviews.filter((interview) => {
    const matchesSearch =
      interview.candidateName
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      interview.candidateEmail
        .toLowerCase()
        .includes(searchQuery.toLowerCase()) ||
      interview.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || interview.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Interviews</h1>
        <p className="text-muted-foreground">
          View and manage all interview sessions
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Interviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{interviews.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter((i) => i.status === "completed").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {interviews.filter((i) => i.status === "in_progress").length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                interviews
                  .filter((i) => i.score !== null)
                  .reduce((acc, i) => acc + (i.score || 0), 0) /
                  interviews.filter((i) => i.score !== null).length,
              )}
              %
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="mb-6 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or job..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <Filter className="mr-2 h-4 w-4" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="expired">Expired</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Interviews Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                    Candidate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                    Job Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                    Started
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground">
                    Score
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-muted-foreground">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredInterviews.map((interview) => {
                  const StatusIcon =
                    statusConfig[interview.status as keyof typeof statusConfig]
                      .icon;
                  return (
                    <tr key={interview.id} className="hover:bg-muted/50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium">
                            {interview.candidateName}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {interview.candidateEmail}
                          </p>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm">
                        {interview.jobTitle}
                      </td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={
                            statusConfig[
                              interview.status as keyof typeof statusConfig
                            ].color
                          }
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {
                            statusConfig[
                              interview.status as keyof typeof statusConfig
                            ].label
                          }
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-sm text-muted-foreground">
                        {interview.startedAt ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(interview.startedAt).toLocaleDateString()}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {interview.score !== null ? (
                          <span className="font-medium">
                            {interview.score}%
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          {interview.status === "completed" && (
                            <Button variant="ghost" size="sm">
                              <Download className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInterviews.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12">
              <p className="text-muted-foreground">No interviews found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
