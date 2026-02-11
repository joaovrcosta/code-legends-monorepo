"use client";
import { Button } from "@/components/ui/button";
import { useCourseModalStore } from "@/stores/course-modal-store";
import { useActiveCourseStore } from "@/stores/active-course-store";
import useClassroomSidebarStore from "@/stores/classroom-sidebar";
import { Menu, X } from "lucide-react";
import { LessonContent } from "@/components/classroom/lesson-content";
import { LevelProgressBar } from "@/components/learn/level-progress-bar";
import { SkipForward } from "@phosphor-icons/react";
import { SkipBack, LockOpen } from "@phosphor-icons/react/dist/ssr";
import { useState, useEffect, useMemo, useCallback } from "react";
import { getCourseRoadmapFresh, unlockNextModule } from "@/actions/course";
import type { RoadmapResponse, Lesson } from "@/types/roadmap";
import { useRoadmapUpdater } from "@/hooks/use-roadmap-updater";
import Link from "next/link";
import { LessonsList } from "@/components/classroom/lessons-list";
import { useRouter } from "next/navigation";
import { generateLessonUrl, findLessonContext } from "@/utils/lesson-url";

export default function ClassroomPage() {
  const {
    currentLesson,
    lessons,
    currentIndex,
    lessonCompletedTimestamp,
    setLessonsForPage,
    setModuleUnlockedTimestamp,
  } = useCourseModalStore();

  const { activeCourse, fetchActiveCourse } = useActiveCourseStore();
  const { isOpen: isSidebarOpen } = useClassroomSidebarStore();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const router = useRouter();

  // Custom hook gerencia toda a lógica de atualização do roadmap
  useRoadmapUpdater({
    isOpen: true, // Sempre "aberto" na página
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp,
    onRoadmapUpdate: setRoadmap,
  });

  // Carrega as aulas quando a página é montada e redireciona para URL dinâmica
  useEffect(() => {
    const loadLessons = async () => {
      // Se não há activeCourse, tenta buscar
      if (!activeCourse?.id) {
        await fetchActiveCourse();
        // Aguarda um pouco para a store ser atualizada
        await new Promise((resolve) => setTimeout(resolve, 200));
        // Verifica novamente após atualizar
        const updatedActiveCourse = useActiveCourseStore.getState().activeCourse;
        if (!updatedActiveCourse?.id || lessons.length > 0) return;
        
        // Usa o activeCourse atualizado
        const courseId = updatedActiveCourse.id;
        try {
          const roadmapData = await getCourseRoadmapFresh(courseId);
          if (roadmapData) {
            setRoadmap(roadmapData);

            // Coleta todas as aulas do roadmap
            const allLessons = roadmapData.modules
              .flatMap((module) => module?.groups || [])
              .flatMap((group) => group?.lessons || []);

            // Encontra a aula atual (isCurrent) ou a primeira desbloqueada
            // IMPORTANTE: Só usa a aula atual se ela não estiver bloqueada
            let targetLesson: Lesson | null = null;
            const foundCurrentLesson = allLessons.find((lesson) => lesson.isCurrent);
            
            // Só usa a aula atual se ela não estiver bloqueada
            if (foundCurrentLesson && foundCurrentLesson.status !== "locked") {
              targetLesson = foundCurrentLesson;
            } else {
              // Procura a primeira aula desbloqueada
              targetLesson =
                allLessons.find((lesson) => lesson.status !== "locked") || null;
            }

            if (targetLesson) {
              // Encontra o contexto da aula e redireciona para URL dinâmica
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

            // Fallback: usa a store se não conseguir gerar URL
            const startIndex = targetLesson
              ? allLessons.findIndex((lesson) => lesson.id === targetLesson.id)
              : 0;
            setLessonsForPage(allLessons, startIndex >= 0 ? startIndex : 0);
          }
        } catch (error) {
          console.error("Erro ao carregar aulas:", error);
        }
        return;
      }
      
      if (lessons.length > 0) return;

      try {
        const roadmapData = await getCourseRoadmapFresh(activeCourse.id);
        if (roadmapData) {
          setRoadmap(roadmapData);

          // Coleta todas as aulas do roadmap
          const allLessons = roadmapData.modules
            .flatMap((module) => module?.groups || [])
            .flatMap((group) => group?.lessons || []);

          // Encontra a aula atual (isCurrent) ou a primeira desbloqueada
          // IMPORTANTE: Só usa a aula atual se ela não estiver bloqueada
          let targetLesson: Lesson | null = null;
          const foundCurrentLesson = allLessons.find((lesson) => lesson.isCurrent);
          
          // Só usa a aula atual se ela não estiver bloqueada
          if (foundCurrentLesson && foundCurrentLesson.status !== "locked") {
            targetLesson = foundCurrentLesson;
          } else {
            // Procura a primeira aula desbloqueada
            targetLesson =
              allLessons.find((lesson) => lesson.status !== "locked") || null;
          }

          if (targetLesson) {
            // Encontra o contexto da aula e redireciona para URL dinâmica
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

          // Fallback: usa a store se não conseguir gerar URL
          const startIndex = targetLesson
            ? allLessons.findIndex((lesson) => lesson.id === targetLesson.id)
            : 0;
          setLessonsForPage(allLessons, startIndex >= 0 ? startIndex : 0);
        }
      } catch (error) {
        console.error("Erro ao carregar aulas:", error);
      }
    };

    loadLessons();
  }, [activeCourse?.id, setLessonsForPage, lessons.length, router]);

  // Memoiza cálculos de navegação
  const { hasNextLesson, hasPreviousLesson, nextLesson, previousLesson, isNextLessonLocked } = useMemo(() => {
    const hasNext = currentIndex < lessons.length - 1;
    const hasPrevious = currentIndex > 0;
    const next = hasNext ? lessons[currentIndex + 1] : null;
    const previous = hasPrevious ? lessons[currentIndex - 1] : null;
    const isNextLocked = next?.status === "locked";
    
    return {
      hasNextLesson: hasNext,
      hasPreviousLesson: hasPrevious,
      nextLesson: next,
      previousLesson: previous,
      isNextLessonLocked: isNextLocked,
    };
  }, [currentIndex, lessons]);

  // Função para navegar para uma aula usando URL dinâmica
  const navigateToLesson = useCallback((lesson: Lesson) => {
    if (!roadmap?.modules) return;

    const context = findLessonContext(lesson.id, roadmap.modules);
    if (context) {
      const url = generateLessonUrl(lesson, context.module, context.group);
      router.push(url);
    }
  }, [roadmap?.modules, router]);

  const handleNextLesson = useCallback(() => {
    // Só permite navegar se a aula atual estiver completa
    if (currentLesson?.status !== "completed") {
      return;
    }
    if (nextLesson && !isNextLessonLocked) {
      navigateToLesson(nextLesson);
    }
  }, [currentLesson?.status, nextLesson, isNextLessonLocked, navigateToLesson]);

  const handlePreviousLesson = useCallback(() => {
    if (previousLesson) {
      navigateToLesson(previousLesson);
    }
  }, [previousLesson, navigateToLesson]);


  // Usa os valores diretamente do back-end
  const canUnlockNextModule = useMemo(() => {
    return roadmap?.course.canUnlockNextModule ?? false;
  }, [roadmap?.course.canUnlockNextModule]);

  // Memoiza a busca de moduleTitle e groupTitle para evitar loop a cada render
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

  const handleUnlockNext = useCallback(async () => {
    if (!activeCourse?.id) return;

    setIsUnlocking(true);
    try {
      const result = await unlockNextModule(activeCourse.id);
      if (result.success) {
        // Notifica que um módulo foi desbloqueado para atualizar a barra de progresso
        setModuleUnlockedTimestamp();

        // Aguarda um delay reduzido (300ms total) para garantir que o revalidateTag foi processado
        // e a barra de progresso tenha tempo de atualizar
        await new Promise((resolve) => setTimeout(resolve, 300));

        // Atualiza o roadmap usando versão sem cache
        const roadmapData = await getCourseRoadmapFresh(activeCourse.id);
        if (roadmapData) {
          setRoadmap(roadmapData);

          // Coleta todas as aulas do roadmap atualizado
          const allLessons = roadmapData.modules
            .flatMap((module) => module?.groups || [])
            .flatMap((group) => group?.lessons || []);

          // Encontra a primeira aula do próximo módulo desbloqueado
          const nextModuleNumber = roadmapData.course.nextModule;
          let nextLessonIndex = 0;

          if (nextModuleNumber && roadmapData.modules[nextModuleNumber - 1]) {
            // Encontra o próximo módulo (1-based para 0-based)
            const nextModule = roadmapData.modules[nextModuleNumber - 1];

            // Procura a primeira aula do próximo módulo que não está bloqueada
            for (const group of nextModule.groups || []) {
              const firstUnlockedLesson = group.lessons?.find(
                (lesson) => lesson.status !== "locked"
              );

              if (firstUnlockedLesson) {
                nextLessonIndex = allLessons.findIndex(
                  (lesson) => lesson.id === firstUnlockedLesson.id
                );
                break;
              }
            }

            // Se não encontrou nenhuma aula desbloqueada no próximo módulo,
            // procura a primeira aula desbloqueada em todo o roadmap
            if (nextLessonIndex === -1) {
              nextLessonIndex = allLessons.findIndex(
                (lesson) => lesson.status !== "locked"
              );
            }
          } else {
            // Se não há próximo módulo definido, procura a primeira aula desbloqueada
            nextLessonIndex = allLessons.findIndex(
              (lesson) => lesson.status !== "locked"
            );
          }

          // Garante que o índice seja válido
          if (nextLessonIndex === -1) {
            nextLessonIndex = 0;
          }

          // Atualiza a página com as novas aulas
          setLessonsForPage(allLessons, nextLessonIndex);
        }
      } else {
        console.error("Erro ao desbloquear módulo:", result.error);
        alert(result.error || "Erro ao desbloquear módulo");
      }
    } catch (error) {
      console.error("Erro ao desbloquear módulo:", error);
      alert("Erro ao desbloquear módulo");
    } finally {
      setIsUnlocking(false);
    }
  }, [activeCourse?.id, setModuleUnlockedTimestamp, setLessonsForPage]);

  // Se não há curso ativo ou aulas, mostra mensagem
  if (!activeCourse) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-white">
          <p className="text-muted-foreground mb-4">
            Nenhum curso ativo encontrado. Selecione um curso para começar.
          </p>
          <Link href="/learn/catalog">
            <Button>Explorar cursos</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!currentLesson) {
    return (
      <div className="flex items-center justify-center w-full h-full">
        <div className="text-center text-white">
          <p className="text-muted-foreground">Carregando aula...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[100dvh] w-full">
      {/* Sidebar com lista de aulas - apenas no desktop */}
      <aside
        className={`hidden lg:block fixed left-0 top-[63px] bg-[#121214] border-r border-[#25252A] flex-shrink-0 h-[calc(100dvh-63px)] overflow-hidden z-40 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? "w-[378px]" : "w-0"
        }`}
      >

        {isSidebarOpen && (
          <div className="h-full flex flex-col w-[378px]">
            <div className="p-4 border-b border-[#25252A] bg-[#060607]">
              <h2 className="text-sm font-semibold text-[#C4C4CC]">Aulas</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              <LessonsList
                lessons={lessons}
                currentLessonId={currentLesson?.id}
                roadmap={roadmap}
              />
            </div>
          </div>
        )}
      </aside>

      {/* Conteúdo principal */}
      <div
        className={`flex-1 w-full lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_#121214_70%)]
             bg-[radial-gradient(circle_at_center,_#344c68_0%,_#121214_70%)]
             text-white shadow-2xl shadow-[#00C8FF]/10 flex flex-col transition-[margin-left] duration-300 ease-in-out pt-[112px] lg:pt-0 ${
               isSidebarOpen ? "lg:ml-[378px]" : "lg:ml-0"
             }`}
      >
        {/* Header */}
        <header className="h-[63px] py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none lg:mb-2 mb-0 flex-shrink-0 lg:block hidden">
          <div className="flex items-center justify-between w-full px-4">
            <div className="lg:hidden flex">
              <Menu size={32} className="text-white" />
            </div>


            {/* Botão de voltar (direita) */}
            <Link href="/learn">
              <X size={32} className="text-white cursor-pointer" />
            </Link>
          </div>
        </header>

        {/* Conteúdo */}
        {currentLesson && (
          <LessonContent
            lesson={currentLesson}
            courseTitle={activeCourse?.title}
            moduleTitle={moduleTitle}
            groupTitle={groupTitle}
            courseIcon={activeCourse?.icon}
          />
        )}

        {/* Footer */}
        <footer
          className={`fixed left-0 right-0 bottom-0 lg:bg-[#0C0C0F] bg-[#0C0C0F] lg:border-t lg:border-t-[#25252A] border-t border-t-[#25252A] lg:rounded-b-[20px] rounded-b-none p-0 z-50 transition-[margin-left] duration-300 ease-in-out ${
            isSidebarOpen ? "lg:left-[378px]" : "lg:left-0"
          }`}
        >
        <div className="flex justify-between w-full m-0 p-0">
          <Button
            variant="outline"
            className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] bg-black rounded-none text-base border-none 
      lg:rounded-bl-[20px] rounded-bl-none disabled:opacity-50"
            onClick={handlePreviousLesson}
            disabled={!hasPreviousLesson}
          >
            <SkipBack weight="fill" size={16} />
            Aula anterior
          </Button>
          <div className="w-full lg:flex items-center justify-center px-8 hidden">
            <LevelProgressBar />
          </div>
          {canUnlockNextModule ? (
            <Button
              variant="outline"
              onClick={handleUnlockNext}
              disabled={isUnlocking}
              className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] rounded-none text-base bg-blue-gradient-500 border-none
      lg:rounded-br-[20px] rounded-br-none disabled:opacity-50"
            >
              {isUnlocking ? (
                "Desbloqueando..."
              ) : (
                <>
                  Desbloquear módulo <LockOpen weight="fill" size={16} />
                </>
              )}
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleNextLesson}
              disabled={!hasNextLesson || isNextLessonLocked || currentLesson?.status !== "completed"}
              className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] rounded-none text-base bg-black border-none
      lg:rounded-br-[20px] rounded-br-none disabled:opacity-50"
            >
              Próxima aula <SkipForward weight="fill" size={16} />
            </Button>
          )}
        </div>
      </footer>
      </div>
    </div>
  );
}
