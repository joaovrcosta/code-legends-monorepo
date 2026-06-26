import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

export const SUBSCRIBER_BADGE_LABEL = 'Exclusivo' as const

export const subscriberBadgeVariants = cva(
  'inline-flex shrink-0 items-center border border-[#00C8FF]/20 rounded-full bg-subscriber-gradient font-semibold uppercase tracking-wide text-white',
  {
    variants: {
      size: {
        sm: 'px-2.5 py-1 text-[9px]',
        md: 'px-2.5 py-1 text-[10px]',
      },
    },
    defaultVariants: {
      size: 'md',
    },
  },
)

export type SubscriberBadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof subscriberBadgeVariants> & {
    label?: string
  }

export function SubscriberBadge({
  className,
  size,
  label = SUBSCRIBER_BADGE_LABEL,
  ...props
}: SubscriberBadgeProps) {
  return (
    <span
      className={cn(subscriberBadgeVariants({ size }), className)}
      {...props}
    >
      {label}
    </span>
  )
}
