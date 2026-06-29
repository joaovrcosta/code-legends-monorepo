'use client'

import { ExclusiveCatalogBadge } from '@/components/ui/subscriber-badge'
import { useUserPlan } from '@/hooks/use-user-plan'

type CatalogAccessBadgeProps = {
  isFree?: boolean
  freeLabelClassName?: string
  freeTextClassName?: string
}

export function CatalogAccessBadge({
  isFree,
  freeLabelClassName = 'bg-lime-500/10 border border-lime-500/20 rounded-full px-2 py-1',
  freeTextClassName = 'text-xs text-lime-400 font-semibold',
}: CatalogAccessBadgeProps) {
  const { isFree: isFreeUser } = useUserPlan()

  if (!isFreeUser) return null

  if (isFree) {
    return (
      <div className={freeLabelClassName}>
        <p className={freeTextClassName}>Gratuito</p>
      </div>
    )
  }

  return <ExclusiveCatalogBadge />
}
