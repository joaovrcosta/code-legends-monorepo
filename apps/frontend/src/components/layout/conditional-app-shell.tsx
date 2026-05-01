"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./app-shell";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";

interface ConditionalAppShellProps {
  children: React.ReactNode;
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

const excludedRoutes = [
  "/login",
  "/signup",
  "/onboarding",
  "/classroom",
  "/cart",
  "/plans",
  "/certificates",
];

/** `/learn/careers/:slug/exams/:examId` — tela focada, sem sidebar de navegação. */
const CAREER_EXAM_PATH =
  /^\/learn\/careers\/[^/]+\/exams\/[^/]+(?:\/|$)/;

export function ConditionalAppShell({
  children,
  initialUserCourses,
  initialActiveCourse,
}: ConditionalAppShellProps) {
  const pathname = usePathname();

  // Verifica se a rota atual deve usar o AppShell
  const shouldUseAppShell = !excludedRoutes.some(
    (route) => pathname === route || pathname.startsWith(route + "/")
  );

  if (!shouldUseAppShell) {
    return <>{children}</>;
  }

  const showSidebar = !CAREER_EXAM_PATH.test(pathname);

  return (
    <AppShell
      showSidebar={showSidebar}
      initialUserCourses={initialUserCourses}
      initialActiveCourse={initialActiveCourse}
    >
      {children}
    </AppShell>
  );
}
