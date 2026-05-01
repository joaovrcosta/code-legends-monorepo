'use client'

import {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
  memo,
} from 'react'
import { getSession } from 'next-auth/react'
import { useShallow } from 'zustand/react/shallow'
import type { Challenge } from '@/types/roadmap'
import { ChallengeBlock } from './ChallengeBlock'
import { continueCourse } from '@/actions/course'
import { revalidateRoadmapCache } from '@/actions/course/revalidate-roadmap'
import { awardChallengeXpFromBrowser } from '@/lib/award-challenge-xp-client'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import { CompactNumber } from '@/components/ui/compact-number'
import { Loader2 } from 'lucide-react'
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

const QUIZ_VICTORY_SOUND_SRC = '/sounds/quiz-victory.mp3'

function playQuizVictorySound() {
  if (typeof window === 'undefined') return
  try {
    const audio = new Audio(QUIZ_VICTORY_SOUND_SRC)
    audio.volume = 0.45
    void audio.play().catch(() => {
      /* autoplay bloqueado ou falha de decodificação */
    })
  } catch {
    /* ignore */
  }
}

type QuizResultPanelProps = {
  passed: boolean
  correctCount: number
  total: number
  score: number
  isMarking: boolean
  showXpInline: boolean
  totalXpInline: number
  hasCurrentLesson: boolean
  onRetry: () => void
}

const QuizResultPanel = memo(function QuizResultPanel({
  passed,
  correctCount,
  total,
  score,
  isMarking,
  showXpInline,
  totalXpInline,
  hasCurrentLesson,
  onRetry,
}: QuizResultPanelProps) {
  return (
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
      {passed && isMarking ? (
        <div className="mt-4 flex flex-col items-center gap-3">
          <Loader2
            className="h-8 w-8 animate-spin text-[#00b3e4] motion-reduce:animate-none"
            aria-hidden
          />
          <p className="text-sm font-medium text-[#a1a1aa]">calculando…</p>
        </div>
      ) : null}
      {showXpInline ? (
        <div className="mt-4 flex items-center justify-center gap-2 text-[15px] font-semibold text-white">
          <span className="text-orange-400">+</span>
          <CompactNumber
            className="text-4xl text-white"
            value={totalXpInline}
            enableCountUp
            flameGradient
          />
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
        onClick={passed ? undefined : onRetry}
        disabled={passed || isMarking || !hasCurrentLesson}
        className="gap-2 rounded-full bg-[#00b3e4] mt-4 px-6 text-black hover:opacity-90 h-[52px]"
      >
        {isMarking ? 'Salvando...' : passed ? 'Concluído' : 'Tentar novamente'}
      </Button>
    </div>
  )
})

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
  const [challengeXpGained, setChallengeXpGained] = useState(0)
  const [awardedSlots, setAwardedSlots] = useState<Set<number>>(() => new Set())
  const finishQuizInFlightRef = useRef(false)
  const multiQuizVictorySoundPlayedRef = useRef(false)
  const answersRef = useRef(answers)
  answersRef.current = answers

  const { activeCourseId, fetchActiveCourse } = useActiveCourseStore(
    useShallow((s) => ({
      activeCourseId: s.activeCourse?.id ?? null,
      fetchActiveCourse: s.fetchActiveCourse,
    })),
  )

  const {
    modalLessonId,
    modalLessonStatus,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore(
    useShallow((s) => ({
      modalLessonId: s.currentLesson?.id ?? null,
      modalLessonStatus: s.currentLesson?.status ?? null,
      updateCurrentLessonStatus: s.updateCurrentLessonStatus,
      setLastModuleCompletion: s.setLastModuleCompletion,
      setShowModuleStatsOnce: s.setShowModuleStatsOnce,
    })),
  )

  const isMarked =
    modalLessonId === lessonId && modalLessonStatus === 'completed'
  const hasCurrentLesson = modalLessonId != null

  const useMultiFlow = isMultiQuiz

  const total = challenges.length
  const { correctCount, score, passed, stepPct } = useMemo(() => {
    const cc = answers.filter(Boolean).length
    const sc = total > 0 ? Math.round((cc / total) * 100) : 0
    const ps = sc >= PASSING_SCORE
    const sp = total > 0 ? Math.round(((currentIndex + 1) / total) * 100) : 0
    return { correctCount: cc, score: sc, passed: ps, stepPct: sp }
  }, [answers, total, currentIndex])

  const totalXpInline = useMemo(
    () =>
      (passed ? (lessonXpGained ?? 0) : 0) + (passed ? challengeXpGained : 0),
    [passed, lessonXpGained, challengeXpGained],
  )
  const showXpInline = passed && totalXpInline > 0 && !isMarking

  useEffect(() => {
    if (!useMultiFlow) return
    if (!showXpInline) return
    if (multiQuizVictorySoundPlayedRef.current) return
    multiQuizVictorySoundPlayedRef.current = true
    playQuizVictorySound()
  }, [useMultiFlow, showXpInline])

  const handleAnswer = useCallback((correct: boolean) => {
    setAnswers((prev) => [...prev, correct])
  }, [])

  const handleXpAwarded = useCallback(
    (info: { slot: number; amount: number }) => {
      if (info.amount <= 0) return
      setAwardedSlots((prev) => {
        if (prev.has(info.slot)) return prev
        const next = new Set(prev)
        next.add(info.slot)
        return next
      })
      setChallengeXpGained((prev) => prev + info.amount)
    },
    [],
  )

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= challenges.length) {
      const t = challenges.length
      const correct = answers.filter(Boolean).length
      const pct = t > 0 ? Math.round((correct / t) * 100) : 0
      if (pct >= PASSING_SCORE) {
        setIsMarking(true)
      }
      setQuizFinished(true)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [currentIndex, challenges.length, answers])

  const handleQuizRetry = useCallback(() => {
    setCurrentIndex(0)
    setAnswers([])
    setQuizFinished(false)
    setAutoFinishTriggered(false)
    setLessonXpGained(null)
    setChallengeXpGained(0)
    setAwardedSlots(new Set())
    multiQuizVictorySoundPlayedRef.current = false
  }, [])

  const handleMarkAsComplete = useCallback(async () => {
    if (!modalLessonId || modalLessonId !== lessonId) return
    if (isMarking || isMarked) return
    try {
      setIsMarking(true)
      const result = await continueCourse(modalLessonId, activeCourseId ?? undefined)
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
  }, [
    modalLessonId,
    lessonId,
    isMarking,
    isMarked,
    activeCourseId,
    fetchActiveCourse,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  ])

  const handleFinishQuiz = useCallback(async () => {
    const answersSnapshot = answersRef.current
    const totalCh = challenges.length
    const correctCountSnap = answersSnapshot.filter(Boolean).length
    const scoreSnap =
      totalCh > 0 ? Math.round((correctCountSnap / totalCh) * 100) : 0
    const passedSnap = scoreSnap >= PASSING_SCORE
    if (!modalLessonId || modalLessonId !== lessonId) return
    if (finishQuizInFlightRef.current) return
    finishQuizInFlightRef.current = true
    try {
      setIsMarking(true)
      const result = await continueCourse(
        lessonId,
        activeCourseId ?? undefined,
        scoreSnap,
      )
      if (!result?.success)
        throw new Error('A API não retornou sucesso ao salvar o resultado')

      let nextLessonXp: number | null = null
      if (
        passedSnap &&
        typeof result.xpGained === 'number' &&
        result.xpGained > 0
      ) {
        nextLessonXp = result.xpGained
      }

      let nextChallengeXp = 0
      const slotsAwarded = new Set<number>()
      if (passedSnap) {
        const courseId = activeCourseId
        const indices: number[] = []
        for (let i = 0; i < answersSnapshot.length; i++) {
          if (answersSnapshot[i]) indices.push(i)
        }
        if (indices.length > 0) {
          const session = await getSession()
          const accessToken = (session as { accessToken?: string } | null)
            ?.accessToken
          if (accessToken) {
            const results = await Promise.all(
              indices.map((i) =>
                awardChallengeXpFromBrowser(lessonId, i, {
                  courseId,
                  skipRevalidate: true,
                  accessToken,
                }),
              ),
            )
            for (let j = 0; j < results.length; j++) {
              const r = results[j]
              const i = indices[j]
              if (r.applied && r.xpGained > 0) {
                nextChallengeXp += r.xpGained
                slotsAwarded.add(i)
              }
            }
            const trimmed = courseId?.trim()
            if (trimmed) {
              try {
                await revalidateRoadmapCache(trimmed)
              } catch {
                /* opcional */
              }
            }
          }
        }
      }

      setLessonXpGained(nextLessonXp)
      if (passedSnap) {
        setChallengeXpGained(nextChallengeXp)
        setAwardedSlots((prev) => {
          const next = new Set(prev)
          for (const s of slotsAwarded) next.add(s)
          return next
        })
      }

      if (passedSnap) maybeShowStreakCongrats(result)
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
      updateCurrentLessonStatus(passedSnap ? 'completed' : 'unlocked')
      await fetchActiveCourse()
    } catch (error) {
      console.error('Erro ao salvar resultado do quiz:', error)
      const msg = error instanceof Error ? error.message : 'Erro desconhecido'
      alert(`Erro ao salvar resultado: ${msg}. Tente novamente.`)
    } finally {
      finishQuizInFlightRef.current = false
      setIsMarking(false)
    }
  }, [
    lessonId,
    challenges.length,
    activeCourseId,
    modalLessonId,
    fetchActiveCourse,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  ])

  useEffect(() => {
    if (!useMultiFlow) return
    if (!quizFinished) return
    if (!passed) return
    if (autoFinishTriggered) return
    if (!modalLessonId || modalLessonId !== lessonId) return

    setAutoFinishTriggered(true)
    void handleFinishQuiz()
  }, [
    useMultiFlow,
    quizFinished,
    passed,
    autoFinishTriggered,
    modalLessonId,
    lessonId,
    handleFinishQuiz,
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
                    disabled={isMarking || isMarked || !hasCurrentLesson}
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
                    onXpAwarded={handleXpAwarded}
                  />
                ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[#25252A]">
                <CompleteLessonButton
                  onClick={handleMarkAsComplete}
                  disabled={isMarking || isMarked || !hasCurrentLesson}
                  isMarking={isMarking}
                  isMarked={isMarked}
                />
              </div>
            </>
          ) : quizFinished ? (
            <QuizResultPanel
              passed={passed}
              correctCount={correctCount}
              total={total}
              score={score}
              isMarking={isMarking}
              showXpInline={showXpInline}
              totalXpInline={totalXpInline}
              hasCurrentLesson={hasCurrentLesson}
              onRetry={handleQuizRetry}
            />
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
                awardChallengeXpOnCorrect={false}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
