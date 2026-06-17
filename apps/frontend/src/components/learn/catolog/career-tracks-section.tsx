'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { CareerTrackCard } from './career-track-card'

export type CareerTrack = {
  id: string
  title: string
  href: string
  badge?: string
  pills?: string[]
  level?: string
}

export function CareerTracksSection({ tracks }: { tracks: CareerTrack[] }) {
  return (
    <div className="relative min-w-0 overflow-x-hidden">
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

      <Carousel opts={{ align: 'start' }}>
        <CarouselContent className="w-full ml-0 gap-4">
          {tracks.map((t) => (
            <CarouselItem
              key={t.id}
              className="pl-0 basis-[92%] sm:basis-[420px] lg:basis-[520px]"
            >
              <CareerTrackCard
                title={t.title}
                href={t.href}
                badge={t.badge}
                pills={t.pills}
                level={t.level}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}

