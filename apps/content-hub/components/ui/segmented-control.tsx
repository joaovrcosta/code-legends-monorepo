"use client";

import { cn } from "@/lib/utils";
import { ch } from "@/lib/ui-classes";

export type SegmentedControlOption<T extends string> = {
  value: T;
  label: React.ReactNode;
};

export function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  className,
  size = "default",
}: {
  value: T;
  onChange: (value: T) => void;
  options: SegmentedControlOption<T>[];
  className?: string;
  size?: "default" | "sm";
}) {
  return (
    <div
      className={cn(
        ch.tabsList,
        size === "sm" && "h-9",
        className
      )}
      role="tablist"
    >
      {options.map((option) => {
        const isActive = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(option.value)}
            className={cn(
              ch.tabsTrigger,
              isActive && "bg-ch-accent-soft text-ch-accent shadow-none",
              size === "sm" && "px-2.5 py-1 text-xs"
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
