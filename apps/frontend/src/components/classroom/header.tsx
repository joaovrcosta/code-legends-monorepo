"use client";

import Image from "next/image";
import codeLegendsLogo from "../../../public/code-legends-logo.svg";
import Link from "next/link";
import { Menu } from "lucide-react";
import useClassroomSidebarStore from "@/stores/classroom-sidebar";
import { SkipBack, SkipForward } from "@phosphor-icons/react/dist/ssr";
import codeLegendsLogoMobile from "../../../public/logo-mobile.png";
import { UserDropdown } from "../user-dropdown";
import { StrikeSection } from "../strike-section";
import { CourseDropdownMenu } from "../learn/course-menu";
import { useActiveCourseStore } from "@/stores/active-course-store";
import { useCourseModalStore } from "@/stores/course-modal-store";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";
import { useState, useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { useRoadmapUpdater } from "@/hooks/use-roadmap-updater";
import type { RoadmapResponse } from "@/types/roadmap";

interface ClassroomHeaderProps {
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

export default function ClassroomHeader({
  initialUserCourses,
  initialActiveCourse,
}: ClassroomHeaderProps) {
  const { toggleSidebar } = useClassroomSidebarStore();
  const { activeCourse } = useActiveCourseStore();
  const { currentLesson } = useCourseModalStore();
  const [isAutoplay, setIsAutoplay] = useState(false);
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);

  // Custom hook gerencia toda a lógica de atualização do roadmap
  useRoadmapUpdater({
    isOpen: true,
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp: null,
    onRoadmapUpdate: setRoadmap,
  });

  // Usa o activeCourse do store se disponível, senão usa o inicial
  const currentActiveCourse = activeCourse || initialActiveCourse;

  // Constrói o path do curso dinamicamente
  const coursePath = currentActiveCourse?.slug
    ? `/learn/paths/${currentActiveCourse.slug}`
    : "/learn/catalog";

  // Nome do curso para exibir (fallback para "Curso" se não tiver título)
  const courseName = currentActiveCourse?.title || "Curso";

  // Busca moduleTitle e groupTitle do roadmap
  const { moduleTitle, groupTitle } = useMemo(() => {
    let moduleTitleValue: string | undefined;
    let groupTitleValue: string | undefined;

    if (roadmap?.modules && currentLesson) {
      for (const moduleItem of roadmap.modules) {
        for (const groupItem of moduleItem.groups || []) {
          if (groupItem.lessons?.some((l) => l.id === currentLesson.id)) {
            moduleTitleValue = moduleItem.title;
            groupTitleValue = groupItem.title;
            break;
          }
        }
        if (moduleTitleValue && groupTitleValue) break;
      }
    }

    return { moduleTitle: moduleTitleValue, groupTitle: groupTitleValue };
  }, [roadmap?.modules, currentLesson]);

  const breadcrumbPath = useMemo(() => {
    return [currentActiveCourse?.title, moduleTitle, groupTitle]
      .filter(Boolean)
      .join(" / ");
  }, [currentActiveCourse?.title, moduleTitle, groupTitle]);

  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white shadow-md">
      <header className="fixed top-0 left-0 w-full z-50 bg-[#121214] shadow-lg border-b-[1px] border-[#25252a] lg:py-0 pt-2 pb-0">
        <ul className="flex justify-between items-center lg:pt-2 pt-0 lg:pb-2 pb-2 lpb-0 w-full mx-auto px-4">
          <li className="flex items-center lg:space-x-6">
            <button
              onClick={toggleSidebar}
              className="text-white p-1 border border-[#25252a] rounded-lg lg:block hidden hover:bg-[#25252a] transition-colors duration-150 ease-in-out"
            >
              <Menu size={24} />
            </button>

            <div className="flex items-center space-x-4">
              {/* <LoggedSheet /> */}

              <div>
                <Link href="/">
                  <Image
                    src={codeLegendsLogo}
                    alt="Code Legends"
                    className="lg:block hidden"
                  />
                </Link>
                <Link href="/">
                  <Image
                    src={codeLegendsLogoMobile}
                    alt="Code Legends"
                    className="lg:hidden block"
                    height={24}
                    width={24}
                  />
                </Link>
              </div>
            </div>
            {currentActiveCourse && (
              <Link href={coursePath}>
                <div className="border rounded-[8px] border-[#25252a] py-2 lg:block hidden px-3 hover:bg-[#25252a] cursor-pointer transition-colors duration-150 ease-in-out">
                  <span className="text-[14px]">{courseName}</span>
                </div>
              </Link>
            )}
            <div className="p-2 lg:flex hidden px-3 space-x-2">
              <SkipBack size={24} />
              <SkipForward size={24} weight="fill" />
            </div>
            <div className="p-2 lg:flex hidden px-3 space-x-2">
              <p className="text-white text-sm truncate max-w-[200px]">
                {currentLesson?.title || "Introdução"}
              </p>
            </div>
          </li>

          <li className="flex lg:space-x-2 space-x-1 items-center ">
            <div className="flex items-center lg:space-x-4 space-x-4">
              <CourseDropdownMenu
                initialUserCourses={initialUserCourses}
                initialActiveCourse={initialActiveCourse}
              />
              <StrikeSection />
              <UserDropdown />
            </div>
          </li>
        </ul>

        {/* Lesson Header - abaixo do header principal, apenas no mobile */}
        <div className="lg:hidden block border-t border-[#25252A]">
          <div className="bg-[#121214]/90">
            <div className="flex items-center justify-between px-4 py-2">
              {/* Lado esquerdo */}
              <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                <Link href="/learn" className="flex items-center justify-center">
                  <button className="flex-shrink-0 text-white hover:text-[#00C8FF] transition-colors">
                    <ArrowLeft size={20} />
                  </button>
                </Link>

                <div className="h-6 w-px bg-[#25252A]" />

                {/* Ícone do curso */}
                {currentActiveCourse?.icon ? (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full overflow-hidden">
                    <Image
                      src={currentActiveCourse.icon}
                      alt={courseName}
                      width={32}
                      height={32}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">
                      {courseName[0]?.toUpperCase() || "C"}
                    </span>
                  </div>
                )}

                {/* Breadcrumb */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#C4C4CC] truncate">
                    {breadcrumbPath || courseName}
                  </p>
                </div>
              </div>

              {/* Lado direito */}
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Reprodução automática */}
                <button
                  onClick={() => setIsAutoplay(!isAutoplay)}
                  className={`relative w-11 h-6 rounded-full transition-colors ${isAutoplay ? "bg-[#00C8FF]" : "bg-[#25252A]"
                    }`}
                >
                  <span
                    className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${isAutoplay ? "translate-x-5" : "translate-x-0"
                      }`}
                  />
                </button>

                {/* Botões de controle */}
                {/* <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-[#25252A] flex items-center justify-center text-white hover:bg-[#2a2a2e] transition-colors"
                >
                  {isPlaying ? (
                    <Pause size={16} fill="currentColor" />
                  ) : (
                    <Play size={16} fill="currentColor" />
                  )}
                </button> */}

                {/* Ícone de documento/notas
                <button className="w-8 h-8 rounded-full bg-[#25252A] flex items-center justify-center text-white hover:bg-[#2a2a2e] transition-colors">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2 2C2 1.44772 2.44772 1 3 1H8.58579C8.851 1 9.10536 1.10536 9.29289 1.29289L13.7071 5.70711C13.8946 5.89464 14 6.149 14 6.41421V14C14 14.5523 13.5523 15 13 15H3C2.44772 15 2 14.5523 2 14V2Z"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <path
                      d="M8 1V5C8 5.55228 8.44772 6 9 6H13"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      fill="none"
                    />
                    <circle cx="5" cy="10" r="0.5" fill="currentColor" />
                    <path
                      d="M5 11.5H11"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button> */}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
