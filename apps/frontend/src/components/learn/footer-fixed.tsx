"use client";

import { CourseDropdownMenu } from "./course-menu";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";

interface FooterFixedProps {
  initialUserCourses?: EnrolledCourse[];
  initialActiveCourse?: ActiveCourse | null;
}

export function FooterFixed({
  initialUserCourses = [],
  initialActiveCourse = null,
}: FooterFixedProps) {
  return (
    <footer
      className="fixed bottom-0 left-0 right-0 z-[100] w-full px-4 pt-8 pb-3 lg:hidden pointer-events-none"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#121214]/80 to-[#121214]" />
      <div className="relative z-10 flex justify-center mb-3 pointer-events-auto">
        <CourseDropdownMenu
          initialUserCourses={initialUserCourses}
          initialActiveCourse={initialActiveCourse}
        />
      </div>
    </footer>
  );
}