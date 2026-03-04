'use client'

import React, { useRef, useCallback, useState } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Code,
  Info,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Maximize2,
  Minimize2,
} from 'lucide-react'

const ArticleCodeHighlighter = dynamic(
  () =>
    import('./article-code-highlighter').then(
      (m) => m.ArticleCodeHighlighter,
    ),
  { ssr: false },
)

const SNIPPETS = [
  {
    label: 'Bloco de código',
    icon: Code,
    text: '```javascript\n// seu código aqui\n```',
  },
  {
    label: 'Nota',
    icon: Info,
    text: '> **Nota**\n> \n',
  },
  {
    label: 'Aviso',
    icon: AlertTriangle,
    text: '> **Aviso**\n> \n',
  },
  {
    label: 'Dica',
    icon: Lightbulb,
    text: '> **Dica**\n> \n',
  },
  {
    label: 'Sucesso',
    icon: CheckCircle2,
    // ATUALIZADO: Formato que gera o visual "Card com Título"
    text: '> Sucesso **Título aqui**\n> \n> Escreva o conteúdo aqui...',
  },
] as const

type CalloutVariant = 'note' | 'warning' | 'tip' | 'success' | null

function getTextFromNode(node: ReactNode): string {
  if (typeof node === 'string') return node
  if (Array.isArray(node)) return node.map(getTextFromNode).join('')
  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{ children?: ReactNode }>
    return getTextFromNode(element.props.children ?? '')
  }
  return ''
}

function getCalloutVariant(children: ReactNode): CalloutVariant {
  const text = getTextFromNode(children).trim().toLowerCase()
  if (/^(note|nota)\b/.test(text)) return 'note'
  if (/^(warning|aviso|atenção|atencao)\b/.test(text)) return 'warning'
  if (/^(tip|dica)\b/.test(text)) return 'tip'
  if (/^(success|sucesso)\b/.test(text)) return 'success'
  return null
}

const previewVariantStyles: Record<
  NonNullable<CalloutVariant>,
  { wrapper: string; icon: typeof Info }
> = {
  note: {
    wrapper:
      'border-l-4 border-sky-500/80 bg-sky-50 dark:bg-sky-900/20 text-sky-900 dark:text-sky-100',
    icon: Info,
  },
  warning: {
    wrapper:
      'border-l-4 border-amber-500/80 bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-100',
    icon: AlertTriangle,
  },
  tip: {
    wrapper:
      'border-l-4 border-emerald-500/80 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100',
    icon: Lightbulb,
  },
  success: {
    wrapper:
      'border-l-4 border-emerald-400 bg-zinc-900 text-emerald-100 [&>p>strong]:text-white',
    icon: CheckCircle2,
  },
}

function PreviewCalloutBlockquote({
  children,
  className = '',
  ...props
}: ComponentProps<'blockquote'>) {
  const variant = getCalloutVariant(children)
  const style = variant ? previewVariantStyles[variant] : null
  const Icon = style?.icon

  if (!variant || !style) {
    return (
      <blockquote
        className={`my-3 border-l-4 border-zinc-300 bg-zinc-50 px-3 py-2 text-zinc-700 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200 ${className}`}
        {...props}
      >
        {children}
      </blockquote>
    )
  }

  return (
    <blockquote
      className={`my-3 flex gap-3 rounded-md px-3 py-2 text-sm ${style.wrapper} ${className}`}
      {...props}
    >
      {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
      <div className="min-w-0 flex-1 leading-relaxed">{children}</div>
    </blockquote>
  )
}

function PreviewCodeBlock({ children }: ComponentProps<'pre'>) {
  const node = Array.isArray(children) ? children[0] : children

  let className: string | undefined
  let codeChildren: ReactNode = children

  if (React.isValidElement(node)) {
    const element = node as React.ReactElement<{
      className?: string
      children?: ReactNode
    }>
    className = element.props.className
    codeChildren = element.props.children
  }

  const text =
    typeof codeChildren === 'string'
      ? codeChildren
      : Array.isArray(codeChildren)
        ? codeChildren.map((c) => (typeof c === 'string' ? c : '')).join('')
        : String(codeChildren ?? '')

  const match = className?.match(/language-(\w+)/)
  const language = match ? match[1] : 'text'

  return (
    <div className="my-3 overflow-hidden rounded-md bg-zinc-900 text-xs leading-relaxed text-zinc-100">
      <ArticleCodeHighlighter code={text} language={language} />
    </div>
  )
}

interface ArticleBodyEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
  isArticle?: boolean
}

export function ArticleBodyEditor({
  id,
  value,
  onChange,
  placeholder = 'Escreva o conteúdo em Markdown...',
  rows = 12,
  isArticle = false,
}: ArticleBodyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)

  const insertAtCursor = useCallback(
    (snippet: string) => {
      const textarea = textareaRef.current
      if (!textarea) {
        onChange(value + snippet)
        return
      }
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = value.slice(0, start)
      const after = value.slice(end)
      const newValue = before + snippet + after
      onChange(newValue)

      // Foca e posiciona o cursor logo após o snippet inserido
      requestAnimationFrame(() => {
        textarea.focus()
        const newPos = start + snippet.length
        textarea.setSelectionRange(newPos, newPos)
      })
    },
    [value, onChange],
  )

  const hasContent = value.trim().length > 0

  const previewNode = hasContent ? (
    <div className="rounded-md border border-zinc-200 bg-white p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
      <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:text-zinc-400">
        Pré-visualização
      </p>
      <div className="prose prose-sm max-w-none text-zinc-900 dark:prose-invert dark:text-zinc-100 prose-pre:bg-transparent prose-pre:p-0 prose-pre:border-0">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            blockquote: PreviewCalloutBlockquote,
            pre: PreviewCodeBlock,
          }}
        >
          {value}
        </ReactMarkdown>
      </div>
    </div>
  ) : null

  const snippetsToolbar = (
    <div className="flex flex-wrap gap-2">
      {SNIPPETS.map(({ label, icon: Icon, text }) => (
        <Button
          key={label}
          type="button"
          variant="outline"
          size="sm"
          onClick={() => insertAtCursor(text)}
          className="gap-2 border-dashed"
          title={`Inserir ${label}`}
        >
          <Icon className="h-4 w-4" />
          {label}
        </Button>
      ))}
    </div>
  )

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>Conteúdo do artigo (Markdown)</Label>
        {!isArticle && (
          <span className="text-xs text-muted-foreground">Suporta GFM</span>
        )}
      </div>

      {isArticle ? (
        <div className="rounded-md border border-zinc-800/60 bg-zinc-950/60 p-3 space-y-3">
          <div className="flex items-center justify-between gap-2 border-b border-zinc-800/80 pb-2">
            <div className="flex flex-col">
              <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500">
                Editor de artigo
              </span>
              <span className="text-[11px] text-zinc-500">
                Markdown à esquerda, pré-visualização à direita
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsExpanded((v) => !v)}
              className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
            >
              {isExpanded ? (
                <>
                  <Minimize2 className="h-3 w-3" />
                  Compactar
                </>
              ) : (
                <>
                  <Maximize2 className="h-3 w-3" />
                  Expandir
                </>
              )}
            </button>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {snippetsToolbar}
            <span className="text-[11px] text-zinc-500">Suporta GFM</span>
          </div>

          <div className="grid gap-4 md:grid-cols-2 pt-2">
            <div>
              <Textarea
                ref={textareaRef}
                id={id}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                rows={rows}
                className="font-mono text-sm leading-relaxed h-full min-h-[200px]"
                placeholder={placeholder}
              />
            </div>
            <div>{previewNode}</div>
          </div>
        </div>
      ) : (
        <>
          {snippetsToolbar}

          <Textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            rows={rows}
            className="font-mono text-sm leading-relaxed"
            placeholder={placeholder}
          />
          {previewNode}
        </>
      )}

      {isArticle && isExpanded && (
        <div className="fixed inset-0 z-60 bg-zinc-950">
          <div className="flex h-full w-full flex-col gap-3 p-3 md:p-6">
            <div className="flex items-center justify-between gap-2 border-b border-zinc-800 pb-3">
              <div className="flex flex-col">
                <span className="text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-400">
                  Editor de artigo em tela cheia
                </span>
                <span className="text-[11px] text-zinc-500">
                  Markdown à esquerda, pré-visualização à direita
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="inline-flex items-center gap-1 rounded-md border border-zinc-700 px-2 py-1 text-[11px] font-medium text-zinc-300 hover:bg-zinc-800 transition-colors"
              >
                <Minimize2 className="h-3 w-3" />
                Fechar
              </button>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              {snippetsToolbar}
              <span className="text-[11px] text-zinc-500">Suporta GFM</span>
            </div>

            <div className="flex-1 grid gap-4 md:grid-cols-2 min-h-0 pt-3">
              <div className="flex flex-col min-h-0 rounded-md border border-zinc-800 bg-zinc-900/60">
                <Textarea
                  ref={textareaRef}
                  id={`${id}-fullscreen`}
                  value={value}
                  onChange={(e) => onChange(e.target.value)}
                  rows={rows}
                  className="font-mono text-sm leading-relaxed flex-1 min-h-0 resize-none bg-transparent"
                  placeholder={placeholder}
                />
              </div>
              <div className="min-h-0 overflow-y-auto rounded-md border border-zinc-800 bg-zinc-900/60 p-3">
                {previewNode}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-md border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-900/50 overflow-hidden">
        <button
          type="button"
          onClick={() => setShowHelp((v) => !v)}
          className="w-full flex items-center justify-between gap-2 px-3 py-2 text-left text-xs font-medium text-zinc-700 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
        >
          <span>Guia de formatação rápida</span>
          {showHelp ? (
            <ChevronUp className="h-3 w-3 shrink-0" />
          ) : (
            <ChevronDown className="h-3 w-3 shrink-0" />
          )}
        </button>

        {showHelp && (
          <div className="px-3 pb-3 pt-1 text-xs text-zinc-600 dark:text-zinc-500 space-y-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="grid gap-2">
              <p>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  Bloco de código:
                </strong>
                <br />
                Use 3 crases (
                <code className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5">
                  ```
                </code>
                ), a linguagem (ex: js), e feche com 3 crases.
              </p>
              <p>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  Callouts Especiais:
                </strong>
                <br />
                Inicie a linha com{' '}
                <code className="rounded bg-zinc-200 dark:bg-zinc-800 px-1 py-0.5">
                  &gt;
                </code>{' '}
                seguido da palavra-chave:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-1">
                <li>
                  <code className="text-blue-600 dark:text-blue-400">Nota</code>{' '}
                  para informações azuis.
                </li>
                <li>
                  <code className="text-amber-600 dark:text-amber-400">
                    Aviso
                  </code>{' '}
                  para alertas amarelos.
                </li>
                <li>
                  <code className="text-emerald-600 dark:text-emerald-400">
                    Sucesso
                  </code>{' '}
                  para o card verde escuro.
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
