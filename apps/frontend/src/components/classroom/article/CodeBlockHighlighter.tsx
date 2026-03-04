'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface CodeBlockHighlighterProps {
  code: string
  language: string
}

export function CodeBlockHighlighter({
  code,
  language,
}: CodeBlockHighlighterProps) {
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
        style: {
          fontFamily:
            '"Space Mono", ui-monospace, SFMono-Regular, Menlo, monospace',
        },
      }}
      showLineNumbers={false}
      wrapLongLines
    >
      {code}
    </SyntaxHighlighter>
  )
}
