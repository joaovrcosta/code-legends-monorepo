'use client'

import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import {
  CodeBlockPre,
  InlineCode,
} from '@/components/classroom/article/CodeBlock'

type LabLearnPanelProps = {
  category?: string | null
  title: string
  durationMinutes?: number | null
  learnBody?: string | null
  /** Fallback plain text when learnBody is absent */
  descriptionFallback?: string
}

export function LabLearnPanel({
  category,
  title,
  durationMinutes,
  learnBody,
  descriptionFallback,
}: LabLearnPanelProps) {
  const hasMarkdown = Boolean(learnBody?.trim())

  return (
    <section className="space-y-4">
      <header className="space-y-1">
        {category ? (
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9ca3af]">
            {category}
          </p>
        ) : null}
        {/* Título omitido — o learnBody já traz o heading principal e evita duplicar o nome da aula
        <h2 className="text-2xl font-semibold text-white">{title}</h2>
        */}
        {typeof durationMinutes === 'number' && durationMinutes > 0 ? (
          <p className="text-sm text-white/60">{durationMinutes} min</p>
        ) : null}
      </header>

      {hasMarkdown ? (
        <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-code:text-[#7dd3fc] prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              pre: CodeBlockPre,
              code: InlineCode,
            }}
          >
            {learnBody!}
          </ReactMarkdown>
        </div>
      ) : descriptionFallback ? (
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-white/85">
          {descriptionFallback}
        </p>
      ) : (
        <p className="text-sm text-white/50">Sem conteúdo explicativo.</p>
      )}
    </section>
  )
}
