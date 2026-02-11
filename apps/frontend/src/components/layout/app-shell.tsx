"use client";

import { FooterFixed } from "@/components/learn/footer-fixed";
import LearnHeader from "@/components/learn/header";
import Sidebar from "@/components/learn/sidebar";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";

interface AppShellProps {
  children: React.ReactNode;
  showSidebar?: boolean;
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

export function AppShell({ 
  children, 
  showSidebar = true,
  initialUserCourses,
  initialActiveCourse,
}: AppShellProps) {
  return (
    <div className="h-[100dvh] w-full flex flex-col">
      <LearnHeader
        initialUserCourses={initialUserCourses}
        initialActiveCourse={initialActiveCourse}
      />

      <div className="flex flex-1 lg:pt-[79px] pt-[64px]">
        {showSidebar && (
          <div className="lg:block hidden max-w-64">
            <Sidebar />
          </div>
        )}

        <div className="flex-1 h-[calc(100dvh-100px)] lg:h-[calc(100dvh-80px)] overflow-y-auto pt-0 pb-4">
          <main className="w-full">{children}</main>
          <FooterFixed />
        </div>
      </div>
    </div>
  );
}
