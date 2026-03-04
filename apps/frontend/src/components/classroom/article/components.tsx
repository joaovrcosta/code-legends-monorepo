import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Lesson } from '@/types/roadmap'
import { CodeBlockPre, InlineCode } from './CodeBlock'
import { CalloutBlockquote } from './CalloutBlockquote'

/**
 * Convenção de callouts para autores (Content Hub):
 * Use blockquotes no Markdown com a primeira palavra em negrito:
 * - > **Note** ou **Nota** → caixa azul (informação)
 * - > **Warning** ou **Aviso** → caixa âmbar (aviso)
 * - > **Tip** ou **Dica** → caixa verde (dica)
 * - > **Success** ou **Sucesso** → caixa verde escura (sucesso)
 */

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
            <article className="article-body text-base tracking-[0.6px] leading-relaxed text-white/90 prose prose-invert max-w-none prose-p:pb-4 prose-headings:text-[#7dd3fc] prose-strong:text-white prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0 prose-code:text-white/90">
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                components={{
                  pre: CodeBlockPre,
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
        </div>
      </div>
    </div>
  )
}
