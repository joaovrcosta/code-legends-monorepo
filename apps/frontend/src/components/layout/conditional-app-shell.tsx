"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "./app-shell";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";

interface ConditionalAppShellProps {
  children: React.ReactNode;
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

const excludedRoutes = ["/login", "/signup", "/onboarding", "/account", "/classroom"];

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

  return (
    <AppShell
      initialUserCourses={initialUserCourses}
      initialActiveCourse={initialActiveCourse}
    >
      {children}
    </AppShell>
  );
}
