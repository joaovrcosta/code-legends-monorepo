'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { CareerTrackCard } from './career-track-card'

type CareerTrack = {
  id: string
  title: string
  href: string
  badge?: string
  pills?: string[]
  level?: string
}

const TRACKS: CareerTrack[] = [
  {
    id: 'full-stack',
    title: 'Full-stack',
    href: '/learn/catalog',
    badge: 'Para assinantes',
    pills: ['Hard skills', 'Soft skills', 'Projetos', 'Mentoria'],
    level: 'INTERMEDIARIO',
  },
  {
    id: 'front-end',
    title: 'Front-end',
    href: '/learn/catalog',
    badge: 'Para assinantes',
    pills: ['React', 'CSS', 'Acessibilidade', 'Portfólio'],
    level: 'INICIANTE',
  },
  {
    id: 'back-end',
    title: 'Back-end',
    href: '/learn/catalog',
    badge: 'Para assinantes',
    pills: ['React', 'CSS', 'Acessibilidade', 'Portfólio'],
    level: 'AVANCADO',
  },
  {
    id: 'designer',
    title: 'Designer',
    href: '/learn/catalog',
    badge: 'Para assinantes',
    pills: ['React', 'CSS', 'Acessibilidade', 'Portfólio'],
    level: 'INICIANTE',
  },
]

export function CareerTracksSection() {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

      <Carousel opts={{ align: 'start' }}>
        <CarouselContent className="w-full ml-0 gap-4">
          {TRACKS.map((t) => (
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

