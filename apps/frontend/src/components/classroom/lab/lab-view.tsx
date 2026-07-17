'use client'

import { useMemo, useState } from 'react'
import { CaretDown } from '@phosphor-icons/react'
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
import type { LessonWithContent } from '@/types/roadmap'
import { LabLearnPanel } from '@/components/classroom/lab/lab-learn-panel'
import { LabInstructionsPanel } from '@/components/classroom/lab/lab-instructions-panel'
import { LabPlayground } from '@/components/classroom/lab/lab-playground'
import { useLabStepProgress } from '@/hooks/use-lab-step-progress'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { applyModuleCompletionStatsIfNeeded } from '@/lib/apply-module-completion-stats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
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
    allStepsDone,
    completeStep,
  } = useLabStepProgress({
    lessonId: lesson.id,
    steps,
    lessonStatus: lessonAlreadyDone ? 'completed' : lesson.status,
  })

  const [isMarking, setIsMarking] = useState(false)

  const canMarkComplete =
    steps.length === 0 || allStepsDone || lessonAlreadyDone

  const activeTests = useMemo(
    () => ({
      testFile: currentStep?.testFile,
      tests: currentStep?.tests,
    }),
    [currentStep],
  )

  const handleMarkAsComplete = async () => {
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
      await fetchActiveCourse()
    } catch (error) {
      console.error('Erro ao marcar lab como concluído:', error)
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao marcar como concluído: ${msg}. Tente novamente.`)
    } finally {
      setIsMarking(false)
    }
  }

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
          defaultValue={['desafio']}
          className="rounded-lg border border-[#25252A] bg-[#101012]"
        >
          <AccordionItem value="desafio" className="border-none">
            <AccordionTrigger className={LAB_ACCORDION_TRIGGER}>
              <span className="text-sm font-semibold uppercase tracking-wide">
                Desafio
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
      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
        <aside className="min-h-0 overflow-y-auto rounded-lg border border-[#25252A] bg-[#101012]">
          <Accordion
            type="multiple"
            defaultValue={['desafio', 'instrucoes']}
            className="w-full"
          >
            <AccordionItem value="desafio" className="border-b border-[#25252A]">
              <AccordionTrigger className={LAB_ACCORDION_TRIGGER}>
                <span className="text-sm font-semibold uppercase tracking-wide">
                  Desafio
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
                  alreadyDone={lessonAlreadyDone}
                />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </aside>

        <div className="flex min-h-0 flex-col gap-3">
          {currentStep ? (
            <LabPlayground
              lessonId={lesson.id}
              files={lab.specs?.files}
              template={lab.specs?.template ?? 'vanilla'}
              activeTests={activeTests}
              stepId={currentStep.id}
              onStepCheckPass={completeStep}
              height="100%"
              className="min-h-[420px] flex-1"
            />
          ) : null}

          <div className="rounded-lg border border-[#25252A] bg-[#101012] p-4">
            {lessonAlreadyDone ? (
              <div className="mb-4 flex items-center gap-2">
                <CheckCircle className=" text-[#278b4d]" weight="fill" size={20} />
                <p className="text-sm text-white/70">Lab concluído.</p>
              </div>
            ) : !canMarkComplete ? (
              <p className="mb-2 text-sm text-white/70">
                Complete todas as instruções para desbloquear a conclusão.
              </p>
            ) : (
              <p className="mb-2 text-sm text-white/70">
                Todos os steps concluídos. Você já pode marcar a aula.
              </p>
            )}
            <CompleteLessonButton
              onClick={handleMarkAsComplete}
              disabled={
                isMarking || isMarked || !currentLesson || !canMarkComplete
              }
              isMarking={isMarking}
              isMarked={isMarked}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
