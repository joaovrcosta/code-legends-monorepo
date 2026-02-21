"use client";

import { FooterFixed } from "@/components/learn/footer-fixed";
import LearnHeader from "@/components/learn/header";
import Sidebar from "@/components/learn/sidebar";
import { TopAdvertesing } from "@/components/learn/top-advertesing";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";

const showTopBanner = process.env.NEXT_PUBLIC_SHOW_TOP_BANNER === "true";

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
    <div
      className={`h-[100dvh] w-full flex flex-col ${showTopBanner ? "app-shell-has-top-banner" : ""}`}
    >
      {/* CORREÇÃO AQUI: O banner só é renderizado no HTML se showTopBanner for true */}
      {showTopBanner && <TopAdvertesing />}

      <LearnHeader
        initialUserCourses={initialUserCourses}
        initialActiveCourse={initialActiveCourse}
      />

      <div
        // O seu calc() está perfeito aqui, desde que o CSS esteja usando 0px nas variáveis!
        className="flex min-h-0 flex-1 pt-[calc(var(--header-height-mobile)+var(--top-banner-height)+var(--header-top-offset))] lg:pt-[calc(var(--header-height-desktop)+var(--top-banner-height)+var(--header-top-offset))]"
      >
        {showSidebar && (
          <div className="hidden h-full min-h-0 max-w-64 flex-shrink-0 overflow-hidden lg:block">
            <Sidebar />
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-y-auto pt-0 pb-20 lg:pb-4">
          <main className="w-full">{children}</main>
          <FooterFixed
            initialUserCourses={initialUserCourses}
            initialActiveCourse={initialActiveCourse}
          />
        </div>
      </div>
    </div>
  );
}