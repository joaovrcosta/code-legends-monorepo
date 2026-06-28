'use client'

import React, { useRef, useCallback, useState, useEffect } from 'react'
import type { ComponentProps, ReactNode } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import dynamic from 'next/dynamic'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
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
  Target,
  Plus,
  Trash2,
  X,
} from 'lucide-react'
import type { Challenge, ChallengeType } from '@/actions/lesson/list-lessons'
import {
  CHALLENGE_TYPE_LABELS,
  CHALLENGE_TYPES,
  buildBlockSlotsFromLines,
  normalizeChallengeType,
} from '@code-legends/challenges'
import { getEditorMeta } from '@code-legends/challenges/editor'
import type { RichTextEditorRef } from './rich-text-editor'

const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then((m) => m.RichTextEditor),
  { ssr: false },
)

const ArticleCodeHighlighter = dynamic(
  () =>
    import('./article-code-highlighter').then((m) => m.ArticleCodeHighlighter),
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
  {
    label: 'Desafio (pergunta com código)',
    icon: Target,
    text: `\`\`\`challenge
{
  "type": "prediction",
  "question": "O que será mostrado no console? (edite a pergunta)",
  "code": "const x = 1\\nconsole.log(x)",
  "language": "javascript",
  "options": ["1", "undefined", "erro", "nada"],
  "correctAnswer": "1",
  "explanation": "O valor de x é 1, então o console mostra 1."
}
\`\`\``,
  },
  {
    label: 'Desafio (só pergunta, sem código)',
    icon: Target,
    text: `\`\`\`challenge
{
  "type": "conceptual",
  "question": "Qual a diferença entre props e state no React? (edite a pergunta)",
  "options": ["Props vêm de fora, state é interno", "São a mesma coisa", "State não existe", "Props mudam, state não"],
  "correctAnswer": "Props vêm de fora, state é interno",
  "explanation": "Props são passadas pelo componente pai; state é gerenciado dentro do componente."
}
\`\`\``,
  },
  {
    label: 'Desafio Encaixar comandos (ranhuras)',
    icon: Target,
    text: `\`\`\`challenge
{
  "type": "block_slots",
  "question": "Toque nos blocos para preencher o programa (2 passos).",
  "missionImageUrl": "",
  "pieces": [
    { "id": "c0", "content": "turn left" },
    { "id": "c1", "content": "drive forward" },
    { "id": "d0", "content": "turn right" }
  ],
  "solution": ["c0", "c1", "d0"],
  "explanation": "Primeiro vire à esquerda, depois avance; o outro comando é distrator."
}
\`\`\``,
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

interface PreviewChallenge {
  type?: string
  question?: string
  code?: string
  language?: string
  options?: string[]
  correctAnswer?: string
  explanation?: string
  pieces?: { id: string; content: string }[]
  solution?: string[]
  missionImageUrl?: string
}

const LANGUAGES = [
  'javascript',
  'typescript',
  'tsx',
  'jsx',
  'python',
  'html',
  'css',
  'json',
  'text',
]

function PreviewChallengeBlock({ challenge }: { challenge: PreviewChallenge }) {
  const normalizedType =
    normalizeChallengeType(String(challenge.type ?? '')) ?? challenge.type
  const typeLabel =
    (normalizedType && CHALLENGE_TYPE_LABELS[normalizedType as ChallengeType]) ??
    challenge.type ??
    'Desafio'
  const hasOptions =
    Array.isArray(challenge.options) && challenge.options.length > 0
  const isBlockSlots =
    normalizedType === 'block_slots' || challenge.type === 'parsons'
  const byId = Object.fromEntries(
    (challenge.pieces ?? []).map((p) => [p.id, p.content]),
  )
  const orderedSlotLines =
    isBlockSlots && Array.isArray(challenge.solution)
      ? challenge.solution.map((id) => byId[id]).filter(Boolean)
      : []

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900/80 text-sm text-zinc-100">
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-700 px-3 py-2">
        <span className="rounded-md bg-zinc-700 px-2 py-0.5 text-[11px] font-medium text-zinc-200">
          {typeLabel}
        </span>
      </div>
      <div className="space-y-3 p-3">
        {challenge.question && (
          <p className="font-medium text-zinc-100">{challenge.question}</p>
        )}
        {isBlockSlots && challenge.missionImageUrl?.trim() && (
          <p className="text-xs text-zinc-500">Imagem da missão: URL definida</p>
        )}
        {challenge.code && (
          <div className="rounded-md bg-zinc-950 text-xs">
            <ArticleCodeHighlighter
              code={challenge.code}
              language={challenge.language ?? 'text'}
            />
          </div>
        )}
        {hasOptions && (
          <p className="text-xs text-zinc-400">
            Opções:{' '}
            {(challenge.options ?? []).map((o, i) => (
              <span key={i}>
                {i > 0 && ', '}
                <span className="text-zinc-300">{o}</span>
              </span>
            ))}
          </p>
        )}
        {isBlockSlots && orderedSlotLines.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs text-zinc-400">Comandos (ordem das ranhuras):</p>
            <div className="grid gap-1">
              {orderedSlotLines.map((line, i) => (
                <div
                  key={i}
                  className="rounded border border-zinc-800 bg-zinc-950 px-2 py-1 font-mono text-xs text-zinc-200"
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        )}
        {challenge.explanation && (
          <p className="border-t border-zinc-700 pt-2 text-xs text-zinc-500">
            Explicação: {challenge.explanation}
          </p>
        )}
      </div>
    </div>
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

  if (language === 'challenge') {
    try {
      const challenge = JSON.parse(text) as PreviewChallenge
      return <PreviewChallengeBlock challenge={challenge} />
    } catch {
      return (
        <div className="my-3 rounded-md border border-red-500/40 bg-red-950/30 px-3 py-2 text-sm text-red-400">
          Desafio inválido (JSON malformado).
        </div>
      )
    }
  }

  return (
    <div className="my-3 overflow-hidden rounded-md bg-zinc-900 text-xs leading-relaxed text-zinc-100">
      <ArticleCodeHighlighter code={text} language={language} />
    </div>
  )
}

function buildChallengeBlock(challenge: Challenge): string {
  const obj: Record<string, unknown> = {
    type: challenge.type,
    question: challenge.question,
  }
  if (challenge.code != null && challenge.code.trim() !== '') {
    obj.code = challenge.code.trim()
    obj.language = challenge.language ?? 'javascript'
  }
  if (
    Array.isArray(challenge.options) &&
    challenge.options.some((o) => o != null && String(o).trim() !== '')
  ) {
    obj.options = challenge.options.map((o) => String(o).trim()).filter(Boolean)
  }
  if (challenge.correctAnswer != null && String(challenge.correctAnswer).trim() !== '') {
    obj.correctAnswer = String(challenge.correctAnswer).trim()
  }
  if (challenge.explanation != null && String(challenge.explanation).trim() !== '') {
    obj.explanation = String(challenge.explanation).trim()
  }
  if (challenge.placeholder != null && String(challenge.placeholder).trim() !== '') {
    obj.placeholder = String(challenge.placeholder).trim()
  }
  if (
    challenge.type === 'block_slots' &&
    Array.isArray(challenge.pieces) &&
    challenge.pieces.length > 0
  ) {
    obj.pieces = challenge.pieces
    obj.solution =
      Array.isArray(challenge.solution) && challenge.solution.length > 0
        ? challenge.solution
        : challenge.pieces.map((p) => p.id)
    if (challenge.missionImageUrl?.trim()) {
      obj.missionImageUrl = challenge.missionImageUrl.trim()
    }
  }
  const json = JSON.stringify(obj, null, 2)
  return '```challenge\n' + json + '\n```'
}

interface InsertChallengeModalProps {
  open: boolean
  onClose: () => void
  onInsert: (block: string) => void
}

function InsertChallengeModal({
  open,
  onClose,
  onInsert,
}: InsertChallengeModalProps) {
  const [challengeType, setChallengeType] = useState<ChallengeType>('prediction')
  const [question, setQuestion] = useState('')
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [options, setOptions] = useState<string[]>(['', ''])
  const [correctAnswer, setCorrectAnswer] = useState('')
  const [explanation, setExplanation] = useState('')
  const [blockSlotsCorrect, setBlockSlotsCorrect] = useState('')
  const [blockSlotsDistractors, setBlockSlotsDistractors] = useState('')
  const [missionImageUrl, setMissionImageUrl] = useState('')
  const [shuffleOptions, setShuffleOptions] = useState(false)

  const editorMeta = getEditorMeta(challengeType)
  const isBlockSlots = editorMeta.isBlockSlots
  const hasOptions = editorMeta.hasOptions
  const showCode = editorMeta.showCode

  const addOption = () => setOptions((o) => [...o, ''])
  const removeOption = (i: number) =>
    setOptions((o) => o.filter((_, idx) => idx !== i))
  const setOption = (i: number, val: string) =>
    setOptions((o) => {
      const next = [...o]
      next[i] = val
      return next
    })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const challenge: Challenge = {
      type: challengeType,
      question: question.trim(),
      explanation: explanation.trim() || undefined,
    }
    if (isBlockSlots) {
      const correctLines = blockSlotsCorrect
        .split('\n')
        .map((l) => l.replace(/\r$/, ''))
        .filter((l) => l.trim().length > 0)
      if (correctLines.length < 1) return
      const { pieces, solution } = buildBlockSlotsFromLines(
        blockSlotsCorrect,
        blockSlotsDistractors,
      )
      challenge.pieces = pieces
      challenge.solution = solution
      if (missionImageUrl.trim()) {
        challenge.missionImageUrl = missionImageUrl.trim()
      }
    }
    if (showCode && code.trim()) {
      challenge.code = code.trim()
      challenge.language = language
    }
    if (hasOptions && options.some((o) => o.trim())) {
      challenge.options = options.map((o) => o.trim()).filter(Boolean)
      if (correctAnswer.trim()) challenge.correctAnswer = correctAnswer.trim()
      if (shuffleOptions) challenge.shuffleOptions = true
    } else if (!isBlockSlots && correctAnswer.trim()) {
      challenge.correctAnswer = correctAnswer.trim()
    }
    const block = buildChallengeBlock(challenge)
    onInsert(block)
    onClose()
    setQuestion('')
    setCode('')
    setOptions(['', ''])
    setCorrectAnswer('')
    setExplanation('')
    setBlockSlotsCorrect('')
    setBlockSlotsDistractors('')
    setMissionImageUrl('')
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
        aria-hidden
      />
      <Card className="relative z-10 w-full max-w-lg max-h-[90vh] overflow-hidden flex flex-col">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <h3 className="text-lg font-semibold">Inserir desafio</h3>
          <Button type="button" variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        <CardContent className="overflow-y-auto flex-1">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Tipo de desafio</Label>
              <Select
                value={challengeType}
                onChange={(e) =>
                  setChallengeType(e.target.value as ChallengeType)
                }
              >
                {CHALLENGE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {CHALLENGE_TYPE_LABELS[t]}
                  </option>
                ))}
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Pergunta *</Label>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                required
                placeholder="Ex.: O que será mostrado no console?"
              />
            </div>

            {showCode && (
              <>
                <div className="space-y-2">
                  <Label>Código (opcional)</Label>
                  <Textarea
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    rows={4}
                    className="font-mono text-sm"
                    placeholder="const x = 1&#10;console.log(x)"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Linguagem</Label>
                  <Select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value)}
                  >
                    {LANGUAGES.map((lang) => (
                      <option key={lang} value={lang}>
                        {lang}
                      </option>
                    ))}
                  </Select>
                </div>
              </>
            )}

            {hasOptions && (
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <Label>Opções (mín. 2)</Label>
                  <label className="flex cursor-pointer items-center gap-2 text-sm text-ch-muted">
                    <input
                      type="checkbox"
                      checked={shuffleOptions}
                      onChange={(e) => setShuffleOptions(e.target.checked)}
                      className="h-4 w-4 rounded border-ch-border text-ch-accent focus:ring-ch-accent"
                    />
                    Embaralhar opções para o aluno
                  </label>
                </div>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      value={opt}
                      onChange={(e) => setOption(i, e.target.value)}
                      placeholder={`Opção ${i + 1}`}
                    />
                    {options.length > 2 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeOption(i)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addOption}
                  className="gap-1"
                >
                  <Plus className="h-4 w-4" />
                  Adicionar opção
                </Button>
              </div>
            )}

            {isBlockSlots && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <Label>URL da imagem da missão (opcional)</Label>
                  <Input
                    value={missionImageUrl}
                    onChange={(e) => setMissionImageUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comandos na ordem das ranhuras (um por linha) *</Label>
                  <Textarea
                    value={blockSlotsCorrect}
                    onChange={(e) => setBlockSlotsCorrect(e.target.value)}
                    rows={5}
                    required
                    className="font-mono text-sm"
                    placeholder={'turn left\ndrive forward'}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Comandos distratórios (opcional)</Label>
                  <Textarea
                    value={blockSlotsDistractors}
                    onChange={(e) => setBlockSlotsDistractors(e.target.value)}
                    rows={3}
                    className="font-mono text-sm"
                    placeholder={'turn right'}
                  />
                </div>
              </div>
            )}

            {!isBlockSlots && (
            <div className="space-y-2">
              <Label>Resposta correta</Label>
              <Input
                value={correctAnswer}
                onChange={(e) => setCorrectAnswer(e.target.value)}
                placeholder={
                  hasOptions
                    ? 'Digite ou escolha uma das opções acima'
                    : 'Resposta esperada'
                }
              />
            </div>
            )}

            <div className="space-y-2">
              <Label>Explicação (Markdown)</Label>
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={3}
                placeholder="Por que a resposta está correta..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancelar
              </Button>
              <Button type="submit">Inserir no artigo</Button>
            </div>
          </form>
        </CardContent>
      </Card>
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
  /** Se definido, Ctrl+Enter (ou Cmd+Enter) no editor dispara este callback (ex.: salvar sem fechar o modal). */
  onSaveRequested?: () => void
}

const ARTICLE_PLACEHOLDER =
  'Ex.: # Título do artigo\n\nParágrafo de abertura...\n\nUse os botões acima para inserir código, callouts e desafios.'

export function ArticleBodyEditor({
  id,
  value,
  onChange,
  placeholder,
  rows = 12,
  isArticle = false,
  onSaveRequested,
}: ArticleBodyEditorProps) {
  const effectivePlaceholder =
    placeholder ??
    (isArticle ? ARTICLE_PLACEHOLDER : 'Escreva o conteúdo em Markdown...')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const richTextRef = useRef<RichTextEditorRef>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false) // Note: isExpanded might not be used anymore if we remove fullscreen mode, but we can keep the state to avoid errors
  const [insertChallengeOpen, setInsertChallengeOpen] = useState(false)
  const [previewValue, setPreviewValue] = useState(value)

  useEffect(() => {
    const t = setTimeout(() => setPreviewValue(value), 300)
    return () => clearTimeout(t)
  }, [value])

  const insertAtCursor = useCallback(
    (snippet: string) => {
      if (isArticle && richTextRef.current) {
        richTextRef.current.insertMarkdown(snippet)
        return
      }

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
    <div className="rounded-md border border-zinc-200 bg-ch-surface p-3 text-sm shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
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
          {previewValue}
        </ReactMarkdown>
      </div>
    </div>
  ) : null

  const handleInsertChallenge = useCallback(
    (block: string) => {
      insertAtCursor(block)
      setInsertChallengeOpen(false)
      requestAnimationFrame(() => {
        if (isArticle && richTextRef.current) {
          // BlockNote maintains focus generally
        } else {
          textareaRef.current?.focus()
        }
      })
    },
    [insertAtCursor, isArticle],
  )

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        onSaveRequested?.()
      }
    },
    [onSaveRequested],
  )

  const snippetsToolbar = (
    <div className="flex flex-wrap gap-2">
      {isArticle && (
        <Button
          type="button"
          variant="default"
          size="sm"
          onClick={() => setInsertChallengeOpen(true)}
          className="gap-2"
          title="Abrir formulário para inserir desafio sem editar JSON"
        >
          <Target className="h-4 w-4" />
          Inserir desafio
        </Button>
      )}
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
      <InsertChallengeModal
        open={insertChallengeOpen}
        onClose={() => setInsertChallengeOpen(false)}
        onInsert={handleInsertChallenge}
      />
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
                Editor Visual (Block Editor)
              </span>
              <span className="text-[11px] text-zinc-500">
                Digite '/' para acessar menus avançados ou arraste os blocos.
              </span>
            </div>
            {/* The maximize/minimize logic for the WYSIWYG editor could go here, but omitted for simplicity. */}
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
            {snippetsToolbar}
          </div>

          <div className="pt-2">
            <RichTextEditor 
              ref={richTextRef} 
              initialMarkdown={value} 
              onChange={onChange} 
              className="min-h-[400px]" 
            />
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
            onKeyDown={handleKeyDown}
            rows={rows}
            className="font-mono text-sm leading-relaxed"
            placeholder={effectivePlaceholder}
          />
          {previewNode}
        </>
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
                  <code className="text-ch-accent">Nota</code>{' '}
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
              <p>
                <strong className="text-zinc-900 dark:text-zinc-200">
                  Desafio (quiz no artigo):
                </strong>
                <br />
                Use o botão <strong>Inserir desafio</strong> para preencher
                pergunta, opções e explicação em um formulário — o JSON é
                gerado automaticamente. Ou use os snippets{' '}
                <strong>Desafio (pergunta com código)</strong> /{' '}
                <strong>Desafio (só pergunta, sem código)</strong> e edite os
                textos entre aspas no bloco, se preferir.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
