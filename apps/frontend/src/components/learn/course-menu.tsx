"use client";

import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Plus, Check } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from "react";
import { startCourse } from "@/actions/course/start";
import type { EnrolledCourse, ActiveCourse } from "@/types/user-course.ts";
import { useActiveCourseStore } from "@/stores/active-course-store";
import { useRouter } from "next/navigation";

interface CourseDropdownMenuProps {
  initialUserCourses: EnrolledCourse[];
  initialActiveCourse: ActiveCourse | null;
}

export function CourseDropdownMenu({
  initialUserCourses,
  initialActiveCourse,
}: CourseDropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const [userCourses] = useState<EnrolledCourse[]>(initialUserCourses);
  const [changingCourse, setChangingCourse] = useState<string | null>(null);
  const { activeCourse, fetchActiveCourse, setActiveCourse } =
    useActiveCourseStore();
  const router = useRouter();

  // Sincroniza o activeCourse inicial com o store
  useEffect(() => {
    if (initialActiveCourse && !activeCourse) {
      setActiveCourse(initialActiveCourse);
    }
  }, [initialActiveCourse, activeCourse, setActiveCourse]);

  // Fecha o dropdown durante o resize para evitar reposicionamento constante do Popper
  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Fecha o dropdown imediatamente ao detectar resize
      if (open) {
        setOpen(false);
      }
    };

    // Debounce para evitar fechar múltiplas vezes durante resize contínuo
    const debouncedHandleResize = () => {
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
      timeoutRef = setTimeout(handleResize, 100);
    };

    window.addEventListener("resize", debouncedHandleResize);

    return () => {
      window.removeEventListener("resize", debouncedHandleResize);
      if (timeoutRef) {
        clearTimeout(timeoutRef);
      }
    };
  }, [open]);

  // Usa o activeCourse do store se disponível, senão usa o inicial
  const currentActiveCourse = activeCourse || initialActiveCourse;

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          className={`bg-[#2A2A35] border-b-[1px] border-[#55555c] lg:bg-gray-gradient-first items-center justify-center border cursor-pointer flex transition-all duration-300 shrink-0
    h-[52px] w-[120px] lg:rounded-lg rounded-full lg:h-auto lg:w-auto lg:max-h-[42px] lg:py-3 lg:px-4 lg:gap-2 lg:rounded-[12px]
    hover:bg-[#25252A] 
    shadow-[0_0_15px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.40)]
    
    ${open
              ? "border-[#00C8FF] shadow-[0_0_25px_rgba(255,255,255,0.2)]" /* Quando aberto, o glow fica mais evidente */
              : "border-[#25252A]"
            }`}
        >
          {currentActiveCourse?.icon ? (
            <Image
              src={currentActiveCourse.icon}
              alt={currentActiveCourse.title || "Curso"}
              height={40}
              width={40}
              className="object-contain h-[50px] w-[50px] lg:h-[32px] lg:w-[32px]"
            />
          ) : (
            <div className="h-[26px] w-[26px] bg-[#25252A] rounded lg:h-5 lg:w-5" />
          )}
          <p className="lg:block hidden">
            {currentActiveCourse?.title || "Meus Cursos"}
          </p>
        </div>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="center"
        side="bottom"
        sideOffset={20}
        className="w-screen max-w-none left-0 right-0 border-none bg-[#1A1A1E] shadow-2xl z-50 p-0 
                  sm:w-auto sm:max-w-sm sm:rounded-[20px] sm:border sm:border-[#25252A] sm:left-auto sm:right-auto"
      >
        <DropdownMenuLabel className="p-4 flex items-center justify-center">
          <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-base">
            Meus cursos
          </span>
        </DropdownMenuLabel>

        <DropdownMenuSeparator className="border border-[#25252A]" />

        {userCourses.length === 0 ? (
          <div className="px-4 py-2 text-sm text-muted-foreground">
            Nenhum curso inscrito
          </div>
        ) : (
          <>
            {[...userCourses]
              .sort((a, b) => {
                const aIsActive = currentActiveCourse?.id === a.courseId;
                const bIsActive = currentActiveCourse?.id === b.courseId;
                // Curso ativo vem primeiro
                if (aIsActive && !bIsActive) return -1;
                if (!aIsActive && bIsActive) return 1;
                return 0;
              })
              .map((enrolledCourse) => {
                const isActive =
                  currentActiveCourse?.id === enrolledCourse.courseId;
                const isChanging = changingCourse === enrolledCourse.courseId;

                const handleCourseClick = async () => {
                  // Se já está ativo, apenas fecha o menu
                  if (isActive) {
                    setOpen(false);
                    return;
                  }

                  // Se não está ativo, inicia o curso
                  setChangingCourse(enrolledCourse.courseId);
                  try {
                    await startCourse(enrolledCourse.courseId);
                    await fetchActiveCourse();
                    setOpen(false);
                    // Força a atualização da página para carregar o novo roadmap
                    router.refresh();
                  } catch (error) {
                    console.error("Erro ao mudar de curso:", error);
                    setChangingCourse(null);
                  }
                };

                return (
                  <DropdownMenuItem
                    key={enrolledCourse.id}
                    className={`pl-2 pr-4 w-full min-w-[352px] text-white border-none rounded-[20px] ${isChanging
                      ? "opacity-50 cursor-not-allowed"
                      : "cursor-pointer"
                      }`}
                    onClick={handleCourseClick}
                  >
                    <div className="flex items-center gap-3">
                      {(enrolledCourse.course.icon ||
                        enrolledCourse.course.thumbnail) && (
                          <Image
                            src={
                              enrolledCourse.course.icon ||
                              enrolledCourse.course.thumbnail ||
                              ""
                            }
                            alt={enrolledCourse.course.title}
                            width={70}
                            height={70}
                            className="object-contain h-[70px] w-[70px]"
                          />
                        )}
                      <div className="flex flex-col flex-1">
                        <span className="text-sm">
                          {enrolledCourse.course.title}
                        </span>
                        {/* {enrolledCourse.progress > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {Math.round(enrolledCourse.progress * 100)}% concluído
                        </span>
                      )} */}
                      </div>
                      {isActive && (
                        <Check
                          size={20}
                          className="text-[#00C8FF] flex-shrink-0"
                        />
                      )}
                    </div>
                  </DropdownMenuItem>
                );
              })}
          </>
        )}

        <Link href="/learn/catalog" onClick={() => setOpen(false)}>
          <div className="flex text-white gap-1 items-center justify-center py-3 hover:bg-[#25252A] border-t border-[#25252A] cursor-pointer h-[52px]">
            <Plus />
            Adicionar curso
          </div>
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
