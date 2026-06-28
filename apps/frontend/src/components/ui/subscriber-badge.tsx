'use client'

import * as React from 'react'
import { Lightning } from '@phosphor-icons/react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
export const SUBSCRIBER_BADGE_LABEL = 'Exclusivo' as const
export const PREMIUM_BADGE_LABEL = 'Premium' as const

export const subscriberBadgeVariants = cva(
  'inline-flex shrink-0 items-center gap-1 rounded-full font-semibold uppercase tracking-wide text-white',
  {
    variants: {
      variant: {
        exclusive:
          'border border-[#00C8FF]/20 bg-subscriber-gradient',
        premium: 'border border-orange-500/35 bg-premium-gradient',
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
} as const

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
