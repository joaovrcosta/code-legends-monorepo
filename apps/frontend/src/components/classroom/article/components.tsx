'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArticlePlaygroundProvider, useArticlePlayground } from '@/contexts/article-playground-context'
import { continueCourse } from '@/actions/course'
import { showLessonXpToast } from '@/lib/show-lesson-xp-toast'
import { maybeShowStreakCongrats } from '@/lib/maybe-show-streak-congrats'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import type { Lesson } from '@/types/roadmap'

const ArticleMarkdownInner = dynamic(
  () =>
    import('@/components/classroom/article/article-markdown-inner').then(
      (m) => m.ArticleMarkdownInner,
    ),
  {
    loading: () => (
      <div
        className="min-h-[24rem] animate-pulse rounded-xl border border-white/5 bg-white/[0.02]"
        aria-busy
        aria-label="Carregando conteúdo do artigo"
      />
    ),
  },
)

function useCompleteLesson(lesson: Lesson, moduleTitle?: string) {
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

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lesson.id || isMarking || isMarked)
      return

    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)

      if (!result?.success) throw new Error('API_ERROR')

      showLessonXpToast(result)
      maybeShowStreakCongrats(result)

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
      console.error(error)
      alert('Erro ao concluir lição. Verifique se há dependências pendentes.')
    } finally {
      setIsMarking(false)
    }
  }

  return { isMarking, isMarked, handleMarkAsComplete, currentLesson, activeCourse }
}

export function ComponentsArticle({
  lesson,
  moduleTitle,
}: {
  lesson: Lesson
  moduleTitle?: string
}) {
  const body = lesson.article?.body?.trim()
  const { isMarking, isMarked, handleMarkAsComplete, currentLesson } = useCompleteLesson(
    lesson,
    moduleTitle,
  )

  return (
    <ArticlePlaygroundProvider>
      <div className="min-h-screen font-wotfard">
        <header className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.15)] px-6 py-20 flex flex-col justify-center items-center lg:rounded-[16px]">
          <div className="max-w-5xl w-full space-y-2">
            {moduleTitle && (
              <span className="text-xs font-bold uppercase tracking-widest text-gray-400">
                {moduleTitle.split(':')[0]}
              </span>
            )}
            <h1 className="text-4xl font-bold text-white tracking-tight">{lesson.title}</h1>
            {lesson.description && (
              <p className="text-gray-400 text-base max-w-2xl">{lesson.description}</p>
            )}
          </div>
        </header>

        <main className="flex justify-center mt-4 px-4">
          <div className="max-w-5xl w-full">
            {body ? (
              <ArticleMarkdownInner body={body} lesson={lesson} />
            ) : (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-gray-500 italic">Conteúdo em produção. Disponível em breve.</p>
              </div>
            )}

            <footer className="mt-12 pt-8 pb-12 border-t border-white/5">
              <CompletionFooter
                isMarking={isMarking}
                isMarked={isMarked}
                disabled={!currentLesson}
                onComplete={handleMarkAsComplete}
              />
            </footer>
          </div>
        </main>
      </div>
    </ArticlePlaygroundProvider>
  )
}

function CompletionFooter({
  isMarking,
  isMarked,
  disabled,
  onComplete,
}: {
  isMarking: boolean
  isMarked: boolean
  disabled: boolean
  onComplete: () => void
}) {
  const playground = useArticlePlayground()
  const needsPlayground =
    playground?.hasRequiredPlaygrounds && !playground?.allPlaygroundsPassed

  return (
    <div className="space-y-4">
      {needsPlayground && (
        <p className="text-sm text-amber-400/80 bg-amber-400/5 p-3 rounded-lg border border-amber-400/10 inline-block">
          ⚠️ Complete os desafios práticos para liberar a conclusão.
        </p>
      )}
      <CompleteLessonButton
        onClick={onComplete}
        isMarking={isMarking}
        isMarked={isMarked}
        disabled={disabled || isMarking || isMarked || needsPlayground}
      />
    </div>
  )
}
