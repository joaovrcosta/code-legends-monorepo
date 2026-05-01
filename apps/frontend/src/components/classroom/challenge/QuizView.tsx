'use client'

import { useEffect, useState, useCallback } from 'react'
import type { Challenge } from '@/types/roadmap'
import { ChallengeBlock } from './ChallengeBlock'
import { continueCourse } from '@/actions/course'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import { CompactNumber } from '@/components/ui/compact-number'
import Image from 'next/image'
import happyRai from '../../../../public/rai/happy-rai.svg'
import embarassedRai from '../../../../public/rai/embarassed-rai.svg'

interface QuizViewProps {
  lessonId: number
  title: string
  description?: string
  challenges: Challenge[]
  /** true = multi quiz (uma por vez, 70%, score); false = quiz comum (engajamento, sem botão concluir) */
  isMultiQuiz: boolean
}

const PASSING_SCORE = 70

export function QuizView({
  lessonId,
  title,
  description,
  challenges,
  isMultiQuiz,
}: QuizViewProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<boolean[]>([])
  const [quizFinished, setQuizFinished] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const [autoFinishTriggered, setAutoFinishTriggered] = useState(false)
  const [lessonXpGained, setLessonXpGained] = useState<number | null>(null)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore()
  const isMarked =
    currentLesson?.id === lessonId && currentLesson?.status === 'completed'

  const useMultiFlow = isMultiQuiz

  const handleAnswer = useCallback((correct: boolean) => {
    setAnswers((prev) => [...prev, correct])
  }, [])

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= challenges.length) {
      setQuizFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, challenges.length])

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lessonId) return
    if (isMarking || isMarked) return
    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)
      if (!result?.success)
        throw new Error('A API não retornou sucesso ao completar a lição')
      const xpFromResult =
        typeof result.xpGained === 'number'
          ? result.xpGained
          : typeof result.xpGainedInModule === 'number'
            ? result.xpGainedInModule
            : typeof result.totalXp === 'number'
              ? result.totalXp
              : null
      if (typeof xpFromResult === 'number' && xpFromResult > 0) {
        setLessonXpGained(xpFromResult)
      }
      maybeShowStreakCongrats(result)
      if (result.moduleCompleted) {
        setLastModuleCompletion({
          moduleCompleted: true,
          moduleId: result.moduleId,
          moduleTitle: result.moduleTitle,
          progress: result.progress,
          xpGained: result.xpGained,
          xpGainedInModule: result.xpGainedInModule,
          xpGainedInModuleBySkill: result.xpGainedInModuleBySkill,
        })
        setShowModuleStatsOnce(true)
      }
      updateCurrentLessonStatus('completed')
      await fetchActiveCourse()
    } catch (error) {
      console.error('Erro ao marcar como concluído:', error)
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      if (msg.includes('locked') || msg.includes('bloqueada')) {
        alert(
          'Esta aula está bloqueada. Complete as aulas anteriores para desbloqueá-la.',
        )
      } else {
        alert(`Erro ao marcar como concluído: ${msg}. Tente novamente.`)
      }
    } finally {
      setIsMarking(false)
    }
  }

  const handleFinishQuiz = async () => {
    const total = challenges.length
    const correctCount = answers.filter(Boolean).length
    const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
    const passed = score >= PASSING_SCORE
    if (!currentLesson?.id || currentLesson.id !== lessonId) return
    if (isMarking) return
    try {
      setIsMarking(true)
      const result = await continueCourse(lessonId, activeCourse?.id, score)
      if (!result?.success)
        throw new Error('A API não retornou sucesso ao salvar o resultado')
      const xpFromResult =
        typeof result.xpGained === 'number'
          ? result.xpGained
          : typeof result.xpGainedInModule === 'number'
            ? result.xpGainedInModule
            : typeof result.totalXp === 'number'
              ? result.totalXp
              : null
      if (passed && typeof xpFromResult === 'number' && xpFromResult > 0) {
        setLessonXpGained(xpFromResult)
      }
      if (passed) maybeShowStreakCongrats(result)
      if (result.moduleCompleted) {
        setLastModuleCompletion({
          moduleCompleted: true,
          moduleId: result.moduleId,
          moduleTitle: result.moduleTitle,
          progress: result.progress,
          xpGained: result.xpGained,
          xpGainedInModule: result.xpGainedInModule,
          xpGainedInModuleBySkill: result.xpGainedInModuleBySkill,
        })
        setShowModuleStatsOnce(true)
      }
      updateCurrentLessonStatus(passed ? 'completed' : 'unlocked')
      await fetchActiveCourse()
    } catch (error) {
      console.error('Erro ao salvar resultado do quiz:', error)
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao salvar resultado: ${msg}. Tente novamente.`)
    } finally {
      setIsMarking(false)
    }
  }

  const total = challenges.length
  const correctCount = answers.filter(Boolean).length
  const score = total > 0 ? Math.round((correctCount / total) * 100) : 0
  const passed = score >= PASSING_SCORE
  const stepPct = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0
  const showLessonXpInline =
    passed && typeof lessonXpGained === 'number' && lessonXpGained > 0

  useEffect(() => {
    if (!useMultiFlow) return
    if (!quizFinished) return
    if (!passed) return
    if (autoFinishTriggered) return
    if (!currentLesson?.id || currentLesson.id !== lessonId) return
    if (isMarking) return

    setAutoFinishTriggered(true)
    void handleFinishQuiz()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    useMultiFlow,
    quizFinished,
    passed,
    autoFinishTriggered,
    currentLesson?.id,
    lessonId,
    isMarking,
  ])

  return (
    <div className="flex flex-col min-h-0 flex-1">
      {/* Content */}
      <div className="flex flex-1 justify-center items-center min-h-0">
        <div className="max-w-5xl w-full p-4 min-h-0">
          {challenges.length === 0 ? (
            <>
              <p className="text-[#a1a1aa] italic text-center py-12">
                Nenhum desafio cadastrado ainda.
              </p>
              {isMultiQuiz && (
                <div className="mt-10 pt-8">
                  <CompleteLessonButton
                    onClick={handleMarkAsComplete}
                    disabled={isMarking || isMarked || !currentLesson}
                    isMarking={isMarking}
                    isMarked={isMarked}
                  />
                </div>
              )}
            </>
          ) : !useMultiFlow ? (
            /* Quiz comum: todas as questões; XP por desafio + concluir lição (XP de lição na 1.ª vez) */
            <>
              <div className="relative flex flex-col gap-2">
                {challenges.map((challenge, i) => (
                  <ChallengeBlock
                    key={i}
                    challenge={challenge}
                    index={i}
                    lessonId={lessonId}
                    challengeXpSlotIndex={i}
                  />
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#25252A]">
                <CompleteLessonButton
                  onClick={handleMarkAsComplete}
                  disabled={isMarking || isMarked || !currentLesson}
                  isMarking={isMarking}
                  isMarked={isMarked}
                />
              </div>
            </>
          ) : quizFinished ? (
            /* Tela de resultado */
            <div className="rounded-[16px] p-8 text-center">
              <div className="mx-auto mb-4 flex items-center justify-center">
                <Image
                  src={passed ? happyRai : embarassedRai}
                  alt={passed ? 'Rai feliz' : 'Rai envergonhado'}
                  width={92}
                  height={92}
                  priority
                />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">
                {passed ? 'Mandou bem!' : 'Que tal tentar novamente?'}
              </h2>
              <p className="text-[#a1a1aa] mb-1">
                Você acertou {correctCount} de {total} questões ({score}%).
              </p>
              {showLessonXpInline ? (
                <div className="mt-4 flex items-center justify-center gap-2 text-[15px] font-semibold text-white">
                  <CompactNumber className='text-4xl text-white' value={lessonXpGained} enableCountUp flameGradient />
                  <span className="inline-flex items-center gap-2">
                    <img
                      src="/xp-icon.svg"
                      alt=""
                      width={11}
                      height={20}
                      className="h-4 w-auto object-contain"
                      aria-hidden
                    />
                  </span>
                </div>
              ) : null}
              {!passed && (
                <p className="text-sm text-[#71717a] mb-6">
                  É necessário {PASSING_SCORE}% para passar. Tente novamente!
                </p>
              )}
              <Button
                onClick={passed ? undefined : () => {
                  setCurrentIndex(0)
                  setAnswers([])
                  setQuizFinished(false)
                  setAutoFinishTriggered(false)
                }}
                disabled={passed || isMarking || !currentLesson}
                className="gap-2 rounded-full bg-[#00b3e4] mt-4 px-6 text-black hover:opacity-90 h-[52px]"
              >
                {isMarking ? 'Salvando...' : passed ? 'Concluído' : 'Tentar novamente'}
              </Button>
            </div>
          ) : (
            /* Uma questão por vez */
            <div className="relative flex flex-col gap-2">
              {total > 1 && (
                <div className="mb-2">
                  <p className="text-xs text-[#71717a] mb-2">
                    Questão {currentIndex + 1} de {total}
                  </p>
                  <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#2a2a31]">
                    <div
                      className="h-full rounded-full bg-blue-gradient-500 shadow-[0_0_12px_rgba(184,230,46,0.35)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                      style={{ width: `${stepPct}%` }}
                      role="progressbar"
                      aria-valuenow={currentIndex + 1}
                      aria-valuemin={1}
                      aria-valuemax={total}
                      aria-label={`Questão ${currentIndex + 1} de ${total}`}
                    />
                  </div>
                </div>
              )}
              <ChallengeBlock
                key={currentIndex}
                challenge={challenges[currentIndex]}
                index={currentIndex}
                lessonId={lessonId}
                challengeXpSlotIndex={currentIndex}
                onAnswer={handleAnswer}
                onNext={handleNext}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
