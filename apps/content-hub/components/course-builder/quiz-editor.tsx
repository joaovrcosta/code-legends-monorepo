'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import type { Challenge, ChallengeType } from '@/actions/lesson/list-lessons'
import { Plus, Trash2, ChevronDown, ChevronUp, Code, Bold, List, Info, Lightbulb } from 'lucide-react'
import { EditorList } from '@/components/editor/editor-list'
import { EditorListItem } from '@/components/editor/editor-list-item'
import { EditorPanel, EditorPanelCard, EditorIndexBadge } from '@/components/editor/editor-panel'
import { EditorEmptyState } from '@/components/editor/editor-empty-state'
import { ch } from '@/lib/ui-classes'
import { cn } from '@/lib/utils'

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
                <span className="text-xs text-ch-muted w-6 text-center">
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
    <EditorPanelCard
      header={
        <>
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <EditorIndexBadge index={index} />
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
            className="shrink-0 p-1.5 text-ch-destructive transition-colors hover:text-ch-destructive-hover"
            title="Remover desafio"
          >
            <Trash2 size={16} />
          </button>
        </>
      }
    >
      <ChallengeFormFields challenge={challenge} onChange={onChange} />
    </EditorPanelCard>
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
    <div className={cn(ch.surface, "overflow-hidden")}>
      <div
        className="flex cursor-pointer select-none items-center justify-between px-4 py-3"
        onClick={onToggleCollapsed}
      >
        <div className="flex items-center gap-3">
          <EditorIndexBadge index={index} />
          <span className="max-w-xs truncate text-sm font-medium text-ch">
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
            className="p-1 text-ch-destructive transition-colors hover:text-ch-destructive-hover"
            title="Remover desafio"
          >
            <Trash2 size={14} />
          </button>
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {!collapsed && (
        <div className="space-y-4 border-t border-ch-border px-4 pb-4 pt-4">
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
  return (
    <EditorListItem
      index={index}
      isSelected={isSelected}
      onSelect={onSelect}
      onRemove={onRemove}
      typeLabel={challengeTypeLabels[challenge.type]}
      title={challengeTitle(challenge)}
      removeTitle="Remover desafio"
    />
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
          ? 'flex h-full min-h-0 flex-col gap-3 rounded-ch-lg border border-ch-border bg-ch-surface p-4'
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
    <div className="grid h-full min-h-0 grid-cols-[280px_1fr] overflow-hidden rounded-ch-lg border border-ch-border">
      <EditorList
        title={`Perguntas (${challenges.length})`}
        count={challenges.length}
        selectedIndex={selectedIndex}
        footer={
          <Button
            type="button"
            size="sm"
            onClick={addChallenge}
            className="w-full gap-1.5"
          >
            <Plus size={14} /> Adicionar desafio
          </Button>
        }
      >
        {challenges.length === 0 ? (
          <p className="px-2 py-4 text-center text-xs text-ch-muted">
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
      </EditorList>

      <EditorPanel>
        {challenges.length === 0 ? (
          <EditorEmptyState
            message="Selecione ou adicione um desafio para começar a editar."
            actionLabel="Adicionar desafio"
            onAction={addChallenge}
          />
        ) : (
          <ChallengeFormPanel
            key={selectedIndex}
            index={selectedIndex}
            challenge={challenges[selectedIndex]!}
            onChange={(updated) => updateChallenge(selectedIndex, updated)}
            onRemove={() => removeChallenge(selectedIndex)}
          />
        )}
      </EditorPanel>
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
          <p className="text-sm font-medium text-ch">
            Desafios ({challenges.length})
          </p>
          <p className="mt-0.5 text-xs text-ch-muted">
            Edite um desafio por vez, como no layout do Content Hub.
          </p>
        </div>
        <Button type="button" size="sm" onClick={addChallenge} className="gap-1.5">
          <Plus size={14} /> Adicionar desafio
        </Button>
      </div>

      {challenges.length === 0 ? (
        <EditorEmptyState
          className="py-10"
          message='Nenhum desafio cadastrado. Clique em "Adicionar desafio" para começar.'
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
          <EditorList
            title="Perguntas"
            count={challenges.length}
            selectedIndex={selectedIndex}
            className="rounded-ch-lg border border-ch-border"
          >
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
          </EditorList>

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
