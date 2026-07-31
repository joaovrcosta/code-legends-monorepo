'use client'

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from 'react'
import {
  SIDEBAR_MAX_PX,
  SIDEBAR_MIN_PX,
  useResizableSidebar,
} from '@/components/classroom/lab/hooks/use-resizable-sidebar'
import { CaretDown } from '@phosphor-icons/react'
import type { LessonWithContent } from '@/types/roadmap'
import { LabLearnPanel } from '@/components/classroom/lab/lab-learn-panel'
import { LabInstructionsPanel } from '@/components/classroom/lab/lab-instructions-panel'
import { LabPlayground } from '@/components/classroom/lab/lab-playground'
import { useLabStepProgress } from '@/hooks/use-lab-step-progress'
import { mergeLabStarterWithWorkspace } from '@/lib/lab/lab-workspace-files'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { applyModuleCompletionStatsIfNeeded } from '@/lib/apply-module-completion-stats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

interface LabViewProps {
  lesson: LessonWithContent
  moduleTitle?: string
}

const LAB_ACCORDION_TRIGGER =
  'px-4 py-3 hover:no-underline text-white [&[data-state=open]>svg]:rotate-180'

export function LabView({ lesson, moduleTitle }: LabViewProps) {
  const lab = lesson.lab
  const steps = useMemo(() => lab?.specs?.steps ?? [], [lab?.specs?.steps])
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore()

  const isMarked =
    currentLesson?.id === lesson?.id && currentLesson?.status === 'completed'
  const lessonAlreadyDone =
    lesson.status === 'completed' || isMarked

  const {
    currentStep,
    completedStepIds,
    completeStep,
    clearProgress,
    hydrated,
    workspaceFiles,
    updateWorkspaceFiles,
  } = useLabStepProgress({
    lessonId: lesson.id,
    steps,
    lessonStatus: lessonAlreadyDone ? 'completed' : lesson.status,
  })

  const [isMarking, setIsMarking] = useState(false)
  const [failedStepId, setFailedStepId] = useState<string | null>(null)
  const [playgroundEpoch, setPlaygroundEpoch] = useState(0)
  const layoutRef = useRef<HTMLDivElement>(null)
  const {
    sidebarWidth,
    setSidebarWidth,
    isResizing,
    clampSidebarWidth,
    handleResizeStart,
  } = useResizableSidebar(layoutRef)

  const activeTests = useMemo(
    () => ({
      testFile: currentStep?.testFile,
      tests: currentStep?.tests,
    }),
    [currentStep?.id, currentStep?.testFile, currentStep?.tests],
  )

  useEffect(() => {
    setFailedStepId(null)
  }, [currentStep?.id])

  const handleMarkAsComplete = useCallback(async () => {
    if (!currentLesson?.id || currentLesson.id !== lesson.id) return
    if (isMarking || isMarked) return
    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)
      if (!result?.success) {
        throw new Error('A API não retornou sucesso ao completar a lição')
      }
      // Mantém o progresso local dos steps; só limpa no reset do curso.
      showLessonXpToast(result)
      maybeShowStreakCongrats(result)
      applyModuleCompletionStatsIfNeeded(
        result,
        setLastModuleCompletion,
        setShowModuleStatsOnce,
        moduleTitle,
      )
      updateCurrentLessonStatus('completed')
      // continueCourse + status local já bastam para UX / "próxima aula".
      // fetchActiveCourse só sincroniza o store global (sidebar etc.) — não
      // bloquear a percepção de concluído; erros vão para console.error no store.
      void fetchActiveCourse()
    } catch (error) {
      console.error('Erro ao marcar lab como concluído:', error)
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao marcar como concluído: ${msg}. Tente novamente.`)
    } finally {
      setIsMarking(false)
    }
  }, [
    currentLesson?.id,
    lesson.id,
    isMarking,
    isMarked,
    activeCourse?.id,
    moduleTitle,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
    fetchActiveCourse,
  ])

  const handleStepCheckPass = useCallback(
    (stepId: string) => {
      setFailedStepId(null)
      const lastStepId = steps[steps.length - 1]?.id
      const isLastStep = Boolean(lastStepId && stepId === lastStepId)
      completeStep(stepId)
      if (isLastStep && !lessonAlreadyDone) {
        void handleMarkAsComplete()
      }
    },
    [steps, completeStep, lessonAlreadyDone, handleMarkAsComplete],
  )

  const handleStepCheckFail = useCallback((stepId: string) => {
    setFailedStepId(stepId)
  }, [])

  const handleRestoreLab = useCallback(() => {
    clearProgress()
    setFailedStepId(null)
    setPlaygroundEpoch((n) => n + 1)
  }, [clearProgress])

  const handleVerifyAttempt = useCallback(
    (payload: {
      stepId: string
      result: 'pass' | 'fail' | 'timeout' | 'error'
      files: Record<string, string>
    }) => {
      // Workspace só no Verificar (sem autosave na digitação).
      updateWorkspaceFiles(payload.files)
    },
    [updateWorkspaceFiles],
  )

  const playgroundFiles = useMemo(
    () => mergeLabStarterWithWorkspace(lab?.specs?.files, workspaceFiles),
    [lab?.specs?.files, workspaceFiles],
  )

  if (!lab) {
    return (
      <div className="p-4 text-white/70">
        <p>Lab não configurado.</p>
      </div>
    )
  }

  const learnPanel = (
    <LabLearnPanel
      category={lab.category}
      title={lab.learnTitle || lesson.title}
      durationMinutes={lab.durationMinutes}
      learnBody={lab.learnBody}
      descriptionFallback={lab.description}
    />
  )

  if (steps.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <Accordion
          type="multiple"
          defaultValue={['descricao']}
          className="rounded-lg border border-[#25252A] bg-[#101012]"
        >
          <AccordionItem value="descricao" className="border-none">
            <AccordionTrigger className={LAB_ACCORDION_TRIGGER}>
              <span className="text-sm font-semibold uppercase tracking-wide">
                Descrição
              </span>
              <CaretDown className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-200" />
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-4">
              {learnPanel}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
        <p className="text-sm text-white/60">
          Este lab ainda não tem steps configurados.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 lg:h-[calc(100vh-12rem)]">
      <div
        ref={layoutRef}
        className={`flex min-h-0 flex-1 flex-col lg:flex-row ${isResizing ? 'select-none' : ''
          }`}
      >
        <aside
          className="min-h-0 w-full overflow-y-auto rounded-lg border border-[#25252A] bg-[#101012] lg:w-[var(--lab-sidebar-width)] lg:shrink-0"
          style={
            {
              '--lab-sidebar-width': `${sidebarWidth}px`,
            } as CSSProperties
          }
        >
          <Accordion
            type="multiple"
            defaultValue={['descricao', 'instrucoes']}
            className="w-full"
          >
            <AccordionItem
              value="descricao"
              className="border-b border-[#25252A]"
            >
              <AccordionTrigger className={LAB_ACCORDION_TRIGGER}>
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Descrição
                </span>
                <CaretDown className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                {learnPanel}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="instrucoes" className="border-none">
              <AccordionTrigger className={LAB_ACCORDION_TRIGGER}>
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Instruções
                </span>
                <CaretDown className="h-4 w-4 shrink-0 text-white/50 transition-transform duration-200" />
              </AccordionTrigger>
              <AccordionContent className="pb-2">
                <LabInstructionsPanel
                  steps={steps}
                  currentStepId={currentStep?.id}
                  completedStepIds={completedStepIds}
                  failedStepId={failedStepId}
                  alreadyDone={lessonAlreadyDone}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        <div
          role="separator"
          aria-orientation="vertical"
          aria-label="Redimensionar painel de instruções"
          aria-valuenow={sidebarWidth}
          aria-valuemin={SIDEBAR_MIN_PX}
          aria-valuemax={SIDEBAR_MAX_PX}
          tabIndex={0}
          onPointerDown={handleResizeStart}
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') {
              event.preventDefault()
              setSidebarWidth((w) => clampSidebarWidth(w - 16))
            }
            if (event.key === 'ArrowRight') {
              event.preventDefault()
              setSidebarWidth((w) => clampSidebarWidth(w + 16))
            }
          }}
          className={`relative hidden w-3 shrink-0 cursor-col-resize touch-none items-stretch justify-center lg:flex ${isResizing ? 'bg-white/10' : 'hover:bg-white/5'
            }`}
        >
          <span className="my-auto h-10 w-1 rounded-full bg-white/25" />
        </div>

        <div className="mt-4 flex min-h-0 min-w-0 flex-1 flex-col gap-3 lg:mt-0">
          {currentStep && hydrated ? (
            <LabPlayground
              key={`${lesson.id}-${playgroundEpoch}`}
              lessonId={lesson.id}
              files={playgroundFiles}
              starterFiles={lab.specs?.files}
              template={lab.specs?.template ?? 'vanilla'}
              activeTests={activeTests}
              stepId={currentStep.id}
              isLastStep={
                currentStep.id === steps[steps.length - 1]?.id
              }
              expected={currentStep.expected}
              onStepCheckPass={handleStepCheckPass}
              onStepCheckFail={handleStepCheckFail}
              onRestoreLab={handleRestoreLab}
              onVerifyAttempt={handleVerifyAttempt}
              height="100%"
              className="min-h-[420px] flex-1"
            />
          ) : (
            <div className="flex min-h-[420px] flex-1 items-center justify-center rounded-lg border border-[#25252A] bg-[#1A1A1A] text-sm text-white/40">
              Carregando lab…
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
