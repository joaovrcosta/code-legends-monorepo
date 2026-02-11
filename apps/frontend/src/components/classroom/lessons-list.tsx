"use client";

import { useCourseModalStore } from "@/stores/course-modal-store";
import type { Lesson, RoadmapResponse } from "@/types/roadmap";
import { findLessonContext, generateLessonUrl } from "@/utils/lesson-url";
import { useRouter } from "next/navigation";
import { useMemo, memo, useCallback } from "react";

interface LessonsListProps {
  lessons: Lesson[];
  currentLessonId?: number;
  roadmap: RoadmapResponse | null;
}

export const LessonsList = memo(function LessonsList({
  lessons,
  currentLessonId,
  roadmap,
}: LessonsListProps) {
  const { setLessonsForPage } = useCourseModalStore();
  const router = useRouter();

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

  const handleLessonClick = useCallback((lesson: Lesson, index: number) => {
    if (lesson.status === "locked") return;
    if (!roadmap?.modules) return;

    const context = findLessonContext(lesson.id, roadmap.modules);

    if (context) {
      const url = generateLessonUrl(lesson, context.module, context.group);
      router.push(url);
    } else {
      setLessonsForPage(lessons, index);
      router.push("/classroom");
    }
  }, [roadmap?.modules, router, setLessonsForPage, lessons]);

  // Encontra o módulo que contém a aula atual (sempre executado antes de qualquer return)
  const currentModule = useMemo(() => {
    if (!organizedLessons || organizedLessons.length === 0) {
      return null;
    }

    if (!currentLessonId) {
      return organizedLessons[0]; // Fallback para o primeiro módulo
    }

    // Procura em todos os módulos qual contém a aula atual
    for (const moduleItem of organizedLessons) {
      for (const group of moduleItem.groups) {
        if (group.lessons.some((lesson) => lesson.id === currentLessonId)) {
          return moduleItem;
        }
      }
    }

    // Se não encontrar, retorna o primeiro módulo
    return organizedLessons[0];
  }, [organizedLessons, currentLessonId]);

  // Calcula o número do módulo baseado na posição no array (sempre executado)
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

  if (!roadmap || organizedLessons.length === 0 || !currentModule) {
    return (
      <div className="p-6 text-zinc-500 text-sm animate-pulse">
        Carregando estrutura...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-[#121214] scrollbar-thin [&::-webkit-scrollbar]:w-2
        [&::-webkit-scrollbar-track]:bg-transparent
        [&::-webkit-scrollbar-thumb]:bg-zinc-700/40
        [&::-webkit-scrollbar-thumb]:rounded-full
        hover:[&::-webkit-scrollbar-thumb]:bg-zinc-600 scrollbar-thumb-zinc-800">
      {/* Container do cabeçalho com fade */}
      <div className="sticky top-0 z-20">
        {/* Cabeçalho do Módulo */}
        <div className="bg-[#121214]/98 px-4 py-6 lg border-b border-zinc-900">
          <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1 block">
            {currentModuleNumber !== -1
              ? `Módulo ${String(currentModuleNumber + 1).padStart(2, "0")}`
              : "Módulo"}
          </span>
          <span className="bg-blue-gradient-500 bg-clip-text text-transparent font-bold text-[24px]">
            {currentModule?.title || "Carregando..."}
          </span>
        </div>
        {/* Fade escuro na parte inferior do cabeçalho */}
        <div className="pointer-events-none h-8 w-full bg-gradient-to-t from-transparent to-[#101010]" />
      </div>

      <div className="px-4 pt-0 pb-6">
        <div className="flex flex-col gap-6">
          {currentModule?.groups.map((group, groupIndex) => {
            const isLastGroup = groupIndex === currentModule.groups.length - 1;

            return (
              <div key={group.id} className="relative">
                {/* Linha vertical principal que conecta os grupos (se houver mais de um) */}
                {!isLastGroup && (
                  <div className="absolute left-[11px] top-8 bottom-[-24px] w-[2px] bg-zinc-800/50 z-0" />
                )}

                {/* Título do Grupo (Nó Pai) */}
                <div className="relative z-10 flex items-center gap-4 mb-2">
                  <div className="relative flex items-center justify-center w-6 h-6 rounded-full bg-zinc-900 border-2 border-zinc-700 shadow-sm shrink-0">
                    <div className="w-2 h-2 rounded-full bg-zinc-500" />
                  </div>
                  <h3 className="text-base font-semibold text-zinc-200">
                    {group.title}
                  </h3>
                  
                </div>

                {/* Lista de Lições (Filhos) */}
                <div className="relative pl-[11px]">
                  {/* Linha Guia Vertical do Grupo para as lições */}
                  <div 
                    className={`absolute left-[11px] top-0 bottom-0 w-[2px] bg-zinc-800/50 ${
                      group.lessons.length === 0 ? "hidden" : ""
                    }`} 
                  />

                  <div className="flex flex-col">
                    {group.lessons.map((lesson, lessonIndex) => {
                      const isActive = currentLessonId === lesson.id;
                      const isLocked = lesson.status === "locked";
                      const isLastLesson = lessonIndex === group.lessons.length - 1;
                      
                      // Encontra o índice global para o fallback de navegação
                      const lessonIndexInAll = lessons.findIndex((l) => l.id === lesson.id);

                      return (
                        <div key={lesson.id} className="relative pl-8 pt-1">
                          {/* CONECTOR CURVO (A mágica acontece aqui) */}
                          {/* 1. Máscara para cobrir a linha vertical se for o último item */}
                          {isLastLesson && (
                            <div className="absolute left-0 top-4 bottom-0 w-[4px] bg-[#121214] z-10" />
                          )}
                          
                          {/* 2. O Desenho da Curva (L Shape) */}
                          <div className="absolute left-0 top-0 h-[24px] w-[24px] border-b-2 border-l-2 border-zinc-800/50 rounded-bl-xl translate-y-[-50%]" />

                          <button
                            onClick={() => handleLessonClick(lesson, lessonIndexInAll)}
                            disabled={isLocked}
                            className={`group relative flex items-center gap-3 w-full py-2 px-3 rounded-[12px] transition-colors duration-200 text-left ${
                              isActive
                                ? "bg-zinc-800/50"
                                : "hover:bg-zinc-800/30"
                            } ${isLocked ? "opacity-50 cursor-not-allowed" : ""}`}
                          >
                            {/* Bolinha da Lição */}
                            <div className={`w-2 h-2 rounded-full shrink-0 transition-colors ${
                              isActive
                                ? "bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"
                                : isLocked
                                  ? "bg-zinc-700"
                                  : "bg-cyan-400"
                            }`} />

                            <span
                              className={`text-sm font-medium truncate transition-colors ${
                                isActive
                                  ? "text-cyan-50 font-semibold"
                                  : "text-zinc-400 group-hover:text-zinc-300"
                              }`}
                            >
                              {lesson.title}
                            </span>
                            
                            {/* Ícone de Play ou Cadeado sutil à direita */}
                            {isActive && (
                                <div className="absolute right-3 w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                            )}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Seção do Próximo Módulo */}
      {nextModuleInfo && (
        <div className="px-4 pb-6 border-t border-zinc-900 pt-6">
          <div className="border border-[#25252A] rounded-[12px] p-4">
            <div className="flex items-center gap-4">
              {/* Informações do módulo */}
              <div className="flex-1 min-w-0">
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
  );
});