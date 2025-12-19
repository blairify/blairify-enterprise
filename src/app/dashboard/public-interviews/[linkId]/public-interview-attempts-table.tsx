"use client";

import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

function statusBadgeVariant(status: AttemptStatus): "secondary" | "outline" {
  switch (status) {
    case "completed":
      return "secondary";
    case "started":
      return "outline";
    default: {
      const _never: never = status;
      throw new Error(`Unhandled status: ${_never}`);
    }
  }
}

export function PublicInterviewAttemptsTable({
  rows,
}: PublicInterviewAttemptsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[34%]">Candidate</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Completed</TableHead>
          <TableHead className="text-right">Score</TableHead>
          <TableHead></TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => (
          <TableRow
            key={`${row.email}-${row.status}-${row.completedAtLabel ?? ""}`}
          >
            <TableCell className="whitespace-normal">
              <div className="font-medium text-foreground">
                {row.candidateName}
              </div>
            </TableCell>
            <TableCell className="whitespace-normal">
              <div className="text-sm text-muted-foreground break-all">
                {row.email}
              </div>
            </TableCell>
            <TableCell>
              <Badge
                variant={statusBadgeVariant(row.status)}
                className="capitalize"
              >
                {row.status}
              </Badge>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {row.completedAtLabel ?? "—"}
            </TableCell>
            <TableCell className="text-right text-muted-foreground">
              {row.scoreLabel ?? "—"}
            </TableCell>
            <TableCell>
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
        ))}
      </TableBody>
    </Table>
  );
}
