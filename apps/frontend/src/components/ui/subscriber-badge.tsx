'use client'

import * as React from 'react'
import { Lightning } from '@phosphor-icons/react'
import { cva, type VariantProps } from 'class-variance-authority'
import { UserPlan } from '@code-legends/shared-types'

import { cn } from '@/lib/utils'
import { useUserPlan } from '@/hooks/use-user-plan'
import {
  normalizeUserPlan,
  shouldShowCareerTrackPremiumBadge,
  shouldShowExclusiveCatalogBadge,
  shouldShowFreeUserPremiumUpsell,
} from '@/lib/user-plan'

export const SUBSCRIBER_BADGE_LABEL = 'Exclusivo' as const
export const PREMIUM_BADGE_LABEL = 'Premium' as const
export const PRO_BADGE_LABEL = 'PRO' as const

export const subscriberBadgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1 rounded-full font-semibold uppercase tracking-wide text-white',
  {
    variants: {
      variant: {
        exclusive: 'bg-subscriber-gradient',
        premium: 'bg-premium-gradient',
        pro: 'bg-pro-plan-gradient',
      },
      size: {
        sm: 'px-2.5 py-1 text-[10px]',
        md: 'px-2.5 py-1 text-[10px]',
      },
    },
    defaultVariants: {
      variant: 'exclusive',
      size: 'md',
    },
  },
)

export type SubscriberBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof subscriberBadgeVariants> & {
    label?: string
  }

const DEFAULT_LABEL_BY_VARIANT = {
  exclusive: SUBSCRIBER_BADGE_LABEL,
  premium: PREMIUM_BADGE_LABEL,
  pro: PRO_BADGE_LABEL,
} as const

export type UserPlanSubscriberBadgePlan =
  | 'FREE'
  | 'PRO'
  | 'PREMIUM'
  | string
  | null
  | undefined

/** Badge de plano do usuário — sempre visível para PRO e PREMIUM (perfil, menu). */
export function UserPlanSubscriberBadge({
  plan,
  className,
  size,
}: {
  plan?: UserPlanSubscriberBadgePlan
  className?: string
  size?: VariantProps<typeof subscriberBadgeVariants>['size']
}) {
  const { plan: planFromContext } = useUserPlan()
  const resolvedPlan = normalizeUserPlan(plan ?? planFromContext)
  if (resolvedPlan === UserPlan.FREE) return null

  return (
    <SubscriberBadge
      variant={resolvedPlan === UserPlan.PREMIUM ? 'premium' : 'pro'}
      size={size}
      className={className}
    />
  )
}

/** Badge Premium em cards de trilha de carreira (FREE e PRO). */
export function CareerTrackPremiumBadge({
  className,
  size,
  variant = 'premium',
}: {
  className?: string
  size?: VariantProps<typeof subscriberBadgeVariants>['size']
  variant?: 'exclusive' | 'premium'
}) {
  const { plan } = useUserPlan()
  if (!shouldShowCareerTrackPremiumBadge(plan)) return null

  return (
    <SubscriberBadge variant={variant} size={size} className={className} />
  )
}

/** Badge Premium para upsell em banner de carreira e Path Units (apenas FREE). */
export function FreeUserPremiumUpsellBadge({
  className,
  size,
}: {
  className?: string
  size?: VariantProps<typeof subscriberBadgeVariants>['size']
}) {
  const { plan } = useUserPlan()
  if (!shouldShowFreeUserPremiumUpsell(plan)) return null

  return (
    <SubscriberBadge variant="premium" size={size} className={className} />
  )
}

/** Badge Exclusivo em conteúdo pago do catálogo (apenas FREE). */
export function ExclusiveCatalogBadge({
  className,
  size,
}: {
  className?: string
  size?: VariantProps<typeof subscriberBadgeVariants>['size']
}) {
  const { plan } = useUserPlan()
  if (!shouldShowExclusiveCatalogBadge(plan)) return null

  return (
    <SubscriberBadge variant="exclusive" size={size} className={className} />
  )
}

export function SubscriberBadge({
  className,
  size,
  variant = 'exclusive',
  label,
  ...props
}: SubscriberBadgeProps) {
  const resolvedLabel =
    label ?? DEFAULT_LABEL_BY_VARIANT[variant ?? 'exclusive']

  return (
    <span
      className={cn(subscriberBadgeVariants({ size, variant }), className)}
      {...props}
    >
      <Lightning
        size={12}
        weight="fill"
        className="shrink-0 text-white"
        aria-hidden
      />
      {resolvedLabel}
    </span>
  )
}
