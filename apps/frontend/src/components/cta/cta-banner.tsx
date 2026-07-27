import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const ctaBannerVariants = cva(
  "w-full rounded-[20px] border border-[#25252A] bg-surface-2 p-4 md:p-5",
  {
    variants: {
      variant: {
        default: "",
        accent: "",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface CtaBannerProps
  extends VariantProps<typeof ctaBannerVariants> {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function CtaBanner({
  icon,
  title,
  description,
  action,
  footer,
  variant,
  className,
}: CtaBannerProps) {
  return (
    <div className={cn(ctaBannerVariants({ variant }), className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          {icon != null && (
            <div className="mt-0.5 shrink-0 text-[#C4C4CC]">{icon}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="text-base font-semibold text-white">{title}</div>
            {description != null && (
              <div className="mt-1 text-sm text-[#C4C4CC]">{description}</div>
            )}
          </div>
        </div>
        {action != null && (
          <div className="shrink-0 sm:self-center">{action}</div>
        )}
      </div>
      {footer != null && <div className="mt-3">{footer}</div>}
    </div>
  );
}
