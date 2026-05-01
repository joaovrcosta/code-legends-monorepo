'use client'

import { useState, useCallback } from 'react'
import type { Challenge } from '@/types/roadmap'
import { ChallengeBlock } from './ChallengeBlock'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import Image from 'next/image'
import {
  Check,
  ListChecks,
} from '@phosphor-icons/react/dist/ssr'
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
      showLessonXpToast(result)
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
      if (passed) showLessonXpToast(result)
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

  return (
    <div className="flex flex-col min-h-0">
      {/* Hero */}
      <div className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.25)] px-6 py-5 lg:h-56 h-48 flex flex-col justify-center items-center lg:rounded-[20px] rounded-none">
        <div className="text-start space-y-1 max-w-5xl w-full p-4">
          <div className="flex items-center gap-2 mb-2">
            <ListChecks size={20} className="text-[#00b3e4]" weight="bold" />
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
              Desafios
            </span>
          </div>
          <h1 className="text-3xl font-semibold text-white">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1 text-sm max-w-xl">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex justify-center items-start mt-6">
        <div className="max-w-5xl w-full p-4">
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
                {passed ? 'Aprovado!' : 'Que tal tentar novamente?'}
              </h2>
              <p className="text-[#a1a1aa] mb-1">
                Você acertou {correctCount} de {total} questões ({score}%).
              </p>
              {!passed && (
                <p className="text-sm text-[#71717a] mb-6">
                  É necessário {PASSING_SCORE}% para passar. Tente novamente!
                </p>
              )}
              <Button
                onClick={passed ? handleFinishQuiz : () => {
                  setCurrentIndex(0)
                  setAnswers([])
                  setQuizFinished(false)
                }}
                disabled={isMarking || !currentLesson}
                className="gap-2 rounded-full bg-[#00b3e4] mt-4 px-6 text-black hover:opacity-90 h-[52px]"
              >
                {isMarking ? 'Salvando...' : passed ? 'Concluir' : 'Tentar novamente'}
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
