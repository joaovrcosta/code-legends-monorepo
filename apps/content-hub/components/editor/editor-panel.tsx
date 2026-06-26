import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function EditorPanel({
  header,
  children,
  className,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex min-h-0 min-w-0 flex-col overflow-hidden bg-ch-canvas p-4",
        className
      )}
    >
      {children}
    </div>
  );
}

export function EditorPanelCard({
  header,
  children,
  className,
}: {
  header?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full min-h-0 flex-col overflow-hidden rounded-ch-lg border border-ch-border bg-ch-surface",
        className
      )}
    >
      {header ? (
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-ch-border px-4 py-3">
          {header}
        </div>
      ) : null}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">{children}</div>
    </div>
  );
}

export function EditorIndexBadge({ index }: { index: number }) {
  return (
    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ch-accent-soft text-xs font-bold text-ch-accent">
      {index + 1}
    </span>
  );
}
