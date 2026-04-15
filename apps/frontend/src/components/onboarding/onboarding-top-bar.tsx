'use client'

import { ChevronLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import {
  ONBOARDING_TOTAL_STEPS,
  onboardingProgressPercent,
} from './onboarding-constants'

type OnboardingTopBarProps = {
  /** Etapa atual (1 = primeira, até `totalSteps`). */
  currentStep: number
  totalSteps?: number
  /** Quando definido, sobrescreve a largura da barra (ex.: animação ao avançar). */
  progressFillPercent?: number
  className?: string
}

export function OnboardingTopBar({
  currentStep,
  totalSteps = ONBOARDING_TOTAL_STEPS,
  progressFillPercent,
  className = '',
}: OnboardingTopBarProps) {
  const router = useRouter()
  const pct =
    progressFillPercent ??
    onboardingProgressPercent(currentStep, totalSteps)

  return (
    <div className={`w-full shrink-0 ${className}`}>
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white transition-colors hover:bg-white/10"
          aria-label="Voltar"
        >
          <ChevronLeft className="h-6 w-6" strokeWidth={2} />
        </button>
        <div className="flex min-w-0 flex-1 justify-center">
          <div className="mx-auto w-full max-w-3xl">
            <div className="h-[5px] w-full overflow-hidden rounded-full bg-[#2a2a31]">
              <div
                className="h-full rounded-full bg-blue-gradient-500 shadow-[0_0_12px_rgba(184,230,46,0.35)] transition-[width] duration-500 ease-out motion-reduce:transition-none"
                style={{ width: `${pct}%` }}
                role="progressbar"
                aria-valuenow={currentStep}
                aria-valuemin={1}
                aria-valuemax={totalSteps}
                aria-label={`Etapa ${currentStep} de ${totalSteps}`}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
