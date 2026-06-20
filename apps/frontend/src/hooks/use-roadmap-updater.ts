import { useEffect, useRef, useCallback } from "react";
import {
  getCourseRoadmap,
  getCourseRoadmapFresh,
  revalidateRoadmapCache,
} from "@/actions/course";
import type { RoadmapResponse } from "@/types/roadmap";

/**
 * Hook legado para modal de curso e telas fora da classroom shell.
 * Na classroom, prefira `useClassroomRoadmap()` — não refaz fetch ao trocar de aula.
 */
interface UseRoadmapUpdaterOptions {
  isOpen: boolean;
  courseId: string | undefined;
  currentLessonId: number | undefined;
  lessonCompletedTimestamp: number | null;
  onRoadmapUpdate: (roadmap: RoadmapResponse | null) => void;
}

export function useRoadmapUpdater({
  isOpen,
  courseId,
  currentLessonId,
  lessonCompletedTimestamp,
  onRoadmapUpdate,
}: UseRoadmapUpdaterOptions) {
  const lastCompletedTimestampRef = useRef<number | null>(null);
  const hasInitialFetchRef = useRef(false);
  // Memoiza a função de callback para evitar re-renderizações
  const stableOnRoadmapUpdate = useCallback(
    (roadmap: RoadmapResponse | null) => {
      onRoadmapUpdate(roadmap);
    },
    [onRoadmapUpdate]
  );

  useEffect(() => {
    if (!isOpen || !courseId) {
      // Reset refs quando o modal fecha
      if (!isOpen) {
        hasInitialFetchRef.current = false;
        lastCompletedTimestampRef.current = null;      }
      return;
    }

    const fetchUpdatedRoadmap = async (
      useFresh: boolean = false,
      delay: number = 0
    ) => {
      try {
        // Revalida o cache em paralelo com a busca (se necessário)
        const revalidatePromise = revalidateRoadmapCache(courseId);
        
        // Se há delay, aguarda; caso contrário, busca imediatamente
        if (delay > 0) {
          await Promise.all([
            revalidatePromise,
            new Promise((resolve) => setTimeout(resolve, delay))
          ]);
        } else {
          // Não bloqueia a busca esperando revalidação
          revalidatePromise.catch(() => {
            // Ignora erros de revalidação silenciosamente
          });
        }

        // Busca roadmap (com ou sem cache dependendo do parâmetro)
        const roadmapData = useFresh
          ? await getCourseRoadmapFresh(courseId)
          : await getCourseRoadmap(courseId);

        if (roadmapData) {
          stableOnRoadmapUpdate(roadmapData);
        }
      } catch (error) {
        console.error("Erro ao buscar roadmap:", error);
      }
    };

    // 1. Busca inicial quando o modal abre
    if (!hasInitialFetchRef.current) {
      hasInitialFetchRef.current = true;
      fetchUpdatedRoadmap(false, 0);
      return;
    }

    // 2. Atualiza quando uma aula é completada (prioridade maior)
    if (
      lessonCompletedTimestamp &&
      lessonCompletedTimestamp !== lastCompletedTimestampRef.current
    ) {
      lastCompletedTimestampRef.current = lessonCompletedTimestamp;
      // Delay reduzido: 300ms é suficiente para a maioria dos casos
      fetchUpdatedRoadmap(true, 300);
      return;
    }
  }, [
    isOpen,
    courseId,
    lessonCompletedTimestamp,
    stableOnRoadmapUpdate,
  ]);
}