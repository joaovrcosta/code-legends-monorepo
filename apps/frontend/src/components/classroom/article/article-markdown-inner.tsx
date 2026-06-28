'use client'

import React, {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { ComponentProps } from 'react'
import type { Root } from 'mdast'

import { cn } from '@/lib/utils'
import { CodeBlockPre, InlineCode } from './CodeBlock'
import { CalloutBlockquote } from './CalloutBlockquote'
import { ChallengeBlock } from '@/components/classroom/article/challenge-block-dynamic'
import { CodePlayground } from '@/components/code-playground'
import { useArticlePlayground } from '@/contexts/article-playground-context'
import type { Lesson, Challenge, PlaygroundBlock } from '@/types/roadmap'
import { normalizeChallengeType } from '@code-legends/challenges'
import { HashIcon } from '@phosphor-icons/react/dist/ssr'
import {
  extractChallengeFenceInnersFromArticleBody,
  stableChallengeFencePayloadKey,
} from '@code-legends/shared-types'

type ImageAlign = 'left' | 'center' | 'right' | 'justify'

const ArticleLessonChallengeXpContext = createContext<{
  lessonId: number
  challengeFenceInners: string[]
} | null>(null)

const ALIGN_CLASSES: Record<ImageAlign, string> = {
  left: 'mr-auto',
  center: 'mx-auto',
  right: 'ml-auto',
  justify: 'mx-auto w-full',
}

function isReactElement(
  node: React.ReactNode,
): node is React.ReactElement<{ className?: string; children?: React.ReactNode }> {
  return !!node && typeof node === 'object' && 'props' in node
}

function getCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  if (Array.isArray(children))
    return children.map((c) => (typeof c === 'string' ? c : '')).join('')
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

function PlaygroundBlockWrapper({ block }: { block: PlaygroundBlock }) {
  const ctx = useArticlePlayground()
  const [resolvedId, setResolvedId] = useState<string | null>(null)
  const hasTests = Boolean(
    block.testFile || (block.tests && Object.keys(block.tests).length > 0),
  )

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
      onTestsPass={
        playgroundId && ctx ? () => ctx.reportTestsPassed(playgroundId) : undefined
      }
    />
  )
}

function ArticleCodeBlockPre({ children }: ComponentProps<'pre'>) {
  const lessonChallengeXp = useContext(ArticleLessonChallengeXpContext)
  const codeEl = Array.isArray(children) ? children[0] : children
  const className = isReactElement(codeEl) ? codeEl.props.className : undefined
  const lang =
    typeof className === 'string' ? className.match(/language-(\w+)/)?.[1] : 'text'

  if (lang === 'challenge' || lang === 'playground') {
    const raw = isReactElement(codeEl)
      ? getCodeString(codeEl.props.children)
      : getCodeString(codeEl)
    try {
      const data = JSON.parse(raw) as Challenge & { type?: string }
      const normalized = normalizeChallengeType(String(data.type ?? ''))
      if (normalized) {
        data.type = normalized
      }
      let challengeXpSlotIndex: number | undefined
      if (
        lang === 'challenge' &&
        lessonChallengeXp != null &&
        lessonChallengeXp.challengeFenceInners.length > 0
      ) {
        const key = stableChallengeFencePayloadKey(raw)
        let idx = lessonChallengeXp.challengeFenceInners.findIndex(
          (inner) => stableChallengeFencePayloadKey(inner) === key,
        )
        if (idx < 0) {
          idx = lessonChallengeXp.challengeFenceInners.findIndex(
            (inner) => inner.trim() === raw.trim(),
          )
        }
        challengeXpSlotIndex = idx >= 0 ? idx : undefined
      }
      return lang === 'challenge' ? (
        <ChallengeBlock
          challenge={data as Challenge}
          lessonId={lessonChallengeXp?.lessonId}
          challengeXpSlotIndex={challengeXpSlotIndex}
        />
      ) : (
        <PlaygroundBlockWrapper block={data as PlaygroundBlock} />
      )
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

    function processNodes(nodes: any[]) {
      for (let i = nodes.length - 1; i >= 0; i--) {
        const node = nodes[i]
        if (node?.type !== 'paragraph') continue

        const text =
          node.children?.length === 1 && node.children[0]?.type === 'text'
            ? String(node.children[0].value).trim()
            : ''

        const match = text.match(/^\[\[cl-image-align:(left|center|right|justify)\]\]$/)
        if (match) {
          const align = match[1] as ImageAlign
          const prev = nodes[i - 1]
          const img =
            prev?.type === 'paragraph'
              ? prev.children?.find((c: any) => c.type === 'image')
              : null

          if (img) {
            img.data = {
              ...img.data,
              hProperties: { ...img.data?.hProperties, 'data-cl-align': align },
            }
            nodes.splice(i, 1)
          }
        }
      }
    }
  }
}

export function ArticleMarkdownInner({
  body,
  lesson,
}: {
  body: string
  lesson: Lesson
}) {
  const h2SerialRef = useRef(0)
  h2SerialRef.current = 0

  const challengeFenceInners = useMemo(
    () => extractChallengeFenceInnersFromArticleBody(body ?? ''),
    [body],
  )
  const articleLessonChallengeXp = useMemo(
    () => ({
      lessonId: lesson.id,
      challengeFenceInners,
    }),
    [lesson.id, challengeFenceInners],
  )

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
    <ArticleLessonChallengeXpContext.Provider value={articleLessonChallengeXp}>
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
                const align =
                  ((node as any)?.properties?.['data-cl-align'] as ImageAlign) || 'left'
                return (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    {...props}
                    alt={props.alt || ''}
                    className={`block my-8 rounded-2xl max-w-full h-auto ${ALIGN_CLASSES[align]} ${props.className || ''}`}
                  />
                )
              },
            }}
          >
            {body}
          </ReactMarkdown>
      </article>
    </ArticleLessonChallengeXpContext.Provider>
  )
}
