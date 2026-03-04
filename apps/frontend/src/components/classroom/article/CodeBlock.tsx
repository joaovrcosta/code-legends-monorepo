'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import type { ComponentProps } from 'react'
import { Check, Copy } from 'lucide-react'

const CodeBlockHighlighter = dynamic(
  () => import('./CodeBlockHighlighter').then((m) => m.CodeBlockHighlighter),
  { ssr: false },
)

function getLanguageFromClassName(className?: string | null): string {
  if (!className) return 'text'
  const match = className.match(/language-(\w+)/)
  return match ? match[1] : 'text'
}

function getCodeString(children: React.ReactNode): string {
  if (typeof children === 'string') return children
  return Array.isArray(children)
    ? children.map((c) => (typeof c === 'string' ? c : '')).join('')
    : String(children ?? '')
}

function trimWrappingBackticks(raw: string): string {
  let s = raw.trim()
  s = s.replace(/\\`/g, '`')
  s = s.replace(/^`+[\r\n]*/, '')
  s = s.replace(/[\r\n]*`+$/, '')

  return s.trim()
}

interface InlineCodeProps extends ComponentProps<'code'> {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

export function InlineCode({ inline, children, ...props }: InlineCodeProps) {
  if (inline === false) {
    return (
      <code {...props} className={props.className}>
        {children}
      </code>
    )
  }

  return (
    <code
      className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-sm text-white/90"
      {...props}
    >
      {children}
    </code>
  )
}

interface CodeBlockPreProps extends ComponentProps<'pre'> {
  children?: React.ReactNode
}

function isReactElement(node: React.ReactNode): node is React.ReactElement<{
  className?: string
  children?: React.ReactNode
}> {
  return !!node && typeof node === 'object' && 'props' in node
}

export function CodeBlockPre({ children }: CodeBlockPreProps) {
  const codeEl = useMemo(() => {
    if (Array.isArray(children)) return children[0]
    return children
  }, [children])

  const className = isReactElement(codeEl) ? codeEl.props.className : undefined
  const codeChildren = isReactElement(codeEl) ? codeEl.props.children : children

  const code = trimWrappingBackticks(getCodeString(codeChildren))
  const language = getLanguageFromClassName(className)

  const [copied, setCopied] = useState(false)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const handleCopy = useCallback(() => {
    if (!code) return
    navigator.clipboard.writeText(code).then(
      () => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      },
      () => {},
    )
  }, [code])

  return (
    <div
      className="group relative my-4 overflow-hidden rounded-[20px] border border-[#25252A] bg-[#0d0d0f]"
      role="region"
      aria-label="Bloco de código"
    >
      <div className="flex items-center justify-end border-b border-[#25252A] bg-[#121214] px-3 py-2">
        <button
          type="button"
          onClick={handleCopy}
          disabled={!code}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-[#a1a1aa] transition-colors hover:bg-white/5 hover:text-white focus:outline-none focus:ring-2 focus:ring-[#00C8FF] focus:ring-offset-2 focus:ring-offset-[#0d0d0f] disabled:opacity-50"
          aria-label={copied ? 'Copiado' : 'Copiar código'}
        >
          {copied ? (
            <>
              <Check size={14} />
              Copiado
            </>
          ) : (
            <>
              <Copy size={14} />
              Copiar
            </>
          )}
        </button>
      </div>
      {mounted ? (
        <div className="not-prose">
          <CodeBlockHighlighter code={code} language={language} />
        </div>
      ) : (
        <pre className="overflow-x-auto p-4 text-sm leading-relaxed">
          <code className="font-mono text-white/90">{code}</code>
        </pre>
      )}
    </div>
  )
}
