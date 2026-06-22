'use client'

import type { ReactNode } from 'react'
import { Briefcase } from '@phosphor-icons/react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  carouselHeaderNavButtonClassName,
} from '@/components/ui/carousel'
import { CarouselSectionHeader } from '@/components/ui/carousel-section-header'
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
  sectionIcon?: ReactNode
  titleRowClassName?: string
}

const defaultSectionIcon = (
  <Briefcase weight="fill" size={16} className="text-[#eceeef]" aria-hidden />
)

export function CareerTracksSection({
  tracks,
  sectionTitle,
  sectionIcon,
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
          <CarouselSectionHeader
            className={cn('mb-5', titleRowClassName)}
            icon={sectionIcon ?? defaultSectionIcon}
            title={sectionTitle}
            actions={
              <>
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
              </>
            }
          />
        ) : null}

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

          {!showHeader ? (
            <>
              <CarouselPrevious
                hideWhenDisabled
                className="left-0 top-1/2 z-20 h-[42px] w-[42px] -translate-y-1/2 border-[#25252A] bg-surface/80 text-white hover:bg-[#25252A]"
              />
              <CarouselNext
                hideWhenDisabled
                className="right-0 top-1/2 z-20 h-[42px] w-[42px] -translate-y-1/2 border-[#25252A] bg-surface/80 text-white hover:bg-[#25252A]"
              />
            </>
          ) : null}

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
