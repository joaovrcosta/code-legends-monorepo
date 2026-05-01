'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import questionRai from '../../../../public/rai/question-rai-1.svg'
import happyRai from '../../../../public/rai/happy-rai.svg'
import happyRai2 from '../../../../public/rai/happy-rai-2.svg'

export type CheerVariant = 'happy1' | 'happy2'

export interface RaiQuestionBubbleProps {
  /** Texto da pergunta (efeito de digitação até concluir). */
  question: string
  submitted: boolean
  isCorrect: boolean | null
  /** Mensagem aleatória de parabéns quando acertou (mesmo padrão do block_slots). */
  cheerMessage: string | null
  cheerVariant: CheerVariant
}

export function RaiQuestionBubble({
  question,
  submitted,
  isCorrect,
  cheerMessage,
  cheerVariant,
}: RaiQuestionBubbleProps) {
  const [typedQuestion, setTypedQuestion] = useState('')
  const [questionTypingDone, setQuestionTypingDone] = useState(false)

  useEffect(() => {
    const target = question ?? ''
    setTypedQuestion('')
    setQuestionTypingDone(false)

    let cancelled = false
    let i = 0
    const delayId = window.setTimeout(() => {
      if (cancelled) return
      const id = window.setInterval(() => {
        i += 1
        setTypedQuestion(target.slice(0, i))
        if (i >= target.length) {
          window.clearInterval(id)
          setQuestionTypingDone(true)
        }
      }, 18)
      if (target.length === 0) {
        window.clearInterval(id)
        setQuestionTypingDone(true)
      }
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(delayId)
    }
  }, [question])

  const raiSrc =
    submitted && isCorrect === true
      ? cheerVariant === 'happy2'
        ? happyRai2
        : happyRai
      : questionRai

  const showCheer = submitted && isCorrect === true
  const bubbleText = showCheer ? (cheerMessage ?? 'Boa!') : typedQuestion

  return (
    <div className="px-5 pt-5 pb-4">
      <div className="flex items-start gap-3">
        <div className="shrink-0 pt-0.5">
          <Image src={raiSrc} alt="" width={56} height={56} priority={false} />
        </div>
        <div className="relative min-w-0 w-fit max-w-full rounded-[14px] border border-[#25252A] bg-surface px-4 py-3">
          <div className="absolute left-[-6px] top-4 h-3 w-3 rotate-45 border-b border-l border-[#25252A] bg-surface" />
          <p className="text-base font-medium text-white leading-relaxed">
            {bubbleText}
            {!showCheer && !questionTypingDone && (
              <span className="ml-0.5 inline-block h-4 w-[2px] align-[-2px] bg-white/60 animate-pulse" />
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Frases de celebração ao acertar (alinhadas ao BlockSlotsChallenge). */
export const CHALLENGE_CHEER_PHRASES = [
  'Boa! Mandou muito bem.',
  'Aí sim! Resposta na mosca.',
  'Perfeito! Você tá voando.',
  'Excelente! Continua assim.',
  'Brabo demais! Próxima!',
  'Isso! Lógica afiada.',
  'Muito bem! Tá ficando fácil.',
  'Boa jogada! Acertou em cheio.',
  'Top! Mais uma pra conta.',
  'Caramba! Que precisão.',
] as const

export function pickRandomCheerMessage(): string {
  const i = Math.floor(Math.random() * CHALLENGE_CHEER_PHRASES.length)
  return CHALLENGE_CHEER_PHRASES[i] ?? 'Boa!'
}

export function pickRandomCheerVariant(): CheerVariant {
  return Math.random() < 0.5 ? 'happy1' : 'happy2'
}
