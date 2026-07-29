import { ChevronRight } from "lucide-react";
import type { LessonBreadcrumbContext } from "@/lib/course-structure";
import { cn } from "@/lib/utils";

interface LessonContextBreadcrumbProps {
  context: LessonBreadcrumbContext;
  className?: string;
  /** Uma linha com truncate — ideal para headers de modal. */
  compact?: boolean;
}

function Crumb({
  children,
  current,
  compact,
}: {
  children: string;
  current?: boolean;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "min-w-0 truncate",
        current
          ? "shrink font-medium text-ch"
          : cn("text-ch-muted", compact ? "max-w-28 shrink sm:max-w-36" : "max-w-40 shrink sm:max-w-56"),
      )}
      title={children}
      aria-current={current ? "page" : undefined}
    >
      {children}
    </span>
  );
}

function Separator() {
  return (
    <ChevronRight
      className="h-3.5 w-3.5 shrink-0 text-ch-muted"
      aria-hidden
    />
  );
}

export function LessonContextBreadcrumb({
  context,
  className = "",
  compact = false,
}: LessonContextBreadcrumbProps) {
  const fullPath = [
    context.courseTitle,
    context.moduleTitle,
    context.groupTitle,
    context.lessonTitle,
  ].join(" › ");

  return (
    <nav
      aria-label="Localização da aula"
      title={fullPath}
      className={cn(
        "flex min-w-0 items-center gap-x-1 overflow-hidden whitespace-nowrap",
        compact ? "text-xs" : "text-sm",
        className,
      )}
    >
      <Crumb compact={compact}>{context.courseTitle}</Crumb>
      <Separator />
      <Crumb compact={compact}>{context.moduleTitle}</Crumb>
      <Separator />
      <Crumb compact={compact}>{context.groupTitle}</Crumb>
      <Separator />
      <Crumb current compact={compact}>
        {context.lessonTitle}
      </Crumb>
    </nav>
  );
}
