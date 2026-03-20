'use client'

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
import { NewsBanner } from './news-banner'

export type NewsBannerCarouselProps = {
  /** Na home: cabeçalho "Novidades" + botões ◀ ▶ à direita (igual Carreiras). */
  variant?: 'default' | 'novidades'
}

export function NewsBannerCarousel({
  variant = 'default',
}: NewsBannerCarouselProps) {
  const showNovidadesHeader = variant === 'novidades'

  return (
    <div className="relative w-full min-w-0">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        {showNovidadesHeader && (
          <CarouselSectionHeader
            className="mb-4"
            icon={
              <Briefcase
                weight="fill"
                size={16}
                className="text-[#eceeef]"
                aria-hidden
              />
            }
            title="Novidades"
            actions={
              <>
                <CarouselPrevious
                  variant="ghost"
                  aria-label="Novidade anterior"
                  className={carouselHeaderNavButtonClassName}
                />
                <CarouselNext
                  variant="ghost"
                  aria-label="Próxima novidade"
                  className={carouselHeaderNavButtonClassName}
                />
              </>
            }
          />
        )}

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-surface via-surface/60 to-transparent sm:w-32 lg:w-40" />

          <CarouselContent className="-ml-4">
            {[1, 2, 3].map((item) => (
              <CarouselItem
                key={item}
                className="basis-[85%] pl-4 sm:basis-[85%] lg:basis-[85%]"
              >
                <NewsBanner />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
