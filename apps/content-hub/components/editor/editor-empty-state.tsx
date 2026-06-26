import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EditorEmptyState({
  message,
  actionLabel,
  onAction,
  className,
}: {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full flex-col items-center justify-center rounded-ch-lg border border-dashed border-ch-border px-6 py-12 text-center",
        className
      )}
    >
      <p className="text-sm text-ch-muted">{message}</p>
      {actionLabel && onAction ? (
        <Button type="button" size="sm" onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  );
}
