'use client'

import { useState, useRef, useCallback } from 'react'
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

interface QuizEditorProps {
  challenges: Challenge[]
  onChange: (challenges: Challenge[]) => void
}

const challengeTypeLabels: Record<ChallengeType, string> = {
  prediction: 'Previsão (o que acontece no código?)',
  bug: 'Encontre o Bug',
  refactor: 'Refatoração',
  complete: 'Complete o Código',
  conceptual: 'Conceitual (sem código)',
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

function ChallengeItem({
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
  const [collapsed, setCollapsed] = useState(false)
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
    challenge.type === 'bug'

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
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer select-none"
        onClick={() => setCollapsed((p) => !p)}
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 text-xs font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate max-w-xs">
            {challengeTypeLabels[challenge.type]}{' '}
            {challenge.question && `— ${challenge.question.slice(0, 40)}${challenge.question.length > 40 ? '…' : ''}`}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="p-1 text-red-500 hover:text-red-700 transition-colors"
            title="Remover desafio"
          >
            <Trash2 size={14} />
          </button>
          {collapsed ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
        </div>
      </div>

      {!collapsed && (
        <div className="px-4 pb-4 space-y-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          {/* Type */}
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

          {/* Question */}
          <div className="space-y-1.5">
            <Label>Pergunta *</Label>
            <Textarea
              value={challenge.question}
              onChange={(e) => onChange({ ...challenge, question: e.target.value })}
              rows={2}
              placeholder="O que será mostrado no console?"
            />
          </div>

          {/* Code */}
          {challenge.type !== 'conceptual' && (
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

          {/* Options */}
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

          {/* Placeholder (para 'complete') */}
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

          {/* Correct answer */}
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

          {/* Explanation */}
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
      )}
    </div>
  )
}

export function QuizEditor({ challenges, onChange }: QuizEditorProps) {
  const addChallenge = () => onChange([...challenges, emptyChallenge()])

  const updateChallenge = (i: number, c: Challenge) => {
    const updated = [...challenges]
    updated[i] = c
    onChange(updated)
  }

  const removeChallenge = (i: number) =>
    onChange(challenges.filter((_, idx) => idx !== i))

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
            Desafios ({challenges.length})
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Cada desafio é exibido ao aluno como um bloco interativo.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={addChallenge}
          className="gap-1.5"
        >
          <Plus size={14} /> Adicionar desafio
        </Button>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 dark:border-gray-600 py-10 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Nenhum desafio cadastrado. Clique em &quot;Adicionar desafio&quot; para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {challenges.map((c, i) => (
            <ChallengeItem
              key={i}
              index={i}
              challenge={c}
              onChange={(updated) => updateChallenge(i, updated)}
              onRemove={() => removeChallenge(i)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
