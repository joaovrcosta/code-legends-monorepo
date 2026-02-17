"use client";

import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import {
  getCourseRoadmap,
  listModulesProgress,
  continueNextModule,
} from "@/actions/course";
import { useCourseModalStore } from "@/stores/course-modal-store";
import { useActiveCourseStore } from "@/stores/active-course-store";
import type { RoadmapResponse } from "@/types/roadmap";
import type { ActiveCourse } from "@/types/user-course.ts";
import type { ModuleWithProgress } from "@/types/roadmap";
import { LearnHeader } from "@/components/learn/learn-header";
import { LessonsContent } from "@/components/learn/lessons-content";
import { CertificateIcon, Lock } from "@phosphor-icons/react/dist/ssr";
import { PrimaryButton } from "../ui/primary-button";
import { Button } from "../ui/button";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface LearnPageContentProps {
  initialRoadmap: RoadmapResponse;
  activeCourse: ActiveCourse;
}

export function LearnPageContent({
  initialRoadmap,
  activeCourse,
}: LearnPageContentProps) {
  const [openPopover, setOpenPopover] = useState<number | null>(null);
  const [showContinue, setShowContinue] = useState<boolean>(true);
  const [roadmap, setRoadmap] = useState<RoadmapResponse>(initialRoadmap);
  const [modulesProgress, setModulesProgress] = useState<ModuleWithProgress[]>(
    []
  );
  const taskRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const prevOpenPopoverRef = useRef<number | null>(null);
  const prevIsModalOpenRef = useRef<boolean>(false);
  const hasScrolledRef = useRef<boolean>(false);
  const lastCompletedTimestampRef = useRef<number | null>(null);
  const lastActiveCourseIdRef = useRef<string | null>(null);
  const router = useRouter();

  const {
    isOpen: isModalOpen,
    lessonCompletedTimestamp,
    moduleUnlockedTimestamp,
  } = useCourseModalStore();

  console.log(activeCourse);

  const { activeCourse: storeActiveCourse } = useActiveCourseStore();
  const currentActiveCourse = storeActiveCourse || activeCourse;

  const fetchRoadmap = useCallback(async () => {
    if (!currentActiveCourse?.id) return null;

    try {
      const roadmapData = await getCourseRoadmap(currentActiveCourse.id);
      if (roadmapData) {
        setRoadmap(roadmapData);
        return roadmapData;
      }
      return null;
    } catch (error) {
      console.error("Erro ao buscar roadmap:", error);
      return null;
    }
  }, [currentActiveCourse?.id]);

  const fetchModulesProgress = useCallback(async () => {
    if (!currentActiveCourse?.slug) return;

    try {
      const currentModuleId = roadmap?.course?.currentModuleId;
      const modulesData = await listModulesProgress(
        currentActiveCourse.slug,
        currentModuleId
      );

      if (modulesData?.modules) {
        setModulesProgress(modulesData.modules);
      }
    } catch (error) {
      console.error("Erro ao buscar módulos com progresso:", error);
    }
  }, [currentActiveCourse?.slug, roadmap?.course?.currentModuleId]);


  // Coleta todas as lições de todos os módulos e grupos
  const allLessons = useMemo(() => {
    if (!roadmap?.modules) return [];
    return roadmap.modules
      .flatMap((module) => module?.groups || [])
      .flatMap((group) => group?.lessons || []);
  }, [roadmap]);

  // Encontra a primeira lição não completada para mostrar o popover "Continuar"
  const firstIncompleteLesson = useMemo(() => {
    return allLessons.find(
      (lesson) => lesson.status !== "completed" && lesson.status !== "locked"
    );
  }, [allLessons]);

  // Encontra a lição atual (isCurrent) do roadmap
  const currentLesson = useMemo(() => {
    if (!roadmap?.modules) return null;

    for (const moduleItem of roadmap.modules) {
      if (!moduleItem?.groups) continue;
      for (const group of moduleItem.groups) {
        if (!group?.lessons) continue;
        const current = group.lessons.find((l) => l.isCurrent);
        if (current) {
          return current;
        }
      }
    }
    return null;
  }, [roadmap]);

  // Usa currentModule e currentClass diretamente do backend
  const currentModule = roadmap?.course.currentModule ?? 1;
  const currentClass = roadmap?.course.currentClass ?? 1;

  // Encontra o título da lição atual (memoizado)
  const currentLessonTitle = useMemo(() => {
    if (!roadmap?.modules) return "Selecione uma aula";

    for (const moduleItem of roadmap.modules) {
      if (!moduleItem?.groups) continue;
      for (const group of moduleItem.groups) {
        if (!group?.lessons) continue;
        const currentLesson = group.lessons.find((l) => l.isCurrent);
        if (currentLesson) {
          return currentLesson.title;
        }
      }
    }
    return "Selecione uma aula";
  }, [roadmap]);

  const nextLockedModule = useMemo(() => {
    // Encontra o módulo atual usando isCurrent
    const currentModuleIndex = modulesProgress.findIndex(
      (module) => module.isCurrent
    );

    // Se encontrou o módulo atual e não é o último, retorna o próximo
    if (
      currentModuleIndex !== -1 &&
      currentModuleIndex < modulesProgress.length - 1
    ) {
      return modulesProgress[currentModuleIndex + 1];
    }

    // Se não encontrou módulo atual ou é o último, retorna undefined
    return undefined;
  }, [modulesProgress]);

  // Fecha o popover quando o modal abre e reativa "Começar" quando o modal fecha
  useEffect(() => {
    const wasModalOpen = prevIsModalOpenRef.current;

    if (isModalOpen) {
      // Modal abriu: fecha o popover
      setOpenPopover(null);
      prevOpenPopoverRef.current = null;
    } else if (wasModalOpen && !isModalOpen) {
      // Modal foi fechado: reativa o popover "Começar" na primeira lição incompleta
      if (firstIncompleteLesson) {
        setShowContinue(true);
        // Faz scroll até a lição atual após fechar o modal
        // Aguarda um delay para garantir que o DOM foi atualizado
        setTimeout(() => {
          const lessonElement = taskRefs.current[firstIncompleteLesson.id];
          if (lessonElement) {
            lessonElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });
          }
        }, 500);
      }

      // Se um módulo foi desbloqueado, atualiza o roadmap e os módulos
      if (moduleUnlockedTimestamp) {
        // Aguarda um pouco para garantir que o cache foi atualizado
        setTimeout(async () => {
          const updatedRoadmap = await fetchRoadmap();
          await fetchModulesProgress();
          router.refresh();

          // Aguarda um pouco mais para garantir que o roadmap foi atualizado e o DOM renderizado
          setTimeout(() => {
            // Busca a lição atual do roadmap atualizado
            let lessonToScroll: typeof firstIncompleteLesson = undefined;

            // Tenta encontrar a lição atual (isCurrent) primeiro no roadmap atualizado
            if (updatedRoadmap?.modules) {
              for (const moduleItem of updatedRoadmap.modules) {
                if (!moduleItem?.groups) continue;
                for (const group of moduleItem.groups) {
                  if (!group?.lessons) continue;
                  const current = group.lessons.find((l) => l.isCurrent);
                  if (current) {
                    lessonToScroll = current;
                    break;
                  }
                }
                if (lessonToScroll) break;
              }
            }

            // Se não encontrou a lição atual, usa a primeira incompleta do roadmap atualizado
            if (!lessonToScroll && updatedRoadmap?.modules) {
              const allLessons = updatedRoadmap.modules
                .flatMap((module) => module?.groups || [])
                .flatMap((group) => group?.lessons || []);
              lessonToScroll = allLessons.find(
                (lesson) =>
                  lesson.status !== "completed" && lesson.status !== "locked"
              );
            }

            if (lessonToScroll) {
              const lessonElement = taskRefs.current[lessonToScroll.id];
              if (lessonElement) {
                lessonElement.scrollIntoView({
                  behavior: "smooth",
                  block: "center",
                });
              }
            }
          }, 500);
        }, 300);
      }
    }

    // Atualiza a referência com o valor atual
    prevIsModalOpenRef.current = isModalOpen;
  }, [
    isModalOpen,
    firstIncompleteLesson,
    moduleUnlockedTimestamp,
    fetchRoadmap,
    fetchModulesProgress,
    router,
    currentLesson,
  ]);

  // Quando o popover "Assistir" é fechado, mostra o popover "Começar" novamente na lição atual
  useEffect(() => {
    // Verifica se o popover estava aberto e agora foi fechado (não foi por causa do modal)
    const wasOpen = prevOpenPopoverRef.current !== null;
    const isClosed = openPopover === null;
    const modalDidntCloseIt = !isModalOpen;

    if (wasOpen && isClosed && modalDidntCloseIt && firstIncompleteLesson) {
      setShowContinue(true);
    }

    // Atualiza a referência com o valor atual
    prevOpenPopoverRef.current = openPopover;
  }, [openPopover, isModalOpen, firstIncompleteLesson]);

  // Busca os módulos com progresso quando o componente carrega
  useEffect(() => {
    fetchModulesProgress();
  }, [fetchModulesProgress]);

  // Recarrega o roadmap e faz scroll quando o curso ativo muda
  useEffect(() => {
    const loadNewRoadmap = async () => {
      if (!currentActiveCourse?.id) return;

      // Verifica se o curso mudou comparando com o último curso conhecido
      if (lastActiveCourseIdRef.current && lastActiveCourseIdRef.current !== currentActiveCourse.id) {
        // Curso mudou, recarrega o roadmap
        const updatedRoadmap = await fetchRoadmap();
        await fetchModulesProgress();
        // Reseta o scroll e outros estados
        hasScrolledRef.current = false;
        setOpenPopover(null);
        setShowContinue(true);

        // Aguarda um pouco para garantir que o DOM foi atualizado
        setTimeout(() => {
          // Busca a lição atual do roadmap atualizado
          let lessonToScroll: typeof firstIncompleteLesson = undefined;

          // Tenta encontrar a lição atual (isCurrent) primeiro no roadmap atualizado
          if (updatedRoadmap?.modules) {
            for (const moduleItem of updatedRoadmap.modules) {
              if (!moduleItem?.groups) continue;
              for (const group of moduleItem.groups) {
                if (!group?.lessons) continue;
                const current = group.lessons.find((l) => l.isCurrent);
                if (current) {
                  lessonToScroll = current;
                  break;
                }
              }
              if (lessonToScroll) break;
            }
          }

          // Se não encontrou a lição atual, usa a primeira incompleta do roadmap atualizado
          if (!lessonToScroll && updatedRoadmap?.modules) {
            const allLessons = updatedRoadmap.modules
              .flatMap((module) => module?.groups || [])
              .flatMap((group) => group?.lessons || []);
            lessonToScroll = allLessons.find(
              (lesson) =>
                lesson.status !== "completed" && lesson.status !== "locked"
            );
          }

          // Faz scroll até a lição encontrada
          if (lessonToScroll) {
            const lessonElement = taskRefs.current[lessonToScroll.id];
            if (lessonElement) {
              lessonElement.scrollIntoView({
                behavior: "smooth",
                block: "center",
              });
            }
          }
        }, 500);
      } else if (!lastActiveCourseIdRef.current && currentActiveCourse.id) {
        // Primeira vez carregando ou curso inicial
        lastActiveCourseIdRef.current = currentActiveCourse.id;
      }
    };

    loadNewRoadmap();
  }, [currentActiveCourse?.id, fetchRoadmap, fetchModulesProgress, firstIncompleteLesson]);

  // Atualiza o ref quando o activeCourse muda
  useEffect(() => {
    if (currentActiveCourse?.id) {
      lastActiveCourseIdRef.current = currentActiveCourse.id;
    }
  }, [currentActiveCourse?.id]);

  // Atualiza o roadmap quando uma lição é marcada como concluída no modal
  useEffect(() => {
    if (lessonCompletedTimestamp && currentActiveCourse?.id) {
      // Aguarda um pequeno delay para garantir que a API foi atualizada
      const timeoutId = setTimeout(async () => {
        await fetchRoadmap();
        await fetchModulesProgress();
      }, 1);

      return () => clearTimeout(timeoutId);
    }
  }, [
    lessonCompletedTimestamp,
    currentActiveCourse?.id,
    fetchRoadmap,
    fetchModulesProgress,
  ]);

  // Faz scroll quando o roadmap é atualizado após completar uma lição
  useEffect(() => {
    // Verifica se há uma nova lição completada e se ainda não fizemos scroll para ela
    if (
      lessonCompletedTimestamp &&
      lessonCompletedTimestamp !== lastCompletedTimestampRef.current &&
      roadmap &&
      firstIncompleteLesson
    ) {
      // Marca que já fizemos scroll para este timestamp
      lastCompletedTimestampRef.current = lessonCompletedTimestamp;

      // Aguarda um delay para garantir que o DOM foi atualizado
      const timeoutId = setTimeout(() => {
        const lessonElement = taskRefs.current[firstIncompleteLesson.id];
        if (lessonElement) {
          lessonElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 800); // Delay maior para garantir que o roadmap foi atualizado

      return () => clearTimeout(timeoutId);
    }
  }, [roadmap, firstIncompleteLesson, lessonCompletedTimestamp]);

  // Faz scroll até a lição atual quando a página carrega
  useEffect(() => {
    if (!hasScrolledRef.current && roadmap && firstIncompleteLesson) {
      // Aguarda um pequeno delay para garantir que o DOM foi renderizado
      const timeoutId = setTimeout(() => {
        const lessonElement = taskRefs.current[firstIncompleteLesson.id];
        if (lessonElement) {
          lessonElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          hasScrolledRef.current = true;
        }
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [roadmap, firstIncompleteLesson]);

  const togglePopover = (id: number) => {
    setOpenPopover((prev) => (prev === id ? null : id));
  };

  // Fecha popovers durante o resize para evitar reposicionamento constante do Popper
  useEffect(() => {
    let timeoutRef: NodeJS.Timeout | null = null;

    const handleResize = () => {
      // Fecha o popover imediatamente ao detectar resize
      if (openPopover !== null) {
        setOpenPopover(null);
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
  }, [openPopover]);

  const handleUnlockNext = async () => {
    if (!nextLockedModule || !currentActiveCourse?.id) return;

    try {
      const result = await continueNextModule(currentActiveCourse.id);
      if (result.success && result.data) {
        // Atualiza os módulos e o roadmap
        await fetchModulesProgress();
        await fetchRoadmap();
        router.refresh();
      } else {
        console.error("Erro ao continuar para próximo módulo:", result.error);
        alert(result.error || "Erro ao continuar para próximo módulo");
      }
    } catch (error) {
      console.error("Erro ao continuar para próximo módulo:", error);
      alert("Erro ao continuar para próximo módulo");
    }
  };

  // Verificação de segurança: não renderiza se o roadmap não estiver disponível
  if (!roadmap || !roadmap.modules) {
    return (
      <div className="flex items-center justify-center w-full h-[100dvh]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">
            Carregando roadmap do curso...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div className="w-full space-y-4">
        <div className="w-full lg:py-10 py-0 rounded-2xl flex items-center justify-center flex-col">
          <LearnHeader
            currentModule={currentModule}
            currentClass={currentClass}
            courseTitle={roadmap?.course?.title || "Curso"}
            lessonTitle={currentLessonTitle}
            onToggleModules={() => { }}
            loadingModules={false}
          />
          <LessonsContent
            roadmap={roadmap}
            activeCourse={currentActiveCourse}
            openPopover={openPopover}
            togglePopover={togglePopover}
            showContinue={showContinue}
            setShowContinue={setShowContinue}
            firstIncompleteLesson={firstIncompleteLesson}
            allLessons={allLessons}
            taskRefs={taskRefs}
          />
          <div className="flex items-center justify-between flex-col border border-[#25252A] lg:border-b-[1px] lg:border-r-[1px] lg:border-l-[1px] border-l-0 border-r-0 border-b-0 lg:rounded-[20px] rounded-none p-8 w-full max-w-[412px]">
            {(nextLockedModule || currentActiveCourse?.isCompleted === true) && (
              <div className="flex items-center justify-between p-2 bg-[#1a1a1e] rounded-lg mb-4">
                <span
                  className={
                    nextLockedModule?.canUnlock
                      ? "text-xs font-bold bg-blue-gradient-500 bg-clip-text text-transparent bg-[#1a1a1e]"
                      : "text-xs font-bold text-zinc-500"
                  }
                >
                  {nextLockedModule ? "A SEGUIR" : "CERTIFICADO"}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between gap-2 flex-col w-full">
              {allLessons.length === 0 ? (
                <>
                  <p className="text-muted-foreground text-center">
                    Curso em construção...
                  </p>
                  <Button asChild className="w-full mt-3 px-6 h-[48px] rounded-full border border-[#25252A] text-sm flex items-center justify-center text-white ease-linear duration-150 bg-blue-gradient-first">
                    <Link href="/learn/catalog">Procurar outro curso</Link>
                  </Button>
                </>
              ) : nextLockedModule ? (
                <>
                  <div className="flex items-center text-center justify-between gap-2 text-2xl mb-4">
                    {nextLockedModule?.locked ? <Lock size={24} weight="fill" /> : ""}
                    <p>{nextLockedModule.title}</p>
                  </div>
                  <button
                    onClick={handleUnlockNext}
                    disabled={!nextLockedModule?.canUnlock}
                    className="w-full font-semibold text-center px-6 h-[48px] rounded-full border border-[#25252A] text-sm flex items-center justify-center text-white ease-linear duration-150 bg-blue-gradient-500 disabled:opacity-50 disabled:cursor-not-allowed disabled:saturate-50"
                  >
                    {nextLockedModule?.locked ? "Bloqueado" : "Continuar"}
                  </button>
                </>
              ) : (
                currentActiveCourse?.isCompleted === true ? (
                  <>
                    <h3 className="text-2xl text-center">
                      Parabéns! Você completou o curso!
                    </h3>
                    <p className="text-muted-foreground">
                      Gere seu certificado de conclusão
                    </p>
                    <PrimaryButton
                      variant="secondary"
                      onClick={() => { }}
                      className="h-[48px]"
                    >
                      Gerar certificado
                      <CertificateIcon size={18} className="mr-2" weight="fill" />
                    </PrimaryButton>
                  </>
                ) : null
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
