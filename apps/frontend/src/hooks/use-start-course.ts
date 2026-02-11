"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { startCourse } from "@/actions/course/start";
import { getCourseRoadmapFresh } from "@/actions/course";
import { findLessonContext, generateLessonUrl } from "@/utils/lesson-url";
import type { Lesson } from "@/types/roadmap";
import { useActiveCourseStore } from "@/stores/active-course-store";

interface UseStartCourseReturn {
  startAndNavigate: (courseId: string) => Promise<void>;
  isLoading: boolean;
}

/**
 * Hook para iniciar um curso e navegar para a aula atual
 */
export function useStartCourse(): UseStartCourseReturn {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const fetchActiveCourse = useActiveCourseStore((state) => state.fetchActiveCourse);

  const startAndNavigate = async (courseId: string) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      // Primeiro, seta o curso como current
      await startCourse(courseId);

      // Atualiza a store do activeCourse para garantir que está sincronizada
      await fetchActiveCourse();

      // Aguarda um pouco para garantir que a store seja atualizada
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Busca o roadmap para encontrar a aula atual
      const roadmapData = await getCourseRoadmapFresh(courseId);

      if (roadmapData?.modules) {
        // Coleta todas as aulas do roadmap
        const allLessons = roadmapData.modules
          .flatMap((module) => module?.groups || [])
          .flatMap((group) => group?.lessons || []);

        // Encontra a aula atual (isCurrent) ou a primeira desbloqueada
        let targetLesson: Lesson | null = null;
        const foundCurrentLesson = allLessons.find((lesson) => lesson.isCurrent);

        // Só usa a aula atual se ela não estiver bloqueada
        if (foundCurrentLesson && foundCurrentLesson.status !== "locked") {
          targetLesson = foundCurrentLesson;
        } else {
          // Procura a primeira aula desbloqueada
          targetLesson = allLessons.find((lesson) => lesson.status !== "locked") || null;
        }

        if (targetLesson) {
          // Encontra o contexto da aula e gera a URL completa
          const context = findLessonContext(
            targetLesson.id,
            roadmapData.modules
          );

          if (context) {
            const url = generateLessonUrl(
              targetLesson,
              context.module,
              context.group
            );
            router.push(url);
            return;
          }
        }
      }

      // Fallback: se não conseguir gerar URL, redireciona para /classroom
      router.push("/classroom");
    } catch (error) {
      console.error("Erro ao iniciar curso:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    startAndNavigate,
    isLoading,
  };
}
