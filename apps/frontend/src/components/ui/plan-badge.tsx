import { Lightning } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'

export type PlanBadgePlan = 'PRO' | 'PREMIUM' | string | null | undefined

type PlanBadgeProps = {
  plan?: PlanBadgePlan
  className?: string
}

const BADGE_BY_PLAN = {
  PRO: {
    label: 'PRO',
    gradientClass: 'bg-pro-plan-gradient',
  },
  PREMIUM: {
    label: 'PREMIUM',
    gradientClass: 'bg-premium-gradient',
  },
} as const

function normalizePlan(plan?: PlanBadgePlan): keyof typeof BADGE_BY_PLAN | null {
  const value = String(plan ?? '').toUpperCase()
  if (value === 'PRO' || value === 'PREMIUM') return value
  return null
}

export function PlanBadge({ plan, className }: PlanBadgeProps) {
  const normalized = normalizePlan(plan)
  if (!normalized) return null

  const { label, gradientClass } = BADGE_BY_PLAN[normalized]

  return (
    <div
      className={cn(
        'inline-flex h-[18px] shrink-0 items-center gap-0.5 italic rounded-full px-1.5',
        'text-sm font-semibold leading-none tracking-wide text-white',
        gradientClass,
        className,
      )}
      aria-label={`Plano ${label}`}
    >
      <span className="uppercase">{label}</span>
      <Lightning size={12} weight="fill" className="shrink-0 text-white" />
    </div>
  )
}
