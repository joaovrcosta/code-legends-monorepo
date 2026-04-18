'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import {
  Drawer,
  DrawerContent,
  DrawerTitle,
} from '@/components/ui/drawer'
import { ArrowRight, Flag } from '@phosphor-icons/react/dist/ssr'
import { CompactNumber } from '@/components/ui/compact-number'

export const CHALLENGE_FEEDBACK_WRONG_DEFAULT =
  'Não foi dessa vez. Confira sua resposta ou veja a explicação, se houver.'

export const CHALLENGE_FEEDBACK_OK_DEFAULT = 'Correto! Boa resposta.'

/** XP opcional no painel (count-up quando `earned`). */
export type ChallengeFeedbackXpAward =
  | { state: 'idle' }
  | { state: 'pending' }
  | { state: 'earned'; amount: number }
  | { state: 'error' }
  /** Resposta 200 mas XP idempotente já aplicado antes. */
  | { state: 'already_awarded' }

export function useIsDesktopChallengeLayout() {
  const [isDesktop, setIsDesktop] = useState(false)
  useEffect(() => {
    const mql = window.matchMedia('(min-width: 768px)')
    const onChange = () => setIsDesktop(mql.matches)
    onChange()
    mql.addEventListener?.('change', onChange)
    return () => mql.removeEventListener?.('change', onChange)
  }, [])
  return isDesktop
}

const PILL_LIGHT =
  'rounded-full bg-[#e8e8ee] px-5 py-2.5 text-sm font-bold text-[#111] shadow-[0_4px_0_0_#a8a8b4] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#a8a8b4]'

const PILL_MUTED =
  'rounded-full bg-[#5c5438] px-5 py-2.5 text-sm font-bold text-white shadow-[0_4px_0_0_#2f2a1c] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#2f2a1c]'

const PILL_SUCCESS =
  'rounded-full bg-[#d8f5e4] px-5 py-2.5 text-sm font-bold text-[#0f2918] shadow-[0_4px_0_0_#7eb89a] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#7eb89a]'

const PILL_NEXT =
  'rounded-full bg-[#00b3e4] px-5 py-2.5 text-sm font-bold text-black shadow-[0_4px_0_0_#0088b0] transition-transform active:translate-y-[2px] active:shadow-[0_2px_0_0_#0088b0]'

export interface ChallengeFeedbackPanelProps {
  /** Painel ativo (ex.: resposta enviada e ainda não dispensou) */
  open: boolean
  isCorrect: boolean
  isDesktopLayout: boolean
  hasExplanation: boolean
  wrongMessage?: string
  okMessage?: string
  onDismiss: () => void
  onTryAgain: () => void
  onSeeAnswer: () => void
  onContinue: () => void
  onNext?: () => void
  /** Bónus de desafio (primeira resposta certa): loading + valor com count-up. */
  xpAward?: ChallengeFeedbackXpAward
}

/**
 * Feedback pós-resposta: caixa absoluta no desktop (pai deve ser `relative`) e drawer no mobile.
 */
export function ChallengeFeedbackPanel({
  open,
  isCorrect,
  isDesktopLayout,
  hasExplanation,
  wrongMessage = CHALLENGE_FEEDBACK_WRONG_DEFAULT,
  okMessage = CHALLENGE_FEEDBACK_OK_DEFAULT,
  onDismiss,
  onTryAgain,
  onSeeAnswer,
  onContinue,
  onNext,
  xpAward = { state: 'idle' },
}: ChallengeFeedbackPanelProps) {
  const wrong = !isCorrect
  const msg = isCorrect ? okMessage : wrongMessage
  const showXpRow =
    isCorrect && xpAward.state !== 'idle' && open

  return (
    <>
      {open && isDesktopLayout && (
        <div
          className="pointer-events-auto absolute bottom-4 left-4 right-4 z-20 animate-in fade-in-0 slide-in-from-bottom-6 fill-mode-both duration-300 motion-reduce:animate-none md:bottom-5 md:left-5 md:right-5"
          role="dialog"
          aria-modal="true"
          aria-label={isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
        >
          <div
            className={cn(
              'relative rounded-[22px] border border-black/15 p-5 pb-10 shadow-[0_12px_40px_rgba(0,0,0,0.45)]',
              isCorrect ? 'bg-[#1a2e22] text-white' : 'bg-[#433400] text-white',
            )}
          >
            <p className="pr-8 text-[15px] font-medium leading-relaxed text-white/95">
              {msg}
            </p>
            {showXpRow ? (
              <div
                className="mt-4 border-t border-white/10 pt-4 pr-8"
                role="status"
                aria-live="polite"
              >
                {xpAward.state === 'pending' ? (
                  <p className="text-sm font-medium text-white/70 motion-reduce:animate-none animate-pulse">
                    A registrar bónus de XP…
                  </p>
                ) : xpAward.state === 'earned' ? (
                  <p className="text-[17px] font-bold leading-tight tracking-tight text-white">
                    <span className="font-semibold text-white/80">Você ganhou! </span>
                    <span className="text-orange-400">+</span>
                    <CompactNumber
                      key={xpAward.amount}
                      value={xpAward.amount}
                      enableCountUp
                      flameGradient
                      countUpDuration={1.35}
                      suffix=" XP"
                    />
                  </p>
                ) : xpAward.state === 'already_awarded' ||
                  xpAward.state === 'error' ? (
                  <p className="text-sm font-medium text-white/65">
                    Bonus deste desafio já contabilizado.
                  </p>
                ) : null}
              </div>
            ) : null}
            <div className="mt-5 flex flex-wrap gap-3">
              {wrong ? (
                <>
                  <button type="button" className={PILL_LIGHT} onClick={onTryAgain}>
                    Tentar de novo
                  </button>
                  {hasExplanation ? (
                    <button type="button" className={PILL_MUTED} onClick={onSeeAnswer}>
                      Ver resposta
                    </button>
                  ) : null}
                </>
              ) : (
                <>
                  <button type="button" className={PILL_SUCCESS} onClick={onContinue}>
                    Continuar
                  </button>
                  {onNext ? (
                    <button
                      type="button"
                      className={PILL_NEXT}
                      onClick={() => {
                        onContinue()
                        onNext()
                      }}
                    >
                      Próxima <ArrowRight weight="bold" size={14} className="inline" />
                    </button>
                  ) : null}
                </>
              )}
            </div>
            <Flag
              className="pointer-events-none absolute bottom-4 right-4 text-white/20"
              size={26}
              weight="regular"
              aria-hidden
            />
          </div>
        </div>
      )}

      <Drawer
        open={open && !isDesktopLayout}
        onOpenChange={(next) => {
          if (!next) onDismiss()
        }}
      >
        <DrawerContent
          className={cn(
            'mt-12 max-h-[88vh] border-0 p-0 animate-in fade-in-0 slide-in-from-bottom-8 fill-mode-both duration-300 motion-reduce:animate-none',
            isCorrect ? 'bg-[#1a2e22]' : 'bg-[#433400]',
          )}
        >
          <DrawerTitle className="sr-only">
            {isCorrect ? 'Resposta correta' : 'Resposta incorreta'}
          </DrawerTitle>
          <div className="px-5 pb-8 pt-1">
            <div className="relative rounded-[18px] p-1 pb-12 text-white">
              <p className="text-[15px] font-medium leading-relaxed text-white/95">
                {msg}
              </p>
              {showXpRow ? (
                <div
                  className="mt-4 border-t border-white/10 pt-4"
                  role="status"
                  aria-live="polite"
                >
                  {xpAward.state === 'pending' ? (
                    <p className="text-sm font-medium text-white/70 motion-reduce:animate-none animate-pulse">
                      A registrar bónus de XP…
                    </p>
                  ) : xpAward.state === 'earned' ? (
                    <p className="text-[17px] font-bold leading-tight tracking-tight text-white">
                      <span className="font-semibold text-white/80">Você ganhou! </span>
                      <span className="text-orange-400">+</span>
                      <CompactNumber
                        key={xpAward.amount}
                        value={xpAward.amount}
                        enableCountUp
                        flameGradient
                        countUpDuration={1.35}
                        suffix=" XP"
                      />
                    </p>
                  ) : xpAward.state === 'already_awarded' ||
                    xpAward.state === 'error' ? (
                    <p className="text-sm font-medium text-white/65">
                      O bónus de XP deste desafio já tinha sido contabilizado.
                    </p>
                  ) : null}
                </div>
              ) : null}
              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {wrong ? (
                  <>
                    <button
                      type="button"
                      className={cn(PILL_LIGHT, 'w-full sm:w-auto')}
                      onClick={onTryAgain}
                    >
                      Tentar de novo
                    </button>
                    {hasExplanation ? (
                      <button
                        type="button"
                        className={cn(PILL_MUTED, 'w-full sm:w-auto')}
                        onClick={onSeeAnswer}
                      >
                        Ver resposta
                      </button>
                    ) : null}
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className={cn(PILL_SUCCESS, 'w-full sm:w-auto')}
                      onClick={onContinue}
                    >
                      Continuar
                    </button>
                    {onNext ? (
                      <button
                        type="button"
                        className={cn(PILL_NEXT, 'w-full sm:w-auto')}
                        onClick={() => {
                          onContinue()
                          onNext()
                        }}
                      >
                        Próxima <ArrowRight weight="bold" size={14} className="inline" />
                      </button>
                    ) : null}
                  </>
                )}
              </div>
              <Flag
                className="pointer-events-none absolute bottom-2 right-2 text-white/20"
                size={24}
                weight="regular"
                aria-hidden
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </>
  )
}
