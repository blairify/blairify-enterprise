"use client";

import Link from "next/link";

import { CopyButton } from "@/components/common/atoms/copy-button";
import { Button } from "@/components/ui/button";

interface PublicInterviewLinkHeaderProps {
  title: string;
  publicPath: string;
  publicUrl?: string;
}

function fullUrl(publicPath: string, publicUrl?: string): string {
  if (typeof publicUrl === "string" && publicUrl.length > 0) {
    return publicUrl;
  }

  if (typeof window === "undefined") {
    return publicPath;
  }

  return `${window.location.origin}${publicPath}`;
}

export function PublicInterviewLinkHeader({
  title,
  publicPath,
  publicUrl,
}: PublicInterviewLinkHeaderProps) {
  const url = fullUrl(publicPath, publicUrl);

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-2xl font-semibold text-foreground truncate">
            {title}
          </div>
          <div className="mt-1 text-sm text-muted-foreground break-all">
            {url}
          </div>
        </div>

        <div className="flex items-center gap-2 sm:justify-end">
          <CopyButton value={url} label="Copy public URL" variant="secondary" />
          <Button asChild variant="outline" size="sm">
            <Link href={publicPath} target="_blank" rel="noreferrer">
              Open
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
