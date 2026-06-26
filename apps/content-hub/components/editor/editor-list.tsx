import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function EditorList({
  title,
  count,
  selectedIndex,
  footer,
  children,
  className,
}: {
  title: React.ReactNode;
  count: number;
  selectedIndex?: number;
  footer?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <aside
      className={cn(
        "flex min-h-0 flex-col overflow-hidden border-r border-ch-border bg-ch-surface",
        className
      )}
    >
      <div className="flex shrink-0 items-center justify-between border-b border-ch-border px-4 py-3">
        <p className={ch.mutedLabel}>{title}</p>
        {count > 0 && selectedIndex !== undefined ? (
          <p className="text-xs text-ch-muted">
            {selectedIndex + 1}/{count}
          </p>
        ) : null}
      </div>
      <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">{children}</div>
      {footer ? (
        <div className="shrink-0 border-t border-ch-border p-2">{footer}</div>
      ) : null}
    </aside>
  );
}
