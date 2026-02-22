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
      // 1. ADICIONEI o `pointer-events-none` aqui. Isso faz a área toda do padding ignorar o toque e repassar pro conteúdo de trás rolar livremente.
      className="fixed bottom-0 left-0 w-full px-4 pt-8 pb-3 lg:hidden pointer-events-none"
    >
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#121214]/80 to-[#121214]" />

      {/* 2. ADICIONEI o `pointer-events-auto` aqui. Isso "acorda" o toque apenas na área exata do botão, permitindo que ele seja clicado! */}
      <div className="relative z-10 flex justify-center mb-3 pointer-events-auto">
        <CourseDropdownMenu
          initialUserCourses={initialUserCourses}
          initialActiveCourse={initialActiveCourse}
        />
      </div>
    </footer>
  );
}