"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import type * as React from "react";

import { cn } from "@/lib/utils";

type CheckboxRoot = React.ElementRef<typeof CheckboxPrimitive.Root>;

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> {
  rootRef?: React.Ref<CheckboxRoot>;
}

function Checkbox({ className, rootRef, ...props }: CheckboxProps) {
  return (
    <CheckboxPrimitive.Root
      ref={rootRef}
      className={cn(
        "peer size-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground",
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        <Check className="size-4" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

Checkbox.displayName = "Checkbox";

export { Checkbox };
