'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { ArticlePlaygroundProvider, useArticlePlayground } from '@/contexts/article-playground-context'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import { useCompleteLesson } from '@/hooks/use-complete-lesson'
import type { LessonWithContent } from '@/types/roadmap'
import { CLASSROOM_CONTENT_NESTED_RADIUS_CLASS } from '@/lib/classroom-content-layout'

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

export function ComponentsArticle({
  lesson,
  moduleTitle,
}: {
  lesson: LessonWithContent
  moduleTitle?: string
}) {
  const body = lesson.article?.body?.trim()
  const { isMarking, isMarked, completeLesson, currentLesson } = useCompleteLesson(
    lesson,
    moduleTitle,
  )

  const handleMarkAsComplete = async () => {
    const result = await completeLesson()
    if (!result.ok && !result.alreadyCompleted) {
      alert('Erro ao concluir lição. Verifique se há dependências pendentes.')
    }
  }

  return (
    <ArticlePlaygroundProvider>
      <div className="min-h-screen font-wotfard">
        <header
          className={`bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.15)] px-6 py-20 flex flex-col justify-center items-center ${CLASSROOM_CONTENT_NESTED_RADIUS_CLASS}`}
        >
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
