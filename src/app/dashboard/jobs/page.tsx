"use client";

import { Calendar, MoreVertical, Plus, Search, Users } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

// Mock data - replace with actual API call
const jobs = [
  {
    id: "48237bec-855b-4bcc-adbe-e1589c40d76c",
    title: "Senior Software Engineer",
    description:
      "We are looking for an experienced software engineer to join our team.",
    status: "active",
    candidates: 12,
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Product Manager",
    description: "Lead product strategy and execution for our core platform.",
    status: "active",
    candidates: 8,
    createdAt: "2024-01-14",
  },
  {
    id: "3",
    title: "UX Designer",
    description: "Design beautiful and intuitive user experiences.",
    status: "draft",
    candidates: 0,
    createdAt: "2024-01-13",
  },
  {
    id: "4",
    title: "DevOps Engineer",
    description:
      "Build and maintain our infrastructure and deployment pipelines.",
    status: "active",
    candidates: 5,
    createdAt: "2024-01-12",
  },
];

const statusColors = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  draft: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  closed: "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

export default function JobsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredJobs = jobs.filter((job) =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Job Listings</h1>
          <p className="text-muted-foreground">
            Manage your job postings and interview processes
          </p>
        </div>
        <Link href="/dashboard/jobs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Job
          </Button>
        </Link>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredJobs.map((job) => (
          <Card key={job.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{job.title}</CardTitle>
                  <Badge
                    variant="outline"
                    className={`mt-2 ${statusColors[job.status as keyof typeof statusColors]}`}
                  >
                    {job.status}
                  </Badge>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit</DropdownMenuItem>
                    <DropdownMenuItem>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
                {job.description}
              </p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{job.candidates}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <Link href={`/dashboard/jobs/${job.id}`}>
                <Button variant="outline" className="mt-4 w-full">
                  View Details
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-muted-foreground">No jobs found</p>
        </div>
      )}
    </div>
  );
}
