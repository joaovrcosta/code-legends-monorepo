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
    <div className="relative min-w-0">
      <Carousel opts={{ align: 'start' }}>
        <CarouselContent className="-ml-4">
          {tracks.map((t) => (
            <CarouselItem
              key={t.id}
              className="basis-[92%] pl-4 sm:basis-[420px] lg:basis-[520px]"
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

