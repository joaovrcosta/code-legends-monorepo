"use client";

import Link from "next/link";
import { House } from "@phosphor-icons/react/dist/ssr";
import useClassroomSidebarStore from "@/stores/classroom-sidebar";
import { usePathname } from "next/navigation";
import { Course } from "@/types/course-types";
import { CourseContentList } from "./course-content-list";

export interface SidebarContentProps {
  course: Course | null;
}

export default function SidebarContent({ course }: SidebarContentProps) {
  const pathName = usePathname();
  const { isOpen } = useClassroomSidebarStore();

  return (
    <aside
      className={`flex flex-col bg-[#121214] border-r-[1px] border-[#25252A] text-white transition-transform duration-300 ease-in-out h-screen ${
        isOpen ? "w-64" : "w-0"
      }`}
    >
      {isOpen && (
        <>
          <div className="px-4 pb-2 bg-[#121214] z-10 shadow-lg flex items-center space-x-1 border-b border-[#25252A]">
            <div className="flex items-center space-x-1 w-full justify-start">
              <span className="font-semibold bg-blue-gradient-500 bg-clip-text text-transparent italic tracking-[3px] mt-3">
                TRILHA
              </span>
            </div>
            <div className="flex items-center space-x-1">
              <Link
                href="/learn"
                className="hover:bg-[#252931] px-2 pt-4 pb-2 rounded-br-3xl rounded-bl-3xl hover:text-[#00C8FF] text-[#666c6f]"
              >
                <House size={28} />
              </Link>
            </div>
          </div>
          <nav className="flex-1">
            <CourseContentList course={course} pathName={pathName} />
          </nav>
        </>
      )}
    </aside>
  );
}
