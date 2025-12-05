"use client";

import { useMemo, useState, useTransition } from "react";

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
import type { Organisation } from "@/db/schema/auth";
import { deleteOrganisationAction } from "./actions";

interface OrganisationListTableProps {
  organisations: Organisation[];
}

export function OrganisationListTable({
  organisations,
}: OrganisationListTableProps) {
  type SortKey = "name" | "createdAt" | "industry" | "location" | "size";

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

  const sortedOrganisations = useMemo(() => {
    const collator = new Intl.Collator(undefined, { sensitivity: "base" });

    const directionFactor = sort.direction === "asc" ? 1 : -1;

    return [...organisations].sort((a, b) => {
      switch (sort.key) {
        case "createdAt": {
          const aTime = a.createdAt instanceof Date ? a.createdAt.getTime() : 0;
          const bTime = b.createdAt instanceof Date ? b.createdAt.getTime() : 0;

          if (aTime === bTime) {
            return 0;
          }

          return aTime < bTime ? -1 * directionFactor : 1 * directionFactor;
        }
        case "name": {
          const aName = a.name ?? "";
          const bName = b.name ?? "";
          const cmp = collator.compare(aName, bName);

          return cmp * directionFactor;
        }
        case "industry": {
          const aIndustry = a.industry ?? "";
          const bIndustry = b.industry ?? "";
          const cmp = collator.compare(aIndustry, bIndustry);

          return cmp * directionFactor;
        }
        case "location": {
          const aLocation = a.location ?? "";
          const bLocation = b.location ?? "";
          const cmp = collator.compare(aLocation, bLocation);

          return cmp * directionFactor;
        }
        case "size": {
          const aSize = a.size ?? "";
          const bSize = b.size ?? "";
          const cmp = collator.compare(aSize, bSize);

          return cmp * directionFactor;
        }
        default: {
          const _never: never = sort.key;
          throw new Error(`Unhandled sort key: ${_never}`);
        }
      }
    });
  }, [organisations, sort]);

  const sortIndicator = (key: SortKey) => {
    if (sort.key !== key) {
      return "";
    }

    return sort.direction === "asc" ? "↑" : "↓";
  };

  const formatDateTime = (value: Organisation["createdAt"]) => {
    if (!(value instanceof Date)) {
      return "";
    }

    return value.toLocaleString();
  };

  const formatWebsite = (website: Organisation["website"]) => {
    if (!website) {
      return "—";
    }

    try {
      const url = new URL(
        website.startsWith("http") ? website : `https://${website}`,
      );
      const host = url.host;

      return host;
    } catch {
      return website;
    }
  };

  const renderBadge = (
    value:
      | Organisation["industry"]
      | Organisation["location"]
      | Organisation["size"]
      | Organisation["hiringFocus"],
  ) => {
    if (!value) {
      return <span>—</span>;
    }

    return (
      <span className="inline-flex max-w-[160px] items-center rounded-full border px-2 py-0.5 text-xs bg-muted/40 text-foreground truncate">
        {value}
      </span>
    );
  };

  const handleDelete = (formData: FormData) => {
    startTransition(async () => {
      await deleteOrganisationAction(formData);
    });
  };

  if (organisations.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No organisations created for this enterprise yet.
      </p>
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
                onClick={() => handleSort("name")}
              >
                <span>Name</span>
                <span aria-hidden="true">{sortIndicator("name")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap">
              <button
                type="button"
                className="flex items-center gap-1 text-left"
                onClick={() => handleSort("industry")}
              >
                <span>Industry</span>
                <span aria-hidden="true">{sortIndicator("industry")}</span>
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
                onClick={() => handleSort("size")}
              >
                <span>Size</span>
                <span aria-hidden="true">{sortIndicator("size")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap">Hiring focus</TableHead>
            <TableHead className="whitespace-nowrap">Website</TableHead>
            <TableHead className="whitespace-nowrap">
              <button
                type="button"
                className="flex items-center gap-1 text-left"
                onClick={() => handleSort("createdAt")}
              >
                <span>Created</span>
                <span aria-hidden="true">{sortIndicator("createdAt")}</span>
              </button>
            </TableHead>
            <TableHead className="whitespace-nowrap text-right">
              Actions
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedOrganisations.map((organisation) => (
            <TableRow key={organisation.id}>
              <TableCell className="align-top">
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{organisation.name}</span>
                  {organisation.description ? (
                    <span className="text-xs text-muted-foreground line-clamp-3">
                      {organisation.description}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              <TableCell className="align-top">
                {renderBadge(organisation.industry)}
              </TableCell>
              <TableCell className="align-top">
                {renderBadge(organisation.location)}
              </TableCell>
              <TableCell className="align-top">
                {renderBadge(organisation.size)}
              </TableCell>
              <TableCell className="align-top">
                {renderBadge(organisation.hiringFocus)}
              </TableCell>
              <TableCell className="align-top">
                {organisation.website ? (
                  <a
                    href={
                      organisation.website.startsWith("http")
                        ? organisation.website
                        : `https://${organisation.website}`
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-primary underline-offset-4 hover:underline"
                  >
                    {formatWebsite(organisation.website)}
                  </a>
                ) : (
                  <span>—</span>
                )}
              </TableCell>
              <TableCell className="align-top">
                {formatDateTime(organisation.createdAt)}
              </TableCell>
              <TableCell className="align-top text-right">
                <form
                  action={handleDelete}
                  className="inline-flex items-center justify-end"
                >
                  <input
                    type="hidden"
                    name="organisationId"
                    value={organisation.id}
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
          {organisations.length} organisation
          {organisations.length === 1 ? "" : "s"}
        </TableCaption>
      </Table>
    </div>
  );
}
