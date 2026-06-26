import { Trash2 } from "lucide-react";
import { ch } from "@/lib/ui-classes";
import { cn } from "@/lib/utils";

export function EditorListItem({
  index,
  isSelected,
  onSelect,
  onRemove,
  typeLabel,
  title,
  removeTitle = "Remover",
}: {
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onRemove: () => void;
  typeLabel: string;
  title: string;
  removeTitle?: string;
}) {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      }}
      className={cn(
        "w-full cursor-pointer rounded-ch border px-3 py-2 text-left transition-colors",
        isSelected ? ch.editorItemActive : cn(ch.editorItem, "border-transparent")
      )}
      title={title}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold",
              isSelected
                ? "border-ch-accent text-ch-accent"
                : "border-ch-border text-ch-muted"
            )}
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-ch-muted">{typeLabel}</p>
            <p className="truncate text-sm font-medium text-ch">{title}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="shrink-0 p-1 text-ch-destructive transition-colors hover:text-ch-destructive-hover"
          title={removeTitle}
        >
          <Trash2 size={14} aria-hidden />
        </button>
      </div>
    </div>
  );
}
