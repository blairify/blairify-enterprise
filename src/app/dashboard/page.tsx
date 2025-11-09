"use client";

import { Briefcase, FileText, TrendingUp, Users } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const stats = [
  {
    name: "Active Jobs",
    value: "12",
    change: "+2 this week",
    icon: Briefcase,
  },
  {
    name: "Total Candidates",
    value: "248",
    change: "+18 this week",
    icon: Users,
  },
  {
    name: "Pending Interviews",
    value: "34",
    change: "+5 today",
    icon: FileText,
  },
  {
    name: "Completion Rate",
    value: "87%",
    change: "+3% this month",
    icon: TrendingUp,
  },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your interviews.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.name}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.name}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Interviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    {String.fromCharCode(64 + i)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Candidate {i}</p>
                    <p className="text-xs text-muted-foreground">
                      Senior Software Engineer
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">2h ago</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Senior Software Engineer", count: 12 },
                { title: "Product Manager", count: 8 },
                { title: "UX Designer", count: 5 },
                { title: "DevOps Engineer", count: 3 },
              ].map((job) => (
                <div
                  key={job.title}
                  className="flex items-center justify-between"
                >
                  <div>
                    <p className="text-sm font-medium">{job.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {job.count} candidates
                    </p>
                  </div>
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                    {job.count}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
