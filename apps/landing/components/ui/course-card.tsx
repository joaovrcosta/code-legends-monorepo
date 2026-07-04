import Image from "next/image";
import Link from "next/link";
import type { CourseCard } from "@/content/courses";
import { cn } from "@/lib/utils";

function ArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden
      className="shrink-0"
    >
      <path
        d="M3 8h10M9 4l4 4-4 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type CourseCardProps = {
  course: CourseCard;
  className?: string;
};

export function CourseCardItem({ course, className }: CourseCardProps) {
  return (
    <article
      className={cn(
        "landing-card flex h-full flex-col gap-4 p-6 transition-colors hover:border-landing-accent/40",
        className,
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-landing-accent-soft">
        <Image
          src={course.icon}
          alt=""
          width={24}
          height={24}
          aria-hidden
        />
      </div>
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-landing">{course.title}</h3>
        <p className="clamp-3 text-sm leading-relaxed text-landing-muted">
          {course.description}
        </p>
      </div>
      <Link
        href={course.href}
        className="mt-auto inline-flex items-center gap-1.5 text-sm font-medium text-landing-accent hover:text-landing-accent-hover"
      >
        Ver trilha
        <ArrowIcon />
      </Link>
    </article>
  );
}
