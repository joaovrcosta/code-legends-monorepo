'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  carouselHeaderNavButtonClassName,
} from '@/components/ui/carousel'
import { cn } from '@/lib/utils'
import { CareerTrackCard } from './career-track-card'

export type CareerTrack = {
  id: string
  title: string
  href: string
  badge?: string
  pills?: string[]
  level?: string
  iconUrl?: string | null
  thumbnailUrl?: string | null
  colorHex?: string | null
  modulesCount?: number
}

type CareerTracksSectionProps = {
  tracks: CareerTrack[]
  sectionTitle?: string
  titleRowClassName?: string
}

export function CareerTracksSection({
  tracks,
  sectionTitle,
  titleRowClassName,
}: CareerTracksSectionProps) {
  const showHeader = Boolean(sectionTitle)

  return (
    <div
      className={cn(
        'relative min-w-0 overflow-x-hidden',
        showHeader ? 'pb-2' : 'pb-0',
      )}
    >
      <Carousel opts={{ align: 'start', loop: false }} className="w-full">
        {showHeader ? (
          <div
            className={cn(
              'mb-5 flex items-center justify-between gap-4 pr-6 lg:pr-0',
              titleRowClassName,
            )}
          >
            <span className="text-sm font-semibold text-[#666]">
              {sectionTitle}
            </span>
            <div className="flex shrink-0 items-center gap-2">
              <CarouselPrevious
                variant="ghost"
                hideWhenDisabled
                aria-label="Anterior"
                className={carouselHeaderNavButtonClassName}
              />
              <CarouselNext
                variant="ghost"
                hideWhenDisabled
                aria-label="Próximo"
                className={carouselHeaderNavButtonClassName}
              />
            </div>
          </div>
        ) : null}

          {!showHeader ? (
            <div className="mb-4 flex items-center justify-end gap-2 pr-6 lg:pr-0">
              <CarouselPrevious
                variant="ghost"
                hideWhenDisabled
                aria-label="Anterior"
                className={carouselHeaderNavButtonClassName}
              />
              <CarouselNext
                variant="ghost"
                hideWhenDisabled
                aria-label="Próximo"
                className={carouselHeaderNavButtonClassName}
              />
            </div>
          ) : null}

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

          <CarouselContent className="-ml-4">
            {tracks.map((track) => (
              <CarouselItem
                key={track.id}
                className="basis-[88%] pl-4 sm:basis-[380px]"
              >
                <CareerTrackCard
                  title={track.title}
                  href={track.href}
                  badge={track.badge}
                  pills={track.pills}
                  level={track.level}
                  iconUrl={track.iconUrl}
                  thumbnailUrl={track.thumbnailUrl}
                  colorHex={track.colorHex}
                  modulesCount={track.modulesCount}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
