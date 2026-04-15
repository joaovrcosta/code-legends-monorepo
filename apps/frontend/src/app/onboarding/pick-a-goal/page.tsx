'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateOnboarding } from '@/actions/user'
import { OnboardingTopBar } from '@/components/onboarding/onboarding-top-bar'
import {
  ONBOARDING_BAR_TRANSITION_MS,
  ONBOARDING_STEP,
  onboardingProgressPercent,
} from '@/components/onboarding/onboarding-constants'
import {
  Play,
  GraduationCap,
  Link as LinkIcon,
  Rocket,
  Settings,
  Target,
  type LucideIcon,
} from 'lucide-react'
import codeLegendsLogo from '../../../../public/loading-logo.svg'
import Image from 'next/image'


const GOALS: { id: string; label: string; icon: LucideIcon }[] = [
  {
    id: 'no-experience',
    label: 'Não tenho experiência e quero começar meus estudos em programação',
    icon: Play,
  },
  {
    id: 'master-fundamentals',
    label: 'Dominar os fundamentos da programação',
    icon: GraduationCap,
  },
  {
    id: 'change-career',
    label: 'Migrar de carreira para a área da programação',
    icon: LinkIcon,
  },
  {
    id: 'specialize',
    label: 'Me especializar em uma tecnologia',
    icon: Settings,
  },
]

export default function PickAGoalPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [barFill, setBarFill] = useState(() =>
    onboardingProgressPercent(ONBOARDING_STEP.goal),
  )
  const router = useRouter()

  const goCareers = () => {
    router.push('/onboarding/pick-a-goal/careers')
  }

  const animateThen = (fn: () => void) => {
    setBarFill(onboardingProgressPercent(ONBOARDING_STEP.career))
    window.setTimeout(fn, ONBOARDING_BAR_TRANSITION_MS)
  }

  const handleContinue = async () => {
    if (!selectedGoal) return

    const prevFill = barFill
    setBarFill(onboardingProgressPercent(ONBOARDING_STEP.career))

    try {
      setIsLoading(true)
      setError('')
      await updateOnboarding({ goal: selectedGoal })
      await new Promise((r) => setTimeout(r, ONBOARDING_BAR_TRANSITION_MS))
      goCareers()
    } catch (err) {
      setBarFill(prevFill)
      setError(
        err instanceof Error ? err.message : 'Erro ao salvar progresso',
      )
    } finally {
      setIsLoading(false)
    }
  }

  const handleSkip = () => {
    if (isLoading) return
    animateThen(goCareers)
  }

  return (
    <div className="relative flex min-h-0 flex-1 flex-col bg-[#0D0D12] max-w-3xl w-full mx-auto">
      <div className="relative z-10 flex min-h-0 flex-1 flex-col px-5 pb-10 pt-6 sm:px-8 lg:px-14 lg:pb-14 lg:pt-10">
        <OnboardingTopBar
          currentStep={ONBOARDING_STEP.goal}
          progressFillPercent={barFill}
        />

        <header className="mt-6 flex gap-4 sm:mt-10">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl">
            <Image src={codeLegendsLogo} alt="Code Legends" className="h-12 w-12" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="text-xl font-semibold leading-snug tracking-tight text-white sm:text-2xl">
              Qual sua meta com a programação?
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-white/60 sm:text-base">
              Conhecer seu objetivo nos ajuda a guiar melhor sua jornada de
              aprendizado.
            </p>
          </div>
        </header>

        {error ? (
          <div className="mt-6 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        ) : null}

        <div className="mt-8 grid flex-1 grid-cols-1 content-start gap-4 sm:grid-cols-2 sm:gap-5">
          {GOALS.map((goal) => {
            const Icon = goal.icon
            const isSelected = selectedGoal === goal.id
            return (
              <button
                key={goal.id}
                type="button"
                onClick={() => setSelectedGoal(goal.id)}
                disabled={isLoading}
                className={[
                  'flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-[20px] px-5 py-6 text-center transition-all duration-200 sm:min-h-[200px]',
                  isSelected
                    ? 'bg-gradient-to-br from-[#367f930f] via-[#00aad949] to-[#00abd9]'
                    : ' bg-[#16161c] hover:border-[#3d3d46] hover:bg-[#1a1a22]',
                  isLoading ? 'pointer-events-none opacity-50' : '',
                ].join(' ')}
              >
                <span
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-xl',
                    isSelected ? 'bg-white/15 text-white' : 'bg-[#25252a] text-white/90',
                  ].join(' ')}
                >
                  <Icon className="h-6 w-6" strokeWidth={2} />
                </span>
                <span
                  className={[
                    'text-sm leading-snug sm:text-[15px]',
                    isSelected ? 'font-semibold text-white' : 'font-medium text-white/90',
                  ].join(' ')}
                >
                  {goal.label}
                </span>
              </button>
            )
          })}
        </div>

        <footer className="mt-auto space-y-4 pt-10 flex flex-col items-center justify-center">
          <button
            type="button"
            onClick={handleContinue}
            disabled={!selectedGoal || isLoading}
            className="w-full rounded-full bg-[#ececee] max-w-[280px] mx-auto py-4 text-center text-base font-semibold text-[#0D0D12] transition-colors hover:bg-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            {isLoading ? 'Salvando…' : 'Continuar'}
          </button>
          <button
            type="button"
            onClick={handleSkip}
            disabled={isLoading}
            className="w-full text-center text-sm text-white/45 transition-colors hover:text-white/75 disabled:opacity-50"
          >
            Pular etapa
          </button>
        </footer>
      </div>
    </div>
  )
}
