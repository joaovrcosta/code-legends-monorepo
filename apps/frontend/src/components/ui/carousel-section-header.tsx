'use client'

import type { ReactNode } from 'react'

import { cn } from '@/lib/utils'

export type CarouselSectionHeaderProps = {
  icon: ReactNode
  title: ReactNode
  titleVariant?: 'featured' | 'muted'
  actions?: ReactNode
  className?: string
}

const titleVariantClass: Record<
  NonNullable<CarouselSectionHeaderProps['titleVariant']>,
  string
> = {
  featured: 'text-base font-semibold text-[#eceeef]',
  muted: 'text-base font-semibold text-muted-foreground',
}

export function CarouselSectionHeader({
  icon,
  title,
  titleVariant = 'muted',
  actions,
  className,
}: CarouselSectionHeaderProps) {
  return (
    <div
      className={cn(
        'flex w-full items-center justify-between gap-4 pr-6 lg:pr-0',
        className,
      )}
    >
      <div className="flex min-w-0 items-center gap-2">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[#25252A] bg-gray-gradient">
          {icon}
        </div>
        <span className={cn('min-w-0', titleVariantClass[titleVariant])}>
          {title}
        </span>
      </div>
      {actions != null ? (
        <div className="flex h-8 min-w-[8rem] shrink-0 items-center justify-end gap-2">
          {actions}
        </div>
      ) : null}
    </div>
  )
}
