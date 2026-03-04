'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockHighlighterProps {
  code: string
  language: string
}

/**
 * Carregado apenas no client (via dynamic import com ssr: false)
 * para evitar erro de módulo refractor no build/SSR do Next.
 */
export function CodeBlockHighlighter({ code, language }: CodeBlockHighlighterProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      PreTag="div"
      customStyle={{
        margin: 0,
        padding: '1rem 1.25rem',
        background: 'transparent',
        fontSize: '0.875rem',
        lineHeight: 1.6,
      }}
      codeTagProps={{
        style: { fontFamily: 'ui-monospace, monospace' },
      }}
      showLineNumbers={false}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  )
}
