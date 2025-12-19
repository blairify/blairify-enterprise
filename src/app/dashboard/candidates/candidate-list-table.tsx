"use client";

import { useMemo, useState, useTransition } from "react";

import { Typography } from "@/components/common/atoms/typography";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Candidate } from "@/db/schema/auth";
import { deleteCandidateAction } from "./actions";

interface CandidateListTableProps {
  candidates: Candidate[];
}

export function CandidateListTable({ candidates }: CandidateListTableProps) {
  type SortKey = "fullName" | "createdAt" | "location" | "seniority";
  type SortDirection = "asc" | "desc";

  interface SortState {
    key: SortKey;
    direction: SortDirection;
  }

  const [isPending, startTransition] = useTransition();
  const [sort, setSort] = useState<SortState>({
    key: "createdAt",
    direction: "desc",
  });

  const handleSort = (key: SortKey) => {
    setSort((current) => {
      if (current.key === key) {
        const nextDirection: SortDirection =
          current.direction === "asc" ? "desc" : "asc";

        return { key, direction: nextDirection };
      }

      return { key, direction: "asc" };
    });
  };

  const sortedCandidates = useMemo(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });

    const directionFactor = sort.direction === "asc" ? 1 : -1;

    return [...candidates].sort((a, b) => {
      switch (sort.key) {
        case "createdAt": {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;

          if (aTime === bTime) {
            return 0;
          }

          return aTime < bTime ? -1 * directionFactor : 1 * directionFactor;
        }
        case "fullName": {
          const aName = a.fullName ?? "";
          const bName = b.fullName ?? "";
          const cmp = collator.compare(aName, bName);

          return cmp * directionFactor;
        }
        case "location": {
          const aLocation = a.location ?? "";
          const bLocation = b.location ?? "";
          const cmp = collator.compare(aLocation, bLocation);

          return cmp * directionFactor;
        }
        case "seniority": {
          const aSeniority = a.seniority ?? "";
          const bSeniority = b.seniority ?? "";
          const cmp = collator.compare(aSeniority, bSeniority);

          return cmp * directionFactor;
        }
        default: {
          const _never: never = sort.key;
          throw new Error(`Unhandled sort key: ${_never}`);
        }
      }
    });
  }, [candidates, sort]);

  const sortIndicator = (key: SortKey) => {
    if (sort.key !== key) {
      return "";
    }

    return sort.direction === "asc" ? "↑" : "↓";
  };

  const formatDateTime = (value: Candidate["createdAt"]) => {
    if (!(value instanceof Date)) {
      return "";
    }

    return value.toLocaleString();
  };

  const handleDelete = (formData: FormData) => {
    startTransition(async () => {
      await deleteCandidateAction(formData);
    });
  };

  if (candidates.length === 0) {
    return (
      <Typography.Body className="text-sm text-muted-foreground">
        No candidates added for this enterprise yet.
      </Typography.Body>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="whitespace-nowrap">
              <button
                type="button"
                className="flex items-center gap-1 text-left"
                onClick={() => handleSort("fullName")}
              >
                <span>Name</span>
                <span aria-hidden="true">{sortIndicator("fullName")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <button
                type="button"
                className="flex items-center gap-1 text-left"
                onClick={() => handleSort("location")}
              >
                <span>Location</span>
                <span aria-hidden="true">{sortIndicator("location")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <button
                type="button"
                className="flex items-center gap-1 text-left"
                onClick={() => handleSort("seniority")}
              >
                <span>Seniority</span>
                <span aria-hidden="true">{sortIndicator("seniority")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap">Email</TableHead>
            <TableHead className="whitespace-nowrap">CV</TableHead>
            <TableHead className="whitespace-nowrap">Created</TableHead>
            <TableHead className="whitespace-nowrap text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCandidates.map((candidate) => (
            <TableRow key={candidate.id}>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{candidate.fullName}</span>
                  {candidate.headline ? (
                    <span className="text-xs text-muted-foreground line-clamp-2">
                      {candidate.headline}
                    </span>
                  ) : null}
                  {candidate.currentCompany ? (
                    <span className="text-xs text-muted-foreground">
                      {candidate.currentCompany}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                {candidate.location ?? "—"}
              </TableCell>
              <TableCell className="align-top">
                {candidate.seniority ?? "—"}
              </TableCell>
              <TableCell className="align-top">
                {candidate.email ?? "—"}
              </TableCell>
              <TableCell className="align-top">
                {candidate.cvUrl ? (
                  <a
                    href={candidate.cvUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    View CV
                  </a>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                {formatDateTime(candidate.createdAt)}
              </TableCell>
              <TableCell className="align-top text-right">
                <form
                  action={handleDelete}
                  className="inline-flex items-center justify-end"
                >
                  <input
                    type="hidden"
                    name="candidateId"
                    value={candidate.id}
                  />
                  <Button
                    type="submit"
                    variant="outline"
                    size="sm"
                    disabled={isPending}
                  >
                    {isPending ? "Removing..." : "Remove"}
                  </Button>
                </form>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
        <TableCaption>
          {candidates.length} candidate
          {candidates.length === 1 ? "" : "s"}
        </TableCaption>
      </Table>
    </div>
  );
}
