"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CopyButtonProps {
  value: string;
  label: string;
  variant?: "ghost" | "secondary" | "outline";
  size?: "sm" | "icon";
}

export function CopyButton({
  value,
  label,
  variant = "ghost",
  size = "icon",
}: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const id = window.setTimeout(() => setCopied(false), 1200);
    return () => window.clearTimeout(id);
  }, [copied]);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant={variant}
            size={size}
            aria-label={label}
            onClick={async () => {
              try {
                await navigator.clipboard.writeText(value);
                setCopied(true);
              } catch {
                setCopied(false);
              }
            }}
          >
            {copied ? (
              <Check className="size-4" />
            ) : (
              <Copy className="size-4" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>{copied ? "Copied" : "Copy"}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
