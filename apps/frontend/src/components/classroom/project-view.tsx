'use client'

import { useState } from 'react'
import type { Lesson } from '@/types/roadmap'
import { CodePlayground } from '@/components/code-playground'
import { continueCourse } from '@/actions/course'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { Check } from '@phosphor-icons/react/dist/ssr'

interface ProjectViewProps {
  lesson: Lesson
  moduleTitle?: string
}

export function ProjectView({ lesson, moduleTitle }: ProjectViewProps) {
  const project = lesson.project
  const [testsPassed, setTestsPassed] = useState(false)
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const {
    currentLesson,
    updateCurrentLessonStatus,
    setLastModuleCompletion,
    setShowModuleStatsOnce,
  } = useCourseModalStore()

  const isMarked =
    currentLesson?.id === lesson?.id && currentLesson?.status === 'completed'

  const specs = project?.specs
  const hasTests = Boolean(
    specs &&
      (specs.testFile ||
        (specs.tests && Object.keys(specs.tests).length > 0)),
  )
  const canMarkComplete = !hasTests || testsPassed

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lesson.id) return
    if (isMarking || isMarked) return
    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)
      if (!result?.success)
        throw new Error('A API não retornou sucesso ao completar a lição')
      if (result.moduleCompleted) {
        setLastModuleCompletion({
          moduleCompleted: true,
          moduleId: result.moduleId,
          moduleTitle: result.moduleTitle ?? moduleTitle,
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

  if (!project) {
    return (
      <div className="p-4 text-white/70">
        <p>Projeto não configurado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.25)] px-6 py-5 lg:h-64 h-56 flex flex-col justify-center items-center lg:rounded-[20px] rounded-none">
        <div className="text-start space-y-1 max-w-5xl w-full p-4">
          {moduleTitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
              {moduleTitle.split(':')[0] ?? moduleTitle}
            </p>
          )}
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-semibold text-white">{lesson.title}</h1>
            <span className="rounded-md border border-amber-500/60 bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-400">
              Desafio do módulo
            </span>
          </div>
          {lesson.description && (
            <p className="text-muted-foreground mt-1 text-sm max-w-xl">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      <div className="max-w-5xl w-full p-4 space-y-4">
        {project.description && (
          <div className="prose prose-invert max-w-none text-white/90 text-base">
            <p className="whitespace-pre-wrap">{project.description}</p>
          </div>
        )}

        {specs && (
          <CodePlayground
            files={specs.files}
            template={specs.template ?? 'vanilla'}
            testFile={typeof specs.testFile === 'string' ? specs.testFile : undefined}
            tests={
              specs.tests && typeof specs.tests === 'object'
                ? (specs.tests as Record<string, string>)
                : undefined
            }
            playgroundId="boss"
            onTestsPass={() => setTestsPassed(true)}
          />
        )}

        <div className="mt-10 pt-8 border-t border-[#25252A]">
          {hasTests && !testsPassed && (
            <p className="mb-2 text-sm text-white/70">
              Passe nos testes do desafio acima para desbloquear.
            </p>
          )}
          <Button
            onClick={handleMarkAsComplete}
            disabled={isMarking || isMarked || !currentLesson || !canMarkComplete}
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
  )
}
