"use client";

import Link from "next/link";

import { CopyButton } from "@/components/common/atoms/copy-button";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface PublicInterviewLinkRow {
  id: string;
  title: string;
  publicId: string;
  publicPath: string;
  publicUrl?: string;
  createdAtLabel: string;
}

interface PublicInterviewLinksTableProps {
  links: PublicInterviewLinkRow[];
}

function fullPublicUrl(link: PublicInterviewLinkRow): string {
  if (typeof link.publicUrl === "string" && link.publicUrl.length > 0) {
    return link.publicUrl;
  }

  if (typeof window === "undefined") {
    return link.publicPath;
  }

  return `${window.location.origin}${link.publicPath}`;
}

export function PublicInterviewLinksTable({
  links,
}: PublicInterviewLinksTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[38%]">Title</TableHead>
          <TableHead>Public link</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {links.map((link) => (
          <TableRow key={link.id}>
            <TableCell className="whitespace-normal">
              <div className="font-medium text-foreground line-clamp-2">
                {link.title}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                /i/{link.publicId}
              </div>
            </TableCell>
            <TableCell className="whitespace-normal">
              <div className="flex items-start gap-2">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-foreground break-all">
                    {fullPublicUrl(link)}
                  </div>
                </div>
                <CopyButton
                  value={fullPublicUrl(link)}
                  label="Copy public interview link"
                />
              </div>
            </TableCell>
            <TableCell className="text-muted-foreground">
              {link.createdAtLabel}
            </TableCell>
            <TableCell>
              <div className="flex justify-end gap-2">
                <Button asChild variant="secondary" size="sm">
                  <Link href={`/dashboard/public-interviews/${link.id}`}>
                    View
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={link.publicPath} target="_blank" rel="noreferrer">
                    Open
                  </Link>
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
