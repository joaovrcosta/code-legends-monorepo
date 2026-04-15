'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { OnboardingTopBar } from '@/components/onboarding/onboarding-top-bar'
import {
  ONBOARDING_BAR_TRANSITION_MS,
  ONBOARDING_STEP,
  onboardingProgressPercent,
} from '@/components/onboarding/onboarding-constants'
import onboardingImage from '../../../public/onboarding-img-1.png'
import codeLegendsLogo from '../../../public/loading-logo.svg'

/** Intervalo entre cada caractere do título (ms). */
const TITLE_TYPING_MS = 36

type OnboardingWelcomeClientProps = {
  greetingName: string
}

export function OnboardingWelcomeClient({
  greetingName,
}: OnboardingWelcomeClientProps) {
  const router = useRouter()
  const startPct = onboardingProgressPercent(ONBOARDING_STEP.welcome)
  const nextPct = onboardingProgressPercent(ONBOARDING_STEP.goal)
  const [barFill, setBarFill] = useState(startPct)
  const [navigating, setNavigating] = useState(false)
  const [typedTitle, setTypedTitle] = useState('')
  const [titleTypingDone, setTitleTypingDone] = useState(false)

  const welcomeTitle = `Bem-vindo(a), ${greetingName}!`

  useEffect(() => {
    const fullTitle = `Bem-vindo(a), ${greetingName}!`
    setTypedTitle('')
    setTitleTypingDone(false)
    let i = 0
    const id = window.setInterval(() => {
      i += 1
      setTypedTitle(fullTitle.slice(0, i))
      if (i >= fullTitle.length) {
        window.clearInterval(id)
        setTitleTypingDone(true)
      }
    }, TITLE_TYPING_MS)
    return () => window.clearInterval(id)
  }, [greetingName])

  const goNext = useCallback(() => {
    if (navigating) return
    setNavigating(true)
    setBarFill(nextPct)
    window.setTimeout(() => {
      router.push('/onboarding/pick-a-goal')
    }, ONBOARDING_BAR_TRANSITION_MS)
  }, [navigating, nextPct, router])

  return (
    <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
      <OnboardingTopBar
        currentStep={ONBOARDING_STEP.welcome}
        progressFillPercent={barFill}
      />



      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-6 sm:py-8">
        <div className="mt-6 flex shrink-0 flex-col items-center text-center sm:mt-8">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl mb-6">
            <Image
              src={codeLegendsLogo}
              alt=""
              className="h-20 w-20"
              aria-hidden
            />
          </div>
          <h1
            className="mt-5 flex w-full max-w-lg flex-wrap items-center justify-center gap-1 px-1 text-center text-2xl font-semibold leading-snug tracking-tight text-white sm:text-2xl"
            aria-label={welcomeTitle}
          >
            <span className="min-w-0">{typedTitle}</span>
            {!titleTypingDone ? (
              <span
                className="inline-block h-[1em] w-0.5 shrink-0 self-center bg-[#00C8FF] animate-pulse"
                aria-hidden
              />
            ) : null}
          </h1>
        </div>
        <p className="w-full max-w-lg px-1 text-center text-sm leading-relaxed text-white/60 sm:text-base">
          Em poucos passos, você vai descobrir todas as possibilidades que
          preparamos para impulsionar seu desenvolvimento. Bora começar?
        </p>
        <Image
          src={onboardingImage}
          alt="Boas-vindas ao Code Legends"
          className="h-auto w-full max-w-lg rounded-2xl object-contain"
          sizes="(max-width: 768px) 100vw, 512px"
          priority
        />
      </div>

      <footer className="mt-auto shrink-0 space-y-4 pt-4">
        <button
          type="button"
          onClick={goNext}
          disabled={navigating}
          className="mx-auto flex w-full max-w-[282px] items-center justify-center rounded-full bg-[#ececee] py-4 text-center text-base font-semibold text-[#0D0D12] transition-colors hover:bg-white disabled:cursor-wait disabled:opacity-70"
        >
          {navigating ? 'Carregando…' : 'Continuar'}
        </button>
      </footer>
    </div>
  )
}
