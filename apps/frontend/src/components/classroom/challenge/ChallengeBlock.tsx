'use client'

import { useState, useCallback } from 'react'
import { awardChallengeXpFromBrowser } from '@/lib/award-challenge-xp-client'
import { useActiveCourseStore } from '@/stores/active-course-store'
import dynamic from 'next/dynamic'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Challenge } from '@/types/roadmap'
import { BlockSlotsChallenge } from '@/components/classroom/challenge/BlockSlotsChallenge'
import { ExamMcqChallenge } from '@/components/career/exam-mcq-challenge'
import {
  ChallengeFeedbackPanel,
  useIsDesktopChallengeLayout,
  type ChallengeFeedbackXpAward,
} from '@/components/classroom/challenge/challenge-feedback-panel'
import { playCorrectChime, playWrongTamTamm } from '@/lib/play-correct-chime'
import { ArrowRight, Eye } from '@phosphor-icons/react/dist/ssr'

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

function normalizeAnswer(s: string) {
  return s.trim().replace(/\s+/g, ' ').toLowerCase()
}

function checkAnswer(challenge: Challenge, answer: string): boolean {
  const norm = normalizeAnswer(answer)
  if (challenge.correctAnswer !== undefined) {
    if (normalizeAnswer(challenge.correctAnswer) === norm) return true
  }
  if (challenge.correctAnswers) {
    return challenge.correctAnswers.some((a) => normalizeAnswer(a) === norm)
  }
  return false
}

export interface ChallengeBlockProps {
  challenge: Challenge
  index?: number
  /** Lição atual (com `challengeXpSlotIndex`) para ganhar XP só na primeira vez que acerta o desafio. */
  lessonId?: number
  /** Índice do desafio na lição (0..N-1), alinhado ao quiz ou à ordem dos blocos `challenge` no artigo. */
  challengeXpSlotIndex?: number
  /** Chamado ao submeter a resposta com o resultado (acertou/errou). Usado no fluxo de quiz multiperguntas. */
  onAnswer?: (correct: boolean) => void
  /** Se definido, após submeter mostra botão "Próxima" em vez de "Tentar novamente". */
  onNext?: () => void
  /** Se false (ex.: exame de carreira), não permite nova tentativa após erro. */
  allowRetry?: boolean
}

export function ChallengeBlock({
  challenge,
  index,
  lessonId,
  challengeXpSlotIndex,
  onAnswer,
  onNext,
  allowRetry = true,
}: ChallengeBlockProps) {
  const [selected, setSelected] = useState<string | null>(null)
  const [typed, setTyped] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [feedbackDismissed, setFeedbackDismissed] = useState(false)
  const [showExplanation, setShowExplanation] = useState(false)
  const [xpAward, setXpAward] = useState<ChallengeFeedbackXpAward>({ state: 'idle' })
  const isDesktopLayout = useIsDesktopChallengeLayout()

  const hasOptions = Array.isArray(challenge.options) && challenge.options.length > 0
  const isChoiceType =
    (challenge.type === 'prediction' ||
      challenge.type === 'conceptual' ||
      challenge.type === 'bug') &&
    hasOptions
  const isTextType =
    challenge.type === 'refactor' ||
    challenge.type === 'complete' ||
    (!hasOptions && (challenge.type === 'bug' || challenge.type === 'conceptual'))

  const typeLabels: Record<Challenge['type'], string> = {
    prediction: 'Previsão',
    bug: 'Encontre o Bug',
    refactor: 'Refatoração',
    complete: 'Complete o Código',
    conceptual: 'Conceitual',
    block_slots: 'Encaixar comandos',
    exam_mcq: 'Exame (múltipla escolha)',
  }

  const typeBadgeColors: Record<Challenge['type'], string> = {
    prediction: 'bg-[#1e3a5f] text-[#7dd3fc] border-[#2d5a8e]',
    bug: 'bg-[#3b1515] text-[#f87171] border-[#7f1d1d]',
    refactor: 'bg-[#1a2e1a] text-[#4ade80] border-[#166534]',
    complete: 'bg-[#2d1a3e] text-[#c084fc] border-[#6b21a8]',
    conceptual: 'bg-[#1e2e3b] text-[#93c5fd] border-[#1d4ed8]',
    block_slots: 'bg-[#2d1a3e] text-[#c084fc] border-[#6b21a8]',
    exam_mcq: 'bg-[#1a2530] text-[#7ee9ff] border-[#00C8FF]/40',
  }

  const handleSubmit = useCallback(() => {
    if (submitted) return
    const answer = isChoiceType ? (selected ?? '') : typed
    const correct = checkAnswer(challenge, answer)
    if (correct) playCorrectChime()
    else if (allowRetry) playWrongTamTamm()
    if (!correct) {
      setXpAward({ state: 'idle' })
    }
    setIsCorrect(correct)
    setSubmitted(true)
    setFeedbackDismissed(false)
    onAnswer?.(correct)
    const xpSlot =
      lessonId != null
        ? (challengeXpSlotIndex ?? index ?? null)
        : null
    if (correct && lessonId != null && xpSlot != null && xpSlot >= 0) {
      setXpAward({ state: 'pending' })
      const courseId = useActiveCourseStore.getState().activeCourse?.id ?? null
      void awardChallengeXpFromBrowser(lessonId, xpSlot, {
        courseId,
      }).then(async (r) => {
        if (r.applied && r.xpGained > 0) {
          setXpAward({ state: 'earned', amount: r.xpGained })
          await useActiveCourseStore.getState().fetchActiveCourse()
        } else if (r.requestFailed) {
          setXpAward({ state: 'error' })
        } else {
          setXpAward({ state: 'already_awarded' })
        }
      })
    } else if (correct) {
      setXpAward({ state: 'idle' })
    }
  }, [
    submitted,
    isChoiceType,
    selected,
    typed,
    challenge,
    onAnswer,
    lessonId,
    challengeXpSlotIndex,
    index,
    allowRetry,
  ])

  const handleReset = useCallback(() => {
    setSelected(null)
    setTyped('')
    setSubmitted(false)
    setIsCorrect(null)
    setFeedbackDismissed(false)
    setShowExplanation(false)
    setXpAward({ state: 'idle' })
  }, [])

  if (challenge.type === 'block_slots') {
    return (
      <BlockSlotsChallenge
        challenge={challenge}
        index={index}
        lessonId={lessonId}
        challengeXpSlotIndex={challengeXpSlotIndex}
        onAnswer={onAnswer}
        onNext={onNext}
        allowRetry={allowRetry}
      />
    )
  }

  if (challenge.type === 'exam_mcq') {
    return (
      <ExamMcqChallenge
        challenge={challenge}
        onAnswer={onAnswer}
        onNext={onNext}
      />
    )
  }

  const feedbackVisible =
    submitted && (isCorrect === true || isCorrect === false) && !feedbackDismissed
  const hasExplanation = Boolean(challenge.explanation?.trim())

  return (
    <div className="relative my-6 rounded-[16px] border border-[#25252A] bg-[#0d0d0f] overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3 border-b border-[#25252A] bg-surface">
        <span
          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${typeBadgeColors[challenge.type]}`}
        >
          {typeLabels[challenge.type]}
        </span>
        {index !== undefined && (
          <span className="text-xs text-[#71717a]">Desafio {index + 1}</span>
        )}
      </div>

      {/* Question */}
      <div className="px-5 pt-5 pb-4">
        <p className="text-base font-medium text-white leading-relaxed">
          {challenge.question}
        </p>
      </div>

      {/* Code block */}
      {challenge.code && (
        <div className="mx-5 mb-4 overflow-hidden rounded-[12px] border border-[#25252A] bg-[#0d0d0f]">
          <CodeBlockHighlighter
            code={challenge.code}
            language={challenge.language ?? 'tsx'}
          />
        </div>
      )}

      {/* Choices */}
      {isChoiceType && (
        <div className="px-5 pb-4 flex flex-col gap-2">
          {challenge.options!.map((option, i) => {
            const isSelected = selected === option
            const isThisCorrect =
              submitted && challenge.correctAnswer !== undefined
                ? normalizeAnswer(challenge.correctAnswer) ===
                normalizeAnswer(option)
                : false
            const isThisWrong = submitted && isSelected && !isCorrect

            return (
              <button
                key={i}
                type="button"
                disabled={submitted}
                onClick={() => setSelected(option)}
                className={`w-full text-left rounded-[10px] border px-4 py-3 text-sm transition-all
                  ${isThisCorrect
                    ? 'border-[#4ade80] bg-[#1a2e1a] text-[#4ade80]'
                    : isThisWrong
                      ? 'border-[#f87171] bg-[#3b1515] text-[#f87171]'
                      : isSelected
                        ? 'border-[#00b3e4] bg-[#0d2a38] text-white'
                        : 'border-[#25252A] bg-surface text-[#c4c4cc] hover:border-[#3f3f47] hover:text-white'
                  }
                  disabled:cursor-not-allowed`}
              >
                <span className="flex items-center gap-3">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-current text-xs font-bold">
                    {String.fromCharCode(65 + i)}
                  </span>
                  {option}
                </span>
              </button>
            )
          })}
        </div>
      )}

      {/* Text input */}
      {isTextType && (
        <div className="px-5 pb-4">
          <textarea
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            disabled={submitted}
            rows={challenge.type === 'conceptual' ? 3 : 5}
            placeholder={challenge.placeholder ?? 'Escreva sua resposta...'}
            className="w-full rounded-[10px] border border-[#25252A] bg-surface px-4 py-3 text-sm text-white font-mono placeholder:text-[#52525b] focus:border-[#00b3e4] focus:outline-none resize-none disabled:opacity-60"
          />
        </div>
      )}

      {/* Explanation */}
      {submitted && challenge.explanation && (
        <div className="px-5 pb-5">
          {!showExplanation ? (
            feedbackDismissed ? (
              <button
                type="button"
                onClick={() => setShowExplanation(true)}
                className="flex items-center gap-1.5 text-xs text-[#71717a] hover:text-[#a1a1aa] transition-colors"
              >
                <Eye size={14} /> Ver explicação
              </button>
            ) : null
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

      {/* Actions */}
      <div className="flex items-center justify-end px-5 pb-5">
        {!submitted ? (
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isChoiceType ? selected === null : typed.trim() === ''}
            className="font-wotfard mt-8 flex h-[38px] w-full items-center justify-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-base font-semibold text-black transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40 lg:mt-4 lg:w-[115px]"
          >
            Verificar
          </button>
        ) : feedbackDismissed ? (
          onNext ? (
            <button
              type="button"
              onClick={onNext}
              className="flex items-center gap-2 rounded-full bg-[#00b3e4] px-5 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
            >
              Próxima <ArrowRight weight="bold" size={14} />
            </button>
          ) : allowRetry ? (
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-2 rounded-full border border-[#25252A] px-5 py-2 text-sm font-medium text-[#a1a1aa] transition-colors hover:border-[#3f3f47] hover:text-white"
            >
              Tentar novamente
            </button>
          ) : null
        ) : null}
      </div>

      <ChallengeFeedbackPanel
        open={feedbackVisible}
        isCorrect={isCorrect === true}
        isDesktopLayout={isDesktopLayout}
        hasExplanation={hasExplanation}
        onDismiss={() => setFeedbackDismissed(true)}
        onTryAgain={handleReset}
        onSeeAnswer={() => {
          setShowExplanation(true)
          setFeedbackDismissed(true)
        }}
        onContinue={() => setFeedbackDismissed(true)}
        onNext={onNext}
        xpAward={xpAward}
        allowRetry={allowRetry}
      />
    </div>
  )
}
