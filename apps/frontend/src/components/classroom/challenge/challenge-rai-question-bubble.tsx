'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import questionRai from '../../../../public/rai/question-rai-1.svg'
import happyRai from '../../../../public/rai/happy-rai.svg'
import happyRai2 from '../../../../public/rai/happy-rai-2.svg'

let typingAudioContext: AudioContext | null = null

function getTypingAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null
  try {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext
    if (!AC) return null
    if (!typingAudioContext) typingAudioContext = new AC()
    return typingAudioContext
  } catch {
    return null
  }
}

/** Som curto estilo tecla; limitado no tempo para não poluir com texto longo. */
function playTypingTickThrottled(lastAtRef: { current: number }) {
  if (typeof window === 'undefined') return
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  const now = performance.now()
  if (now - lastAtRef.current < 42) return
  lastAtRef.current = now

  const ctx = getTypingAudioContext()
  if (!ctx) return
  if (ctx.state === 'suspended') void ctx.resume().catch(() => {})

  const t = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()
  osc.type = 'sine'
  osc.frequency.setValueAtTime(1350, t)
  osc.frequency.exponentialRampToValueAtTime(520, t + 0.028)
  gain.gain.setValueAtTime(0.055, t)
  gain.gain.exponentialRampToValueAtTime(0.0008, t + 0.038)
  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(t)
  osc.stop(t + 0.045)
}

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
  const typingSoundLastAtRef = useRef(0)

  useEffect(() => {
    const target = question ?? ''
    setTypedQuestion('')
    setQuestionTypingDone(false)
    typingSoundLastAtRef.current = 0

    let cancelled = false
    let i = 0
    let intervalId: number | undefined
    const delayId = window.setTimeout(() => {
      if (cancelled) return
      if (target.length === 0) {
        setQuestionTypingDone(true)
        return
      }
      intervalId = window.setInterval(() => {
        i += 1
        const ch = target[i - 1]
        if (ch && !/\s/.test(ch) && !cancelled) {
          playTypingTickThrottled(typingSoundLastAtRef)
        }
        setTypedQuestion(target.slice(0, i))
        if (i >= target.length) {
          if (intervalId !== undefined) window.clearInterval(intervalId)
          setQuestionTypingDone(true)
        }
      }, 18)
    }, 250)

    return () => {
      cancelled = true
      window.clearTimeout(delayId)
      if (intervalId !== undefined) window.clearInterval(intervalId)
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
