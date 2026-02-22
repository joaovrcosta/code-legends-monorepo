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
      // 1. Substituí o py-3 por pt-24 e pb-3. O pt-24 "estica" o footer para cima, dando bastante espaço para o degradê acontecer.
      className="fixed bottom-0 left-0 w-full px-4 pt-24 pb-3 lg:hidden"
    >
      {/* 2. Adicionei via-[#121214]/80. Isso faz o degradê começar transparente, ficar 80% escuro no meio, e 100% escuro na base. */}
      <div className="pointer-events-none absolute inset-0 z-0 bg-gradient-to-b from-transparent via-[#121214]/80 to-[#121214]" />

      {/* 3. Adicionei relative e z-10 aqui para garantir que o botão fique na frente do fade e continue clicável */}
      <div className="relative z-10 flex justify-center mb-3">
        <CourseDropdownMenu
          initialUserCourses={initialUserCourses}
          initialActiveCourse={initialActiveCourse}
        />
      </div>
    </footer>
  );
}