"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useCourseModalStore } from "@/stores/course-modal-store";
import { useActiveCourseStore } from "@/stores/active-course-store";
import { useRoadmapUpdater } from "@/hooks/use-roadmap-updater";
import { useState, useMemo, useCallback } from "react";
import type { Lesson, RoadmapResponse } from "@/types/roadmap";
import { findLessonContext, generateLessonUrl } from "@/utils/lesson-url";
import { useRouter } from "next/navigation";

export function LessonsAccordion() {
  const { currentLesson } = useCourseModalStore();
  const { activeCourse } = useActiveCourseStore();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const router = useRouter();

  // Custom hook gerencia toda a lógica de atualização do roadmap
  useRoadmapUpdater({
    isOpen: true,
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp: null,
    onRoadmapUpdate: setRoadmap,
  });

  const organizedLessons = useMemo(() => {
    if (!roadmap?.modules) return [];
    return roadmap.modules.map((module) => ({
      ...module,
      groups: module.groups.map((group) => ({
        ...group,
        lessons: group.lessons || [],
      })),
    }));
  }, [roadmap]);

  const handleLessonClick = useCallback(
    (lesson: Lesson, _: number) => {
      if (lesson.status === "locked") return;
      if (!roadmap?.modules) return;

      const context = findLessonContext(lesson.id, roadmap.modules);

      if (context) {
        const url = generateLessonUrl(lesson, context.module, context.group);
        router.push(url);
      }
    },
    [roadmap?.modules, router]
  );

  // Encontra o módulo que contém a aula atual
  const currentModule = useMemo(() => {
    if (!organizedLessons || organizedLessons.length === 0) {
      return null;
    }

    if (!currentLesson?.id) {
      return organizedLessons[0];
    }

    for (const moduleItem of organizedLessons) {
      for (const group of moduleItem.groups) {
        if (group.lessons.some((lesson) => lesson.id === currentLesson.id)) {
          return moduleItem;
        }
      }
    }

    return organizedLessons[0];
  }, [organizedLessons, currentLesson?.id]);

  const currentModuleNumber = useMemo(() => {
    if (!currentModule) return -1;
    return organizedLessons.findIndex((m) => m.id === currentModule.id);
  }, [currentModule, organizedLessons]);

  // Encontra o próximo módulo e calcula suas informações
  const nextModuleInfo = useMemo(() => {
    if (!organizedLessons || currentModuleNumber === -1) return null;
    
    const nextModuleIndex = currentModuleNumber + 1;
    if (nextModuleIndex >= organizedLessons.length) return null;
    
    const nextModule = organizedLessons[nextModuleIndex];
    
    // Calcula total de aulas e tempo
    const allLessons = nextModule.groups.flatMap((group) => group.lessons || []);
    const totalLessons = allLessons.length;
    
    // Calcula tempo total em segundos
    let totalSeconds = 0;
    allLessons.forEach((lesson) => {
      if (lesson.video_duration) {
        // Formato esperado: "HH:MM:SS" ou "MM:SS"
        const parts = lesson.video_duration.split(":").map(Number);
        if (parts.length === 3) {
          // HH:MM:SS
          totalSeconds += parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
          // MM:SS
          totalSeconds += parts[0] * 60 + parts[1];
        }
      }
    });
    
    // Converte para formato legível
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    
    let durationText = "";
    if (hours > 0) {
      durationText = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    } else {
      durationText = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
    }
    
    return {
      module: nextModule,
      moduleNumber: nextModuleIndex + 1,
      totalLessons,
      duration: durationText,
    };
  }, [organizedLessons, currentModuleNumber]);

  // Coleta todas as aulas para encontrar índices
  const allLessons = useMemo(() => {
    return organizedLessons
      .flatMap((m) => m.groups)
      .flatMap((g) => g.lessons);
  }, [organizedLessons]);

  if (!roadmap || organizedLessons.length === 0 || !currentModule) {
    return null;
  }

  return (
    <Accordion type="single" collapsible defaultValue="lessons" className="lg:hidden block">
      <AccordionItem value="lessons" className="p-0">
        <div className="w-full mx-auto lg:rounded-[20px] rounded-none bg-[#0C0C0F] border border-[#2A2A2A] shadow-xl">
          <AccordionTrigger className="group w-full lg:px-8 px-6 lg:py-8 py-6">
            <div className="flex justify-between w-full items-center">
              <div>
                <span className="bg-blue-gradient-500 bg-clip-text text-transparent lg:text-xs text-[14px] font-bold">
                  {currentModuleNumber !== -1
                    ? `Módulo ${String(currentModuleNumber + 1).padStart(2, "0")}`
                    : "Módulo"}
                </span>
                <p className="text-white text-lg mt-1">{currentModule?.title}</p>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent className="lg:px-8 px-6 pb-8 text-white overflow-y-auto">
            <div className="flex flex-col gap-4">
              {currentModule?.groups.map((group) => (
                <div key={group.id} className="space-y-2">
                  <h3 className="text-sm font-semibold text-zinc-300 mb-2">
                    {group.title}
                  </h3>
                  <div className="flex flex-col gap-2">
                    {group.lessons.map((lesson) => {
                      const isActive = currentLesson?.id === lesson.id;
                      const isLocked = lesson.status === "locked";
                      const lessonIndexInAll = allLessons.findIndex(
                        (l) => l.id === lesson.id
                      );

                      return (
                        <button
                          key={lesson.id}
                          onClick={() =>
                            handleLessonClick(lesson, lessonIndexInAll)
                          }
                          disabled={isLocked}
                          className={`text-left py-2 px-3 rounded-lg transition-all ${
                            isActive
                              ? "bg-zinc-800/50 border border-cyan-400/50"
                              : "hover:bg-zinc-800/30 border border-transparent"
                          } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className={`w-2 h-2 rounded-full shrink-0 ${
                                isActive
                                  ? "bg-cyan-400"
                                  : isLocked
                                  ? "bg-zinc-700"
                                  : "bg-cyan-400/50"
                              }`}
                            />
                            <span
                              className={`text-sm font-medium ${
                                isActive
                                  ? "text-cyan-50 font-semibold"
                                  : "text-zinc-400"
                              }`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Seção do Próximo Módulo */}
              {nextModuleInfo && (
                <div className="pt-4 border-t border-zinc-900 mt-4">
                  <div className="border border-[#25252A] rounded-[12px] p-4">
                    <div className="flex items-center gap-4">
                      {/* Informações do módulo */}
                      <div className="flex-1 min-w-0">
                        <p className="bg-blue-gradient-500 bg-clip-text text-transparent lg:text-xs text-[14px] font-semibold mb-1">Próximo módulo</p>
                        <h3 className="text-white font-semibold text-base mb-1 truncate">
                          {nextModuleInfo.module.title}
                        </h3>
                        <div className="flex items-center gap-4 text-zinc-400 text-xs">
                          <span>{nextModuleInfo.totalLessons} aulas</span>
                          <span>{nextModuleInfo.duration}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AccordionContent>
        </div>
      </AccordionItem>
    </Accordion>
  );
}

