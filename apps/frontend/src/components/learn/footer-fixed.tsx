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
      className="fixed bottom-0 left-0 w-full px-4 py-3 lg:hidden"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent to-[#121214]" />
      <div className="flex justify-center mb-3">

        <CourseDropdownMenu
          initialUserCourses={initialUserCourses}
          initialActiveCourse={initialActiveCourse}
        />
      </div>
    </footer>
  );
}
