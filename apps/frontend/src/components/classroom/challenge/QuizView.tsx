'use client'

import { useState } from 'react'
import type { Challenge } from '@/types/roadmap'
import { ChallengeBlock } from './ChallengeBlock'
import { continueCourse } from '@/actions/course'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { Check, ListChecks } from '@phosphor-icons/react/dist/ssr'

interface QuizViewProps {
  lessonId: number
  title: string
  description?: string
  challenges: Challenge[]
}

export function QuizView({
  lessonId,
  title,
  description,
  challenges,
}: QuizViewProps) {
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const { currentLesson, updateCurrentLessonStatus } = useCourseModalStore()
  const isMarked =
    currentLesson?.id === lessonId && currentLesson?.status === 'completed'

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lessonId) return
    if (isMarking || isMarked) return
    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)
      if (!result?.success)
        throw new Error('A API não retornou sucesso ao completar a lição')
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

      {/* Challenges */}
      <div className="flex justify-center items-start mt-6">
        <div className="max-w-5xl w-full p-4">
          {challenges.length === 0 ? (
            <p className="text-[#a1a1aa] italic text-center py-12">
              Nenhum desafio cadastrado ainda.
            </p>
          ) : (
            <div className="flex flex-col gap-2">
              {challenges.map((challenge, i) => (
                <ChallengeBlock key={i} challenge={challenge} index={i} />
              ))}
            </div>
          )}

          {/* Mark as complete */}
          <div className="mt-10 pt-8 border-t border-[#25252A]">
            <Button
              onClick={handleMarkAsComplete}
              disabled={isMarking || isMarked || !currentLesson}
              className={`gap-2 rounded-full px-6 ${
                isMarked
                  ? 'bg-[#00b3e4]/20 text-[#00b3e4] border border-[#00b3e4] hover:bg-[#00b3e4]/20'
                  : 'bg-[#25252A] text-white border border-[#25252A] hover:border-[#00b3e4] hover:bg-[#25252A]'
              }`}
            >
              <Check weight="bold" size={20} />
              {isMarking
                ? 'Marcando...'
                : isMarked
                  ? 'Concluído'
                  : 'Marcar como concluído'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
