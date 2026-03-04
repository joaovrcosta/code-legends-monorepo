'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

interface ArticleCodeHighlighterProps {
  code: string
  language: string
}

export function ArticleCodeHighlighter({
  code,
  language,
}: ArticleCodeHighlighterProps) {
  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      PreTag="div"
      customStyle={{
        margin: 0,
        padding: '0.75rem 0.9rem',
        background: 'transparent',
        fontSize: '0.75rem',
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

