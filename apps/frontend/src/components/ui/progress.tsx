"use client";

import * as React from "react";
import * as ProgressPrimitive from "@radix-ui/react-progress";

import { cn } from "@/lib/utils";

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root>
>(({ className, value, ...props }, ref) => (
  <ProgressPrimitive.Root
    ref={ref}
    className={cn("relative h-2 w-full rounded-full bg-[#25252A]", className)}
    {...props}
  >
    {/* camada interna que permite o glow "sair" sem vazar do container */}
    <div className="absolute inset-0 rounded-full overflow-visible">
      <ProgressPrimitive.Indicator
        className="h-full bg-[#00C8FF] shadow-[0_0_16px_0px_#00C8FF] transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </div>
  </ProgressPrimitive.Root>
));
Progress.displayName = ProgressPrimitive.Root.displayName;

export { Progress };
