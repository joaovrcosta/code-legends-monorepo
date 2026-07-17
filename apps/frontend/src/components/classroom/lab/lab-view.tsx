'use client'

import { useMemo, useState } from 'react'
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
import { CheckCircle } from '@phosphor-icons/react/dist/ssr'
// import { CLASSROOM_CONTENT_NESTED_RADIUS_CLASS } from '@/lib/classroom-content-layout'

interface LabViewProps {
  lesson: LessonWithContent
  moduleTitle?: string
}

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

  if (steps.length === 0) {
    return (
      <div className="flex flex-col gap-6 p-4">
        <LabLearnPanel
          category={lab.category}
          title={lab.learnTitle || lesson.title}
          durationMinutes={lab.durationMinutes}
          learnBody={lab.learnBody}
          descriptionFallback={lab.description}
        />
        <p className="text-sm text-white/60">
          Este lab ainda não tem steps configurados.
        </p>
      </div>
    )
  }

  return (
    <div className="flex min-h-[70vh] flex-col gap-4 lg:h-[calc(100vh-12rem)]">
      {/* Header do lab — oculto por enquanto (título já aparece no painel Learn)
      <div
        className={`bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.18)] px-6 py-4 ${CLASSROOM_CONTENT_NESTED_RADIUS_CLASS}`}
      >
        <div className="flex flex-wrap items-center gap-2">
          {moduleTitle ? (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
              {moduleTitle.split(':')[0] ?? moduleTitle}
            </p>
          ) : null}
          <span className="rounded-md border border-cyan-500/50 bg-cyan-500/10 px-2 py-0.5 text-xs font-medium text-cyan-300">
            Lab
          </span>
        </div>
        <h1 className="mt-1 text-2xl font-semibold text-white">{lesson.title}</h1>
      </div>
      */}

      <div className="grid min-h-0 flex-1 gap-4 lg:grid-cols-[minmax(280px,0.9fr)_minmax(0,1.4fr)]">
        <aside className="min-h-0 space-y-5 overflow-y-auto rounded-lg border border-[#25252A] bg-[#101012]">
          <div className="p-4">
            <LabLearnPanel
              category={lab.category}
              title={lab.learnTitle || lesson.title}
              durationMinutes={lab.durationMinutes}
              learnBody={lab.learnBody}
              descriptionFallback={lab.description}
            />
          </div>
          <LabInstructionsPanel
            steps={steps}
            currentStepId={currentStep?.id}
            completedStepIds={completedStepIds}
            alreadyDone={lessonAlreadyDone}
          />
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
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className=" text-[#278b4d]" weight="fill" size={20} />
                <p className="text-sm text-white/70">
                  Lab concluído.
                </p>
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
