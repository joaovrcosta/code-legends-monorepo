import { ChevronRight } from "lucide-react";
import type { LessonBreadcrumbContext } from "@/lib/course-structure";

interface LessonContextBreadcrumbProps {
  context: LessonBreadcrumbContext;
  className?: string;
}

function Crumb({
  children,
  current,
}: {
  children: string;
  current?: boolean;
}) {
  return (
    <span
      className={
        current
          ? "truncate font-medium text-gray-900 dark:text-gray-100"
          : "truncate text-gray-600 dark:text-gray-400"
      }
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
      className="h-3.5 w-3.5 shrink-0 text-gray-400 dark:text-gray-500"
      aria-hidden
    />
  );
}

export function LessonContextBreadcrumb({
  context,
  className = "",
}: LessonContextBreadcrumbProps) {
  return (
    <nav
      aria-label="Localização da aula"
      className={`flex flex-wrap items-center gap-x-1.5 gap-y-1 text-sm ${className}`}
    >
      <Crumb>{context.courseTitle}</Crumb>
      <Separator />
      <Crumb>{context.moduleTitle}</Crumb>
      <Separator />
      <Crumb>{context.groupTitle}</Crumb>
      <Separator />
      <Crumb current>{context.lessonTitle}</Crumb>
    </nav>
  );
}
