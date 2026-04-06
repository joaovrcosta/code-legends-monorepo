'use client'

import React, { useEffect, useLayoutEffect, useRef, useState, useMemo } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ComponentProps } from 'react'
import type { Root } from 'mdast'

import { cn } from '@/lib/utils'
import { CodeBlockPre, InlineCode } from './CodeBlock'
import { CalloutBlockquote } from './CalloutBlockquote'
import { ChallengeBlock } from '@/components/classroom/challenge/ChallengeBlock'
import { CodePlayground } from '@/components/code-playground'
import { ArticlePlaygroundProvider, useArticlePlayground } from '@/contexts/article-playground-context'
import { continueCourse } from '@/actions/course'
import { useActiveCourseStore } from '@/stores/active-course-store'
import { useCourseModalStore } from '@/stores/course-modal-store'
import { CompleteLessonButton } from '@/components/classroom/complete-lesson-button'
import type { Lesson, Challenge, PlaygroundBlock } from '@/types/roadmap'
import { HashIcon } from '@phosphor-icons/react/dist/ssr'

type ImageAlign = 'left' | 'center' | 'right' | 'justify'

const ALIGN_CLASSES: Record<ImageAlign, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
  justify: 'mx-auto w-full'
}

function isReactElement(node: React.ReactNode): node is React.ReactElement<{ className?: string; children?: React.ReactNode }> {
  return !!node && typeof node === 'object' && 'props' in node
}

function getCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children)) return children.map(c => typeof c === 'string' ? c : '').join('')
  return String(children ?? '')
}

function markdownTextContent(node: React.ReactNode): string {
  if (node == null || typeof node === 'boolean') return ''
  if (typeof node === 'string' || typeof node === 'number') return String(node)
  if (Array.isArray(node)) return node.map(markdownTextContent).join('')
  if (React.isValidElement(node)) {
    const props = node.props as { children?: React.ReactNode }
    return markdownTextContent(props?.children)
  }
  return ''
}

function slugifyHeading(text: string): string {
  const s = text
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s-]/gu, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
  return s.slice(0, 80)
}

function scrollHeadingIntoView(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  window.history.replaceState(null, '', `#${encodeURIComponent(id)}`)
}

function useCompleteLesson(lesson: Lesson, moduleTitle?: string) {
  const [isMarking, setIsMarking] = useState(false)
  const { activeCourse, fetchActiveCourse } = useActiveCourseStore()
  const { currentLesson, updateCurrentLessonStatus, setLastModuleCompletion, setShowModuleStatsOnce } = useCourseModalStore()

  const isMarked = currentLesson?.id === lesson?.id && currentLesson?.status === 'completed'

  const handleMarkAsComplete = async () => {
    if (!currentLesson?.id || currentLesson.id !== lesson.id || isMarking || isMarked) return

    try {
      setIsMarking(true)
      const result = await continueCourse(currentLesson.id, activeCourse?.id)

      if (!result?.success) throw new Error('API_ERROR')

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

function PlaygroundBlockWrapper({ block }: { block: PlaygroundBlock }) {
  const ctx = useArticlePlayground()
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const hasTests = Boolean(block.testFile || (block.tests && Object.keys(block.tests).length > 0))

  useEffect(() => {
    if (ctx && hasTests) {
      setResolvedId(ctx.registerPlayground(block.playgroundId, true))
    } else {
      setResolvedId(block.playgroundId ?? null)
    }
  }, [ctx, hasTests, block.playgroundId])

  const playgroundId = resolvedId ?? block.playgroundId ?? undefined

  return (
    <CodePlayground
      files={block.files}
      template={block.template}
      testFile={block.testFile}
      tests={block.tests}
      playgroundId={playgroundId}
      onTestsPass={playgroundId && ctx ? () => ctx.reportTestsPassed(playgroundId) : undefined}
    />
  )
}

function ArticleCodeBlockPre({ children }: ComponentProps<'pre'>) {
  const codeEl = Array.isArray(children) ? children[0] : children
  const className = isReactElement(codeEl) ? codeEl.props.className : undefined
  const lang = typeof className === 'string' ? className.match(/language-(\w+)/)?.[1] : 'text'

  if (lang === 'challenge' || lang === 'playground') {
    const raw = isReactElement(codeEl) ? getCodeString(codeEl.props.children) : getCodeString(codeEl)
    try {
      const data = JSON.parse(raw)
      return lang === 'challenge'
        ? <ChallengeBlock challenge={data as Challenge} />
        : <PlaygroundBlockWrapper block={data as PlaygroundBlock} />
    } catch {
      return (
        <div className="my-4 rounded-xl border border-red-500/40 bg-red-950/20 px-4 py-3 text-sm text-red-400">
          Bloco de {lang} inválido (JSON malformado).
        </div>
      )
    }
  }

  return <CodeBlockPre>{children}</CodeBlockPre>
}

function remarkImageAlign() {
  return (tree: Root) => {
    const blocks = tree.children as any[]
    for (const node of blocks) {
      if (node.children) processNodes(node.children)
    }
    processNodes(blocks)
  }

  function processNodes(nodes: any[]) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i]
      if (node?.type !== 'paragraph') continue

      const text = node.children?.length === 1 && node.children[0]?.type === 'text'
        ? String(node.children[0].value).trim()
        : ''

      const match = text.match(/^\[\[cl-image-align:(left|center|right|justify)\]\]$/)
      if (match) {
        const align = match[1] as ImageAlign
        const prev = nodes[i - 1]
        const img = prev?.type === 'paragraph' ? prev.children?.find((c: any) => c.type === 'image') : null

        if (img) {
          img.data = { ...img.data, hProperties: { ...img.data?.hProperties, 'data-cl-align': align } }
          nodes.splice(i, 1)
        }
      }
    }
  }
}

export function ComponentsArticle({ lesson, moduleTitle }: { lesson: Lesson; moduleTitle?: string }) {
  const body = lesson.article?.body?.trim()
  const { isMarking, isMarked, handleMarkAsComplete, currentLesson } = useCompleteLesson(lesson, moduleTitle)
  const h2SerialRef = useRef(0)
  h2SerialRef.current = 0

  useLayoutEffect(() => {
    if (!body) return
    const raw = window.location.hash.slice(1)
    if (!raw) return
    const id = decodeURIComponent(raw)
    const el = document.getElementById(id)
    if (!el) return
    requestAnimationFrame(() => {
      el.scrollIntoView({ behavior: 'auto', block: 'start' })
    })
  }, [lesson.id, body])

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
              <article className="article-body font-wotfard prose prose-invert prose-headings:font-wotfard prose-p:font-wotfard prose-li:font-wotfard prose-blockquote:font-wotfard prose-strong:font-wotfard prose-em:font-wotfard prose-p:leading-[1.8] max-w-[1024px] prose-p:text-[18px] mx-auto text-[#e3e6e8]">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm, remarkImageAlign]}
                  components={{
                    pre: ArticleCodeBlockPre,
                    code: InlineCode,
                    h1: (p) => (
                      <h1
                        className="text-5xl font-wotfard font-bold text-sky-300 mb-8 tracking-tight"
                        {...p}
                      />
                    ),
                    h2: ({ children, className, node: _node, ...rest }) => {
                      h2SerialRef.current += 1
                      const plain = markdownTextContent(children)
                      const slug = slugifyHeading(plain) || 'secao'
                      const id = `${lesson.id}-${slug}-${h2SerialRef.current}`
                      return (
                        <h2
                          id={id}
                          className={cn(
                            'group relative scroll-mt-[92px]',
                            'lg:text-4xl font-wotfard text-2xl font-semibold text-sky-300/90 mt-16 mb-5 border-b border-white/5 pb-2',
                            className,
                          )}
                          {...rest}
                        >
                          <span className="relative block min-w-0">
                            <a
                              href={`#${encodeURIComponent(id)}`}
                              aria-label="Link para esta secção"
                              className={cn(
                                'absolute -left-4 top-[0.40em] w-14 text-right font-normal text-xl leading-none text-sky-300 no-underline lg:-left-14 lg:w-12 flex items-center justify-center',
                                'select-none opacity-0 transition-opacity duration-200',
                                'group-hover:opacity-70 hover:!opacity-100',
                                'focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400/50 focus-visible:rounded',
                              )}
                              onClick={(e) => {
                                e.preventDefault()
                                scrollHeadingIntoView(id)
                              }}
                            >
                              <HashIcon size={28} weight="regular" />
                            </a>
                            {children}
                          </span>
                        </h2>
                      )
                    },
                    h3: (p) => (
                      <h3
                        className="lg:text-2xl text-xl font-wotfard !font-medium text-sky-300/90 mt-6 mb-4"
                        {...p}
                      />
                    ),
                    blockquote: CalloutBlockquote,

                    img: ({ node, ...props }) => {
                      const align = (node as any)?.properties?.['data-cl-align'] as ImageAlign || 'left'
                      return (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          {...props}
                          alt={props.alt || ''}
                          className={`block my-8 rounded-2xl max-w-full h-auto ${ALIGN_CLASSES[align]} ${props.className || ''}`}
                        />
                      )
                    }
                  }}
                >
                  {body}
                </ReactMarkdown>
              </article>
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

function CompletionFooter({ isMarking, isMarked, disabled, onComplete }: any) {
  const playground = useArticlePlayground()
  const needsPlayground = playground?.hasRequiredPlaygrounds && !playground?.allPlaygroundsPassed

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