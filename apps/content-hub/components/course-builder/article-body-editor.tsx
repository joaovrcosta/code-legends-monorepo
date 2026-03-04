'use client'

import { useRef, useCallback, useState } from 'react'
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
} from 'lucide-react'

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

interface ArticleBodyEditorProps {
  id: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  rows?: number
}

export function ArticleBodyEditor({
  id,
  value,
  onChange,
  placeholder = 'Escreva o conteúdo em Markdown...',
  rows = 12,
}: ArticleBodyEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const [showHelp, setShowHelp] = useState(false)

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

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label htmlFor={id}>Conteúdo do artigo (Markdown)</Label>
        <span className="text-xs text-muted-foreground">Suporta GFM</span>
      </div>

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

      <Textarea
        ref={textareaRef}
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        className="font-mono text-sm leading-relaxed"
        placeholder={placeholder}
      />

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
