'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import type { Challenge, ChallengeType } from '@/actions/lesson/list-lessons'
import { Plus, Trash2, ChevronDown, ChevronUp, Code, Bold, List, Info, Lightbulb } from 'lucide-react'

const EXPLANATION_SNIPPETS = [
  { label: 'Bloco de código', icon: Code, text: '```javascript\n// seu código aqui\n```' },
  { label: 'Negrito', icon: Bold, text: '**texto**' },
  { label: 'Lista', icon: List, text: '\n- item 1\n- item 2\n' },
  { label: 'Nota', icon: Info, text: '> **Nota**\n> \n' },
  { label: 'Dica', icon: Lightbulb, text: '> **Dica**\n> \n' },
] as const

export interface QuizEditorProps {
  challenges: Challenge[]
  onChange: (challenges: Challenge[]) => void
  variant?: 'default' | 'workspace'
  quizMode?: 'editor' | 'json'
  quizJson?: string
  onQuizJsonChange?: (json: string) => void
  onApplyJson?: () => boolean
  onReloadJsonFromEditor?: () => void
}

const challengeTypeLabels: Record<ChallengeType, string> = {
  prediction: 'Previsão (o que acontece no código?)',
  bug: 'Encontre o Bug',
  refactor: 'Refatoração',
  complete: 'Complete o Código',
  conceptual: 'Conceitual (sem código)',
  block_slots: 'Encaixar comandos',
  exam_mcq: 'Exame — múltipla escolha (one-shot, só na carreira)',
}

function challengeTitle(challenge: Challenge): string {
  const q = (challenge.question ?? '').trim()
  return q.length > 0 ? q : 'Sem pergunta'
}

function blockSlotsTextareasFromChallenge(ch: Challenge): {
  correct: string
  distr: string
} {
  const pieces = ch.pieces ?? []
  const sol = ch.solution ?? []
  const byId: Record<string, string> = Object.fromEntries(
    pieces.map((p) => [p.id, p.content]),
  )
  if (sol.length > 0) {
    const correct = sol
      .map((id) => byId[id])
      .filter((c) => c !== undefined)
      .join('\n')
    const inSol = new Set(sol)
    const distr = pieces
      .filter((p) => !inSol.has(p.id))
      .map((p) => p.content)
      .join('\n')
    return { correct, distr }
  }
  if (pieces.length > 0) {
    return { correct: pieces.map((p) => p.content).join('\n'), distr: '' }
  }
  return { correct: '', distr: '' }
}

function buildBlockSlotsChallenge(
  base: Challenge,
  correct: string,
  distr: string,
): Challenge {
  const correctLines = correct
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
  const distrLines = distr
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
  const cPieces = correctLines.map((content, i) => ({ id: `c${i}`, content }))
  const dPieces = distrLines.map((content, i) => ({ id: `d${i}`, content }))
  return {
    ...base,
    type: 'block_slots',
    pieces: [...cPieces, ...dPieces],
    solution: [...cPieces.map((p) => p.id), ...dPieces.map((p) => p.id)],
    correctAnswer: undefined,
    options: undefined,
  }
}

function emptyChallenge(): Challenge {
  return {
    type: 'prediction',
    question: '',
    code: '',
    language: 'tsx',
    options: ['', ''],
    correctAnswer: '',
    explanation: '',
    placeholder: '',
  }
}

function ChallengeFormFields({
  challenge,
  onChange,
}: {
  challenge: Challenge
  onChange: (c: Challenge) => void
}) {
  const explanationRef = useRef<HTMLTextAreaElement>(null)

  const insertExplanationSnippet = useCallback(
    (snippet: string) => {
      const textarea = explanationRef.current
      const value = challenge.explanation ?? ''
      if (!textarea) {
        onChange({ ...challenge, explanation: value + snippet })
        return
      }
      const start = textarea.selectionStart
      const end = textarea.selectionEnd
      const before = value.slice(0, start)
      const after = value.slice(end)
      const newValue = before + snippet + after
      onChange({ ...challenge, explanation: newValue })
      requestAnimationFrame(() => {
        textarea.focus()
        const newPos = start + snippet.length
        textarea.setSelectionRange(newPos, newPos)
      })
    },
    [challenge, onChange],
  )

  const hasOptions =
    challenge.type === 'prediction' ||
    challenge.type === 'conceptual' ||
    challenge.type === 'bug' ||
    challenge.type === 'exam_mcq'
  const isBlockSlots = challenge.type === 'block_slots'
  const blockSlotsText = isBlockSlots
    ? blockSlotsTextareasFromChallenge(challenge)
    : { correct: '', distr: '' }

  const setOption = (i: number, val: string) => {
    const opts = [...(challenge.options ?? [])]
    opts[i] = val
    onChange({ ...challenge, options: opts })
  }

  const addOption = () =>
    onChange({ ...challenge, options: [...(challenge.options ?? []), ''] })

  const removeOption = (i: number) => {
    const opts = (challenge.options ?? []).filter((_, idx) => idx !== i)
    onChange({ ...challenge, options: opts })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Pergunta *</Label>
        <Textarea
          value={challenge.question}
          onChange={(e) => onChange({ ...challenge, question: e.target.value })}
          rows={2}
          placeholder="O que será mostrado no console?"
        />
      </div>

      {challenge.type !== 'conceptual' && challenge.type !== 'exam_mcq' && (
        <div className="space-y-1.5">
          <Label>Código (opcional)</Label>
          <div className="flex gap-2">
            <Select
              value={challenge.language ?? 'tsx'}
              onChange={(e) => onChange({ ...challenge, language: e.target.value })}
              className="w-28"
            >
              <option value="tsx">TSX</option>
              <option value="jsx">JSX</option>
              <option value="ts">TypeScript</option>
              <option value="js">JavaScript</option>
              <option value="css">CSS</option>
              <option value="html">HTML</option>
              <option value="bash">Bash</option>
            </Select>
            <div className="flex-1" />
          </div>
          <Textarea
            value={challenge.code ?? ''}
            onChange={(e) => onChange({ ...challenge, code: e.target.value })}
            rows={6}
            placeholder="Cole o código aqui..."
            className="font-mono text-sm"
          />
        </div>
      )}

      {hasOptions && (
        <div className="space-y-1.5">
          <Label>Opções de resposta</Label>
          <div className="space-y-2">
            {(challenge.options ?? []).map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <span className="text-xs text-gray-500 w-6 text-center">
                  {String.fromCharCode(65 + i)}
                </span>
                <Input
                  value={opt}
                  onChange={(e) => setOption(i, e.target.value)}
                  placeholder={`Opção ${String.fromCharCode(65 + i)}`}
                  className="flex-1"
                />
                <button
                  type="button"
                  onClick={() => removeOption(i)}
                  className="text-red-400 hover:text-red-600 shrink-0"
                  title="Remover opção"
                  disabled={(challenge.options?.length ?? 0) <= 2}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addOption}
              className="gap-1"
            >
              <Plus size={12} /> Adicionar opção
            </Button>
          </div>
        </div>
      )}

      {challenge.type === 'complete' && (
        <div className="space-y-1.5">
          <Label>Placeholder do input</Label>
          <Input
            value={challenge.placeholder ?? ''}
            onChange={(e) => onChange({ ...challenge, placeholder: e.target.value })}
            placeholder="Escreva sua resposta..."
          />
        </div>
      )}

      {isBlockSlots && (
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>URL da imagem da missão (opcional)</Label>
            <Input
              value={challenge.missionImageUrl ?? ''}
              onChange={(e) =>
                onChange({ ...challenge, missionImageUrl: e.target.value })
              }
              placeholder="https://..."
            />
          </div>
          <div className="space-y-1.5">
            <Label>Comandos na ordem das ranhuras (um por linha)</Label>
            <Textarea
              value={blockSlotsText.correct}
              onChange={(e) =>
                onChange(
                  buildBlockSlotsChallenge(challenge, e.target.value, blockSlotsText.distr),
                )
              }
              rows={5}
              className="font-mono text-sm"
              placeholder={'turn left\ndrive forward'}
            />
          </div>
          <div className="space-y-1.5">
            <Label>Comandos distratórios (opcional)</Label>
            <Textarea
              value={blockSlotsText.distr}
              onChange={(e) =>
                onChange(
                  buildBlockSlotsChallenge(challenge, blockSlotsText.correct, e.target.value),
                )
              }
              rows={3}
              className="font-mono text-sm"
              placeholder={'turn right'}
            />
          </div>
        </div>
      )}

      {!isBlockSlots && (
        <div className="space-y-1.5">
          <Label>Resposta correta</Label>
          {hasOptions ? (
            <Select
              value={challenge.correctAnswer ?? ''}
              onChange={(e) =>
                onChange({ ...challenge, correctAnswer: e.target.value })
              }
            >
              <option value="">Selecione a resposta correta</option>
              {(challenge.options ?? []).map((opt, i) => (
                <option key={i} value={opt}>
                  {String.fromCharCode(65 + i)}: {opt}
                </option>
              ))}
            </Select>
          ) : (
            <Textarea
              value={challenge.correctAnswer ?? ''}
              onChange={(e) =>
                onChange({ ...challenge, correctAnswer: e.target.value })
              }
              rows={challenge.type === 'conceptual' ? 2 : 4}
              placeholder={
                challenge.type === 'refactor' || challenge.type === 'complete'
                  ? 'Código esperado como resposta...'
                  : 'Resposta correta...'
              }
              className={
                challenge.type !== 'conceptual' ? 'font-mono text-sm' : undefined
              }
            />
          )}
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Explicação (exibida após responder)</Label>
        <div className="flex flex-wrap gap-2 mb-1.5">
          {EXPLANATION_SNIPPETS.map(({ label, icon: Icon, text }) => (
            <Button
              key={label}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => insertExplanationSnippet(text)}
              className="gap-1.5 border-dashed text-xs"
              title={`Inserir ${label}`}
            >
              <Icon size={12} />
              {label}
            </Button>
          ))}
        </div>
        <Textarea
          ref={explanationRef}
          value={challenge.explanation ?? ''}
          onChange={(e) =>
            onChange({ ...challenge, explanation: e.target.value })
          }
          rows={3}
          placeholder="Explique o motivo da resposta correta (Markdown suportado)..."
        />
      </div>
    </div>
  )
}

function ChallengeFormPanel({
  challenge,
  index,
  onChange,
  onRemove,
}: {
  challenge: Challenge
  index: number
  onChange: (c: Challenge) => void
  onRemove: () => void
}) {
  return (
    <div className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-gray-100 px-4 py-3 dark:border-gray-700">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1 space-y-1.5">
            <Label className="sr-only">Tipo do desafio</Label>
            <Select
              value={challenge.type}
              onChange={(e) =>
                onChange({ ...challenge, type: e.target.value as ChallengeType })
              }
            >
              {(Object.keys(challengeTypeLabels) as ChallengeType[]).map((t) => (
                <option key={t} value={t}>
                  {challengeTypeLabels[t]}
                </option>
              ))}
            </Select>
          </div>
        </div>
        <button
          type="button"
          onClick={onRemove}
          className="shrink-0 p-1.5 text-red-500 transition-colors hover:text-red-700"
          title="Remover desafio"
        >
          <Trash2 size={16} />
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <ChallengeFormFields challenge={challenge} onChange={onChange} />
      </div>
    </div>
  )
}

function ChallengeItem({
  challenge,
  index,
  onChange,
  onRemove,
  collapsed,
  onToggleCollapsed,
}: {
  challenge: Challenge
  index: number
  onChange: (c: Challenge) => void
  onRemove: () => void
  collapsed: boolean
  onToggleCollapsed: () => void
}) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
      <div
        className="flex cursor-pointer select-none items-center justify-between px-4 py-3"
        onClick={onToggleCollapsed}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700 dark:bg-blue-900 dark:text-blue-300">
            {index + 1}
          </span>
          <span className="max-w-xs truncate text-sm font-medium text-gray-700 dark:text-gray-200">
            {challengeTypeLabels[challenge.type]}{' '}
            {challenge.question &&
              `— ${challenge.question.slice(0, 40)}${challenge.question.length > 40 ? '…' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 text-red-500 transition-colors hover:text-red-700"
            title="Remover desafio"
          >
            <Trash2 size={14} />
          </button>
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4 border-t border-gray-100 px-4 pb-4 pt-4 dark:border-gray-700">
          <div className="space-y-1.5">
            <Label>Tipo do desafio</Label>
            <Select
              value={challenge.type}
              onChange={(e) =>
                onChange({ ...challenge, type: e.target.value as ChallengeType })
              }
            >
              {(Object.keys(challengeTypeLabels) as ChallengeType[]).map((t) => (
                <option key={t} value={t}>
                  {challengeTypeLabels[t]}
                </option>
              ))}
            </Select>
          </div>
          <ChallengeFormFields challenge={challenge} onChange={onChange} />
        </div>
      )}
    </div>
  )
}

function QuestionListItem({
  challenge,
  index,
  isSelected,
  onSelect,
  onRemove,
}: {
  challenge: Challenge
  index: number
  isSelected: boolean
  onSelect: () => void
  onRemove: () => void
}) {
  const title = challengeTitle(challenge)

  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onSelect()
        }
      }}
      className={[
        'w-full cursor-pointer rounded-lg border px-3 py-2 text-left transition-colors',
        isSelected
          ? 'border-blue-500/50 bg-blue-50 dark:bg-blue-950/30'
          : 'border-transparent hover:border-gray-200 hover:bg-gray-50 dark:hover:border-gray-700 dark:hover:bg-gray-900/30',
      ].join(' ')}
      title={title}
      role="button"
      tabIndex={0}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span
            className={[
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-bold',
              isSelected
                ? 'border-blue-500 text-blue-700 dark:text-blue-300'
                : 'border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300',
            ].join(' ')}
          >
            {index + 1}
          </span>
          <div className="min-w-0">
            <p className="truncate text-xs text-gray-500 dark:text-gray-400">
              {challengeTypeLabels[challenge.type]}
            </p>
            <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-200">
              {title}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onRemove()
          }}
          className="shrink-0 p-1 text-red-500 transition-colors hover:text-red-700"
          title="Remover desafio"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}

function QuizJsonEditor({
  quizJson,
  onQuizJsonChange,
  onApplyJson,
  onReloadFromEditor,
  fillHeight,
}: {
  quizJson: string
  onQuizJsonChange?: (json: string) => void
  onApplyJson?: () => boolean
  onReloadFromEditor?: () => void
  fillHeight?: boolean
}) {
  return (
    <div
      className={
        fillHeight
          ? 'flex h-full min-h-0 flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800'
          : 'space-y-2'
      }
    >
      <Textarea
        value={quizJson}
        onChange={(e) => onQuizJsonChange?.(e.target.value)}
        rows={fillHeight ? undefined : 14}
        className={
          fillHeight
            ? 'min-h-0 flex-1 font-mono text-xs'
            : 'font-mono text-xs'
        }
        placeholder='[{"type":"block_slots","question":"...","pieces":[{"id":"p0","content":"..."}],"solution":["p0"]}]'
      />
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="default"
          onClick={() => onApplyJson?.()}
        >
          Aplicar JSON
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={onReloadFromEditor}
        >
          Recarregar do editor
        </Button>
      </div>
    </div>
  )
}

function QuizWorkspaceEditor({
  challenges,
  onChange,
  quizMode = 'editor',
  quizJson = '',
  onQuizJsonChange,
  onApplyJson,
  onReloadFromEditor,
}: {
  challenges: Challenge[]
  onChange: (challenges: Challenge[]) => void
  quizMode?: 'editor' | 'json'
  quizJson?: string
  onQuizJsonChange?: (json: string) => void
  onApplyJson?: () => boolean
  onReloadFromEditor?: () => void
}) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  useEffect(() => {
    if (selectedIndex >= challenges.length) {
      setSelectedIndex(Math.max(0, challenges.length - 1))
    }
  }, [challenges.length, selectedIndex])

  const addChallenge = () => {
    const next = [...challenges, emptyChallenge()]
    onChange(next)
    setSelectedIndex(next.length - 1)
  }

  const updateChallenge = (i: number, c: Challenge) => {
    const updated = [...challenges]
    updated[i] = c
    onChange(updated)
  }

  const removeChallenge = (i: number) => {
    onChange(challenges.filter((_, idx) => idx !== i))
    if (selectedIndex >= i && selectedIndex > 0) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  if (quizMode === 'json') {
    return (
      <QuizJsonEditor
        quizJson={quizJson}
        onQuizJsonChange={onQuizJsonChange}
        onApplyJson={() => {
          const ok = onApplyJson?.() ?? false
          return ok
        }}
        onReloadFromEditor={onReloadFromEditor}
        fillHeight
      />
    )
  }

  return (
    <div className="grid h-full min-h-0 grid-cols-[280px_1fr] overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">
      <aside className="flex min-h-0 flex-col overflow-hidden border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex shrink-0 items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
            Perguntas ({challenges.length})
          </p>
          {challenges.length > 0 && (
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {selectedIndex + 1}/{challenges.length}
            </p>
          )}
        </div>
        <div className="min-h-0 flex-1 space-y-1 overflow-y-auto p-2">
          {challenges.length === 0 ? (
            <p className="px-2 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
              Nenhuma pergunta cadastrada.
            </p>
          ) : (
            challenges.map((c, i) => (
              <QuestionListItem
                key={i}
                challenge={c}
                index={i}
                isSelected={i === selectedIndex}
                onSelect={() => setSelectedIndex(i)}
                onRemove={() => removeChallenge(i)}
              />
            ))
          )}
        </div>
        <div className="shrink-0 border-t border-gray-100 p-2 dark:border-gray-700">
          <Button
            type="button"
            size="sm"
            onClick={addChallenge}
            className="w-full gap-1.5"
          >
            <Plus size={14} /> Adicionar desafio
          </Button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-col overflow-hidden bg-gray-50 p-4 dark:bg-gray-900/40">
        {challenges.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 px-6 py-12 text-center dark:border-gray-600">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Selecione ou adicione um desafio para começar a editar.
            </p>
            <Button
              type="button"
              size="sm"
              onClick={addChallenge}
              className="mt-4 gap-1.5"
            >
              <Plus size={14} /> Adicionar desafio
            </Button>
          </div>
        ) : (
          <ChallengeFormPanel
            key={selectedIndex}
            index={selectedIndex}
            challenge={challenges[selectedIndex]!}
            onChange={(updated) => updateChallenge(selectedIndex, updated)}
            onRemove={() => removeChallenge(selectedIndex)}
          />
        )}
      </div>
    </div>
  )
}

export function QuizEditor({
  challenges,
  onChange,
  variant = 'default',
  quizMode = 'editor',
  quizJson = '',
  onQuizJsonChange,
  onApplyJson,
  onReloadJsonFromEditor,
}: QuizEditorProps) {
  if (variant === 'workspace') {
    return (
      <QuizWorkspaceEditor
        challenges={challenges}
        onChange={onChange}
        quizMode={quizMode}
        quizJson={quizJson}
        onQuizJsonChange={onQuizJsonChange}
        onApplyJson={onApplyJson}
        onReloadFromEditor={onReloadJsonFromEditor}
      />
    )
  }

  const addChallenge = () => onChange([...challenges, emptyChallenge()])
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [collapsedByIndex, setCollapsedByIndex] = useState<Record<number, boolean>>({})

  useEffect(() => {
    if (selectedIndex >= challenges.length) {
      setSelectedIndex(Math.max(0, challenges.length - 1))
    }
  }, [challenges.length, selectedIndex])

  useEffect(() => {
    setCollapsedByIndex((prev) => {
      if (challenges.length === 0) return {}
      const next = { ...prev }
      if (next[selectedIndex] === undefined) next[selectedIndex] = false
      return next
    })
  }, [selectedIndex, challenges.length])

  const updateChallenge = (i: number, c: Challenge) => {
    const updated = [...challenges]
    updated[i] = c
    onChange(updated)
  }

  const removeChallenge = (i: number) =>
    onChange(challenges.filter((_, idx) => idx !== i))

  if (quizMode === 'json') {
    return (
      <div className="space-y-4">
        <QuizJsonEditor
          quizJson={quizJson}
          onQuizJsonChange={onQuizJsonChange}
          onApplyJson={onApplyJson}
          onReloadFromEditor={onReloadJsonFromEditor}
        />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Desafios ({challenges.length})
          </p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            Edite um desafio por vez, como no layout do Content Hub.
          </p>
        </div>
        <Button type="button" size="sm" onClick={addChallenge} className="gap-1.5">
          <Plus size={14} /> Adicionar desafio
        </Button>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 py-10 text-center dark:border-gray-600">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum desafio cadastrado. Clique em &quot;Adicionar desafio&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
          <aside className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3 dark:border-gray-700">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-600 dark:text-gray-300">
                Perguntas
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedIndex + 1}/{challenges.length}
              </p>
            </div>
            <div className="max-h-[520px] space-y-1 overflow-y-auto p-2">
              {challenges.map((c, i) => (
                <QuestionListItem
                  key={i}
                  challenge={c}
                  index={i}
                  isSelected={i === selectedIndex}
                  onSelect={() => setSelectedIndex(i)}
                  onRemove={() => removeChallenge(i)}
                />
              ))}
            </div>
          </aside>

          <div className="min-w-0">
            <ChallengeItem
              key={selectedIndex}
              index={selectedIndex}
              challenge={challenges[selectedIndex]!}
              onChange={(updated) => updateChallenge(selectedIndex, updated)}
              onRemove={() => removeChallenge(selectedIndex)}
              collapsed={collapsedByIndex[selectedIndex] ?? false}
              onToggleCollapsed={() =>
                setCollapsedByIndex((prev) => ({
                  ...prev,
                  [selectedIndex]: !(prev[selectedIndex] ?? false),
                }))
              }
            />
          </div>
        </div>
      )}
    </div>
  )
}
