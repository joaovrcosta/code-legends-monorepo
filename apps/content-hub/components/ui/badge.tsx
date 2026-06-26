import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "outline" | "destructive";
}

export function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        {
          "border-transparent bg-ch-accent-soft text-ch-accent": variant === "default",
          "border-transparent bg-ch-surface-raised text-ch-muted": variant === "secondary",
          "border-ch-border text-ch": variant === "outline",
          "border-transparent bg-ch-destructive text-white": variant === "destructive",
        },
        className
      )}
      {...props}
    />
  );
}
