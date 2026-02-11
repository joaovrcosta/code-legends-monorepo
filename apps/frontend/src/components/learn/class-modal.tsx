"use client";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";
import { useCourseModalStore } from "@/stores/course-modal-store";
import { useActiveCourseStore } from "@/stores/active-course-store";
import VideoComponent from "../classroom/video";
import { ComponentsArticle } from "../classroom/article/components";
import { Menu, X } from "lucide-react";
import { LevelProgressBar } from "./level-progress-bar";
import { SkipForward } from "@phosphor-icons/react";
import { SkipBack, LockOpen } from "@phosphor-icons/react/dist/ssr";
import { useState, useMemo } from "react";
import { getCourseRoadmapFresh, unlockNextModule } from "@/actions/course";
import type { RoadmapResponse } from "@/types/roadmap";
import { useRoadmapUpdater } from "@/hooks/use-roadmap-updater";
import { findLessonContext } from "@/utils/lesson-url";

export const AulaModal = () => {
  const {
    isOpen,
    currentLesson,
    lessons,
    currentIndex,
    closeModal,
    goToNextLesson,
    goToPreviousLesson,
    lessonCompletedTimestamp,
    openModalWithLessons,
    setModuleUnlockedTimestamp,
  } = useCourseModalStore();

  const { activeCourse } = useActiveCourseStore();
  const [roadmap, setRoadmap] = useState<RoadmapResponse | null>(null);
  const [isUnlocking, setIsUnlocking] = useState(false);

  // Custom hook gerencia toda a lógica de atualização do roadmap
  useRoadmapUpdater({
    isOpen,
    courseId: activeCourse?.id,
    currentLessonId: currentLesson?.id,
    lessonCompletedTimestamp,
    onRoadmapUpdate: setRoadmap,
  });

  // Calcula o número do módulo atual baseado na aula atual
  const currentLevel = useMemo(() => {
    if (!roadmap?.modules || !currentLesson) {
      return roadmap?.course.currentModule || 1;
    }

    const context = findLessonContext(currentLesson.id, roadmap.modules);
    if (context) {
      const moduleIndex = roadmap.modules.findIndex(
        (m) => m.id === context.module.id
      );
      return moduleIndex !== -1 ? moduleIndex + 1 : roadmap.course.currentModule || 1;
    }

    return roadmap.course.currentModule || 1;
  }, [roadmap, currentLesson]);

  const hasNextLesson = currentIndex < lessons.length - 1;
  const hasPreviousLesson = currentIndex > 0;
  const nextLesson = hasNextLesson ? lessons[currentIndex + 1] : null;
  const isNextLessonLocked = nextLesson?.status === "locked";


  // Usa os valores diretamente do back-end
  const canUnlockNextModule = roadmap?.course.canUnlockNextModule ?? false;

  const handleUnlockNext = async () => {
    if (!activeCourse?.id) return;

    setIsUnlocking(true);
    try {
      const result = await unlockNextModule(activeCourse.id);
      if (result.success) {
        // Notifica que um módulo foi desbloqueado para atualizar a barra de progresso
        setModuleUnlockedTimestamp();

        // Aguarda um pouco para garantir que o revalidateTag foi processado
        await new Promise((resolve) => setTimeout(resolve, 200));

        // Aguarda mais tempo para que a barra de progresso tenha tempo de atualizar e voltar para zero
        // A barra de progresso tem um delay de 300ms, então aguardamos um pouco mais para garantir
        await new Promise((resolve) => setTimeout(resolve, 400));

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

          // Atualiza o modal com as novas aulas, mantendo-o aberto
          // Isso acontece após a barra de progresso ter tempo de atualizar
          openModalWithLessons(allLessons, nextLessonIndex);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent
        className="w-full
             lg:bg-[radial-gradient(circle_at_center,_#627fa1_0%,_#121214_70%)]
             bg-[radial-gradient(circle_at_center,_#344c68_0%,_#121214_70%)]
             text-white p-0 h-full shadow-2xl shadow-[#00C8FF]/10"
      >
        {currentLesson && (
          <>
            <DialogHeader className="py-4 pb-0 bg-transparent rounded-t-[20px] lg:border-b lg:border-[#25252A] border-none lg:mb-2 mb-0">
              <div className="flex items-center justify-between w-full px-4">
                <div className="lg:hidden flex">
                  <Menu size={32} className="text-white" />
                </div>

                {/* Título (centro, só no desktop) */}
                <DialogTitle className="w-full">
                  <div className="lg:flex flex-col text-center w-full items-center justify-center hidden">
                    <p className="text-sm font-light text-[#787878]">
                      Módulo {currentLevel}
                    </p>
                    <h3 className="text-[20px] font-normal mt-1">
                      {currentLesson.title}
                    </h3>
                  </div>
                </DialogTitle>

                {/* Botão de fechar (direita) */}
                <DialogClose>
                  <X size={32} className="text-white" />
                </DialogClose>
              </div>
            </DialogHeader>

            <div className="lg:max-h-[720px] h-full overflow-y-auto lg:px-4 px-0">
              {currentLesson?.type === "video" && (
                <VideoComponent
                  description={currentLesson.description}
                  title={currentLesson.title}
                  src={currentLesson.video_url}
                />
              )}
              {currentLesson?.type === "article" && <ComponentsArticle />}
              {currentLesson?.type === "quiz" && <p>Quiz bb</p>}
              {currentLesson?.type === "project" && <p>Projeto</p>}
            </div>
          </>
        )}
        <DialogFooter className="lg:bg-[#0C0C0F] bg-transparent lg:border-t lg:border-t-[#25252A] rounded-b-[20px] p-0">
          <div className="flex justify-between w-full m-0 p-0">
            <Button
              variant="outline"
              className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] bg-black rounded-none text-base border-none 
      rounded-bl-[20px] disabled:opacity-50"
              onClick={goToPreviousLesson}
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
      rounded-br-[20px] disabled:opacity-50"
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
                onClick={goToNextLesson}
                disabled={!hasNextLesson || isNextLessonLocked || currentLesson?.status !== "completed"}
                className="h-[64px] lg:min-h-[84px] w-1/2 max-w-[320px] rounded-none text-base bg-black border-none
      rounded-br-[20px] disabled:opacity-50"
              >
                Próxima aula <SkipForward weight="fill" size={16} />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
