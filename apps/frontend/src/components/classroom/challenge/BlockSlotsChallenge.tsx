'use client'

import { useCallback, useMemo, useState } from 'react'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Challenge } from '@/types/roadmap'
import { Check, X, ArrowRight, Eye } from '@phosphor-icons/react/dist/ssr'

const CodeBlockHighlighter = dynamic(
  () =>
    import('../article/CodeBlockHighlighter').then(
      (m) => m.CodeBlockHighlighter,
    ),
  { ssr: false },
)

const CodeBlockPre = dynamic(
  () => import('../article/CodeBlock').then((m) => m.CodeBlockPre),
  { ssr: false },
)

function arraysEqual(a: string[], b: string[]) {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

function shuffleIds(ids: string[]): string[] {
  const copy = [...ids]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

/** Mesma regra do export do hub: núcleo em `solution` + distratores anexados. */
function normalizeBlockSlotsSolution(challenge: Challenge): string[] | null {
  const pieces = challenge.pieces ?? []
  if (pieces.length === 0) return null
  const ids = pieces.map((p) => p.id)
  const idSet = new Set(ids)
  if (idSet.size !== ids.length) return null

  let core = challenge.solution?.filter(Boolean) ?? []
  if (core.length === 0) {
    core = [...ids]
  }
  const coreSet = new Set(core)
  for (const id of core) {
    if (!idSet.has(id)) return null
  }
  if (coreSet.size !== core.length) return null

  const extras = ids.filter((id) => !coreSet.has(id)).sort()
  const full = [...core, ...extras]
  if (full.length !== ids.length) return null
  return full
}

function isSafeImageUrl(url: string): boolean {
  try {
    const u = new URL(url)
    return u.protocol === 'https:' || u.protocol === 'http:'
  } catch {
    return false
  }
}

export interface BlockSlotsChallengeProps {
  challenge: Challenge
  index?: number
  onAnswer?: (correct: boolean) => void
  onNext?: () => void
}

export function BlockSlotsChallenge({
  challenge,
  index,
  onAnswer,
  onNext,
}: BlockSlotsChallengeProps) {
  const targetSolution = useMemo(
    () => normalizeBlockSlotsSolution(challenge),
    [challenge],
  )

  const slotCount = targetSolution?.length ?? 0

  const pieceMap = useMemo(() => {
    const m = new Map<string, string>()
    for (const p of challenge.pieces ?? []) {
      m.set(p.id, p.content)
    }
    return m
  }, [challenge.pieces])

  const [slots, setSlots] = useState<(string | null)[]>(() =>
    slotCount > 0 ? Array(slotCount).fill(null) : [],
  )
  const [bankOrder, setBankOrder] = useState<string[]>(() => {
    if (!targetSolution) return []
    return shuffleIds([...new Set(challenge.pieces?.map((p) => p.id) ?? [])])
  })

  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [showExplanation, setShowExplanation] = useState(false)

  const usedIds = useMemo(
    () => new Set(slots.filter((s): s is string => s != null)),
    [slots],
  )

  const bankVisible = useMemo(
    () => bankOrder.filter((id) => !usedIds.has(id)),
    [bankOrder, usedIds],
  )

  const placeFromBank = useCallback(
    (pieceId: string) => {
      if (submitted) return
      setSlots((prev) => {
        const next = [...prev]
        const idx = next.findIndex((s) => s == null)
        if (idx === -1) return prev
        next[idx] = pieceId
        return next
      })
    },
    [submitted],
  )

  const clearFromSlot = useCallback(
    (fromIndex: number) => {
      if (submitted) return
      setSlots((prev) => {
        const next = [...prev]
        for (let i = fromIndex; i < next.length; i++) next[i] = null
        return next
      })
    },
    [submitted],
  )

  const handleSubmit = useCallback(() => {
    if (submitted || !targetSolution) return
    if (slots.some((s) => s == null)) return
    const correct = arraysEqual(targetSolution, slots as string[])
    setIsCorrect(correct)
    setSubmitted(true)
    onAnswer?.(correct)
  }, [submitted, targetSolution, slots, onAnswer])

  const handleReset = useCallback(() => {
    if (!targetSolution) return
    setSlots(Array(targetSolution.length).fill(null))
    setBankOrder(shuffleIds([...new Set(challenge.pieces?.map((p) => p.id) ?? [])]))
    setSubmitted(false)
    setIsCorrect(null)
    setShowExplanation(false)
  }, [targetSolution, challenge.pieces])

  const missionUrl = challenge.missionImageUrl?.trim() ?? ''
  const showMission = missionUrl.length > 0 && isSafeImageUrl(missionUrl)

  if (!targetSolution || slotCount === 0) {
    return (
      <div className="my-6 rounded-[16px] border border-red-500/40 bg-red-950/20 px-5 py-4 text-sm text-red-300">
        Desafio inválido: defina peças com ids únicos e uma solução coerente com o número de
        ranhuras.
      </div>
    )
  }

  const allFilled = !slots.some((s) => s == null)

  return (
    <div className="my-6 rounded-[16px] border border-[#25252A] bg-[#0d0d0f] overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#25252A] bg-surface">
        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-[#2d1a3e] text-[#c084fc] border-[#6b21a8]">
          Encaixar comandos
        </span>
        {index !== undefined && (
          <span className="text-xs text-[#71717a]">Desafio {index + 1}</span>
        )}
      </div>

      <div className="px-5 pt-5 pb-4">
        <p className="text-base font-medium text-white leading-relaxed">
          {challenge.question}
        </p>
      </div>

      {showMission && (
        <div className="mx-5 mb-4 overflow-hidden rounded-[12px] border border-[#25252A] bg-[#141416] p-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={missionUrl}
            alt=""
            className="mx-auto max-h-48 w-auto max-w-full object-contain"
          />
        </div>
      )}

      {challenge.code && (
        <div className="mx-5 mb-4 overflow-hidden rounded-[12px] border border-[#25252A] bg-[#0d0d0f]">
          <CodeBlockHighlighter
            code={challenge.code}
            language={challenge.language ?? 'tsx'}
          />
        </div>
      )}

      <div className="mx-5 mb-3 rounded-[12px] border border-[#25252A] bg-[#141416] p-4">
        <p className="mb-3 text-xs font-medium text-[#a1a1aa]">Programa</p>
        <div className="flex flex-col gap-2">
          {slots.map((slotId, i) => (
            <button
              key={i}
              type="button"
              disabled={submitted}
              onClick={() => {
                if (slotId != null) clearFromSlot(i)
              }}
              className={`flex min-h-[44px] items-center gap-3 rounded-[10px] border px-3 py-2 text-left transition-colors ${slotId == null
                  ? 'border-dashed border-[#3f3f47] bg-[#0d0d0f]/80'
                  : 'border-[#25252A] bg-[#1a1a1e] hover:border-[#00b3e4]/50'
                } disabled:cursor-default`}
            >
              <span className="w-6 shrink-0 text-center text-xs font-semibold text-[#71717a]">
                {i + 1}
              </span>
              {slotId == null ? (
                <span className="text-sm text-[#52525b]">Toque num bloco abaixo</span>
              ) : (
                <span className="font-mono text-sm text-white">
                  {pieceMap.get(slotId) ?? slotId}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 pb-2">
        <p className="mb-2 text-xs text-[#71717a]">Blocos disponíveis</p>
        <div className="flex flex-wrap gap-2">
          {bankVisible.map((id) => (
            <button
              key={id}
              type="button"
              disabled={submitted}
              onClick={() => placeFromBank(id)}
              className="rounded-full border border-[#e4e4e7] bg-[#f4f4f5] px-4 py-2 text-sm font-medium text-[#18181b] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {pieceMap.get(id) ?? id}
            </button>
          ))}
        </div>
      </div>

      {submitted && isCorrect !== null && (
        <div
          className={`mx-5 mb-4 flex items-center gap-2 rounded-[10px] border px-4 py-3 text-sm font-medium ${isCorrect
              ? 'border-[#4ade80] bg-[#1a2e1a] text-[#4ade80]'
              : 'border-[#f87171] bg-[#3b1515] text-[#f87171]'
            }`}
        >
          {isCorrect ? (
            <Check weight="bold" size={16} />
          ) : (
            <X weight="bold" size={16} />
          )}
          {isCorrect ? 'Correto!' : 'Não foi dessa vez...'}
        </div>
      )}

      {submitted && challenge.explanation && (
        <div className="px-5 pb-5">
          {!showExplanation ? (
            <button
              type="button"
              onClick={() => setShowExplanation(true)}
              className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors"
            >
              <Eye size={14} /> Ver explicação
            </button>
          ) : (
            <div className="rounded-[10px] border border-[#25252A] bg-surface px-4 py-3 text-sm text-[#a1a1aa] leading-relaxed">
              <p className="text-xs font-semibold text-[#71717a] mb-1 uppercase tracking-wide">
                Explicação
              </p>
              <div className="explanation-markdown prose prose-invert prose-sm max-w-none prose-p:my-1 prose-ul:my-2 prose-li:my-0 prose-code:text-[#7dd3fc] prose-code:bg-white/10 prose-code:px-1 prose-code:rounded prose-code:before:content-none prose-code:after:content-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    pre: ({ children }) => <CodeBlockPre>{children}</CodeBlockPre>,
                    code: ({ node: _node, className, children, ...props }) =>
                      className ? (
                        <code className={className} {...props}>
                          {children}
                        </code>
                      ) : (
                        <code
                          className="rounded bg-white/10 px-1 py-0.5 font-mono text-[#7dd3fc]"
                          {...props}
                        >
                          {children}
                        </code>
                      ),
                  }}
                >
                  {challenge.explanation ?? ''}
                </ReactMarkdown>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between px-5 pb-5">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!allFilled}
            className="flex items-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Verificar <ArrowRight weight="bold" size={14} />
          </button>
        ) : onNext ? (
          <button
            type="button"
            onClick={onNext}
            className="flex items-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
          >
            Próxima <ArrowRight weight="bold" size={14} />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-2 rounded-full border border-[#25252A] px-5 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3f3f47] hover:text-white"
          >
            Tentar novamente
          </button>
        )}
      </div>
    </div>
  )
}
