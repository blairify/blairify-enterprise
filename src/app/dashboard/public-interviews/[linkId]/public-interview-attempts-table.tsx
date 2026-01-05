"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type AttemptStatus = "started" | "completed";

interface PublicInterviewAttemptRow {
  candidateName: string;
  email: string;
  status: AttemptStatus;
  completedAtLabel?: string;
  scoreLabel?: string;
  attemptId: string | null;
  linkId: string;
}

interface PublicInterviewAttemptsTableProps {
  rows: PublicInterviewAttemptRow[];
}

export function PublicInterviewAttemptsTable({
  rows,
}: PublicInterviewAttemptsTableProps) {
  return (
    <div className="space-y-4">
      <div className="hidden md:block">
        <Table className="min-w-[640px]">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">Candidate</TableHead>
              <TableHead className="w-[24%]">Email</TableHead>
              <TableHead className="w-[16%]">Completed</TableHead>
              <TableHead className="text-right">Score</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => {
              const rowKey = `${row.email}-${row.status}-${row.completedAtLabel ?? ""}`;
              return (
                <TableRow key={rowKey}>
                  <TableCell className="whitespace-normal">
                    <div className="font-medium text-foreground">
                      {row.candidateName}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-normal">
                    <div className="break-all text-sm text-muted-foreground">
                      {row.email}
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {row.completedAtLabel ?? "—"}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    {row.scoreLabel ?? "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    {row.status === "completed" && row.attemptId ? (
                      <Button asChild variant="outline" size="sm">
                        <Link
                          href={`/dashboard/public-interviews/${row.linkId}/attempts/${row.attemptId}`}
                        >
                          View results
                        </Link>
                      </Button>
                    ) : null}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      <div className="space-y-3 md:hidden">
        {rows.map((row) => {
          const rowKey = `${row.email}-${row.status}-${row.completedAtLabel ?? ""}`;
          return (
            <article
              key={rowKey}
              className="rounded-2xl border border-border/60 bg-muted/10 p-4 shadow-sm"
            >
              <div className="flex flex-col gap-2">
                <div className="flex flex-col gap-1">
                  <p className="text-base font-semibold text-foreground">
                    {row.candidateName}
                  </p>
                  <p className="break-all text-sm text-muted-foreground">
                    {row.email}
                  </p>
                </div>
              </div>

              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Completed
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {row.completedAtLabel ?? "—"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Score
                  </dt>
                  <dd className="mt-1 text-foreground">
                    {row.scoreLabel ?? "—"}
                  </dd>
                </div>
              </dl>

              {row.status === "completed" && row.attemptId ? (
                <Button
                  asChild
                  variant="outline"
                  className="mt-4 w-full justify-center"
                >
                  <Link
                    href={`/dashboard/public-interviews/${row.linkId}/attempts/${row.attemptId}`}
                  >
                    View results
                  </Link>
                </Button>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
