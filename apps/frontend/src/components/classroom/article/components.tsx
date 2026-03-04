'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Lesson, Challenge } from '@/types/roadmap'
import { CodeBlockPre, InlineCode } from './CodeBlock'
import { CalloutBlockquote } from './CalloutBlockquote'
import { ChallengeBlock } from '@/components/classroom/challenge/ChallengeBlock'
import { continueCourse } from '@/actions/course'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { Button } from '@/components/ui/button'
import { Check } from '@phosphor-icons/react/dist/ssr'

function isReactElement(
  node: React.ReactNode,
): node is React.ReactElement<{
  className?: string
  children?: React.ReactNode
}> {
  return !!node && typeof node === 'object' && 'props' in node
}

function getCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  return Array.isArray(children)
    ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
    : String(children ?? '')
}

function ArticleCodeBlockPre({ children }: ComponentProps<'pre'>) {
  const codeEl = Array.isArray(children) ? children[0] : children
  const className = isReactElement(codeEl) ? codeEl.props.className : undefined
  const match =
    typeof className === 'string' ? className.match(/language-(\w+)/) : null
  const lang = match ? match[1] : 'text'

  if (lang === 'challenge') {
    const raw = isReactElement(codeEl)
      ? getCodeString(codeEl.props.children)
      : getCodeString(codeEl)
    try {
      const challenge = JSON.parse(raw) as Challenge
      return <ChallengeBlock challenge={challenge} />
    } catch {
      return (
        <div className="my-4 rounded-[12px] border border-[#f87171]/40 bg-[#3b1515] px-4 py-3 text-sm text-[#f87171]">
          Desafio inválido (JSON malformado).
        </div>
      )
    }
  }

  return <CodeBlockPre>{children}</CodeBlockPre>
}

interface ComponentsArticleProps {
  lesson: Lesson
  moduleTitle?: string
}

export function ComponentsArticle({
  lesson,
  moduleTitle,
}: ComponentsArticleProps) {
  const body = lesson.article?.body?.trim()
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const { currentLesson, updateCurrentLessonStatus } = useCourseModalStore()
  const isMarked =
    currentLesson?.id === lesson?.id && currentLesson?.status === 'completed'

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lesson.id) return
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
    <div>
      <div className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.25)] px-6 py-5 lg:h-64 h-56 flex flex-col justify-center items-center lg:rounded-[20px] rounded-none">
        <div className="text-start space-y-1 max-w-5xl w-full p-4">
          {moduleTitle && (
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
              {moduleTitle.split(':')[0] ?? moduleTitle}
            </p>
          )}
          <h1 className="text-3xl font-semibold text-white">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground mt-1 text-sm max-w-xl mx-auto">
              {lesson.description}
            </p>
          )}
        </div>
      </div>
      <div className="flex justify-center items-center mt-6">
        <div className="max-w-5xl w-full p-4">
          {body ? (
            <article className="article-body text-base tracking-[0.6px] leading-relaxed text-white/90 prose prose-invert max-w-none prose-p:pb-4 prose-headings:text-[#7dd3fc] prose-strong:text-white prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0 prose-code:text-white/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: ArticleCodeBlockPre,
                  code: InlineCode,
                  blockquote: CalloutBlockquote,
                  h1: ({ children, ...props }) => (
                    <h1
                      {...props}
                      className="text-[32px] text-[#7dd3fc] font-semibold tracking-tight"
                    >
                      {children}
                    </h1>
                  ),
                  h2: ({ children, ...props }) => (
                    <h2
                      {...props}
                      className="text-2xl text-[#7dd3fc] font-semibold tracking-tight mt-8 mb-2"
                    >
                      {children}
                    </h2>
                  ),
                  h3: ({ children, ...props }) => (
                    <h3
                      {...props}
                      className="text-xl text-[#7dd3fc] font-semibold tracking-tight mt-6 mb-2"
                    >
                      {children}
                    </h3>
                  ),
                }}
              >
                {body}
              </ReactMarkdown>
            </article>
          ) : (
            <p className="text-muted-foreground italic">
              Conteúdo em produção. Em breve você poderá ler este artigo aqui.
            </p>
          )}
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
