import Link from "next/link";

interface ReadonlyDataFieldProps {
  label: string;
  value: string;
  placeholder?: string;
  actionLabel?: string;
  actionHref?: string;
  onAction?: () => void;
  className?: string;
}

export function ReadonlyDataField({
  label,
  value,
  placeholder = "—",
  actionLabel,
  actionHref,
  onAction,
  className,
}: ReadonlyDataFieldProps) {
  const displayValue = value.trim() || placeholder;

  return (
    <div className={className ? `space-y-2 ${className}` : "space-y-2"}>
      <label className="text-sm text-muted ml-1">{label}</label>
      <div className="flex items-center justify-between h-[52px] bg-transparent rounded-full px-5 border border-[#25252a] hover:border-[#00c8ff]/30 transition-colors">
        <span className="text-sm text-zinc-300 truncate">{displayValue}</span>
        {actionLabel && actionHref ? (
          <Link
            href={actionHref}
            className="text-sm font-medium text-muted hover:text-[#00c8ff] transition-colors shrink-0 ml-3"
          >
            {actionLabel}
          </Link>
        ) : null}
        {actionLabel && onAction && !actionHref ? (
          <button
            type="button"
            onClick={onAction}
            className="text-sm font-medium text-muted hover:text-[#00c8ff] transition-colors shrink-0 ml-3"
          >
            {actionLabel}
          </button>
        ) : null}
      </div>
    </div>
  );
}

export function formatBirthDateDisplay(iso: string): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}/${month}/${year}`;
}
