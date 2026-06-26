import * as React from "react";
import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-ch text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-ch-canvas disabled:pointer-events-none disabled:opacity-50",
          {
            [ch.btnPrimary]: variant === "default",
            "bg-ch-destructive text-white hover:bg-ch-destructive-hover focus-visible:ring-ch-destructive":
              variant === "destructive",
            [ch.btnOutline]: variant === "outline",
            [ch.btnSecondary]: variant === "secondary",
            [ch.btnGhost]: variant === "ghost",
            "text-ch-accent underline-offset-4 hover:underline": variant === "link",
            "h-10 px-4 py-2": size === "default",
            "h-9 px-3": size === "sm",
            "h-11 px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button };
