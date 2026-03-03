import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lesson } from '@/types/roadmap'

interface ComponentsArticleProps {
  lesson: Lesson
}

export function ComponentsArticle({ lesson }: ComponentsArticleProps) {
  const body = lesson.article?.body?.trim()

  return (
    <div>
      <div className="bg-gradient-to-r from-[#101012] to-[rgba(0,200,255,0.25)] p-6 lg:h-64 h-56 flex flex-col justify-center items-center rounded-[20px]">
        <div className="text-center">
          <h1 className="text-3xl font-semibold text-white">{lesson.title}</h1>
          {lesson.description && (
            <p className="text-muted-foreground mt-2 text-sm max-w-xl">
              {lesson.description}
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center items-center mt-6">
        <div className="max-w-5xl w-full p-4">
          {body ? (
            <article className="article-body text-base tracking-[0.6px] leading-relaxed text-white/90 prose prose-invert max-w-none prose-p:pb-4 prose-headings:text-white prose-strong:text-white prose-pre:bg-white/5 prose-code:text-white/90">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{body}</ReactMarkdown>
            </article>
          ) : (
            <p className="text-muted-foreground italic">
              Conteúdo em produção. Em breve você poderá ler este artigo aqui.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
