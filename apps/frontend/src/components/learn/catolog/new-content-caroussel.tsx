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
import { NewContentCard } from './new-content-card'

const SLIDES = [1, 2, 3, 4, 5]

/** Largura do 1º slide — manter em sync com o header de filtros */
export const NOVIDADES_FIRST_SLIDE_WIDTH_CLASS = 'max-w-[92.5%]' as const
export const NOVIDADES_SLIDE_BASIS_CLASS = 'basis-[92.5%]' as const

type NewContentCarousselProps = {
  sectionTitle?: string
  titleRowClassName?: string
}

export function NewContentCaroussel({
  sectionTitle,
  titleRowClassName,
}: NewContentCarousselProps) {
  const showHeader = Boolean(sectionTitle)

  return (
    <div className="relative w-full min-w-0">
      <Carousel
        opts={{
          loop: false,
          // 1º slide: colado à esquerda, sem peek à esquerda
          // Demais: centralizado, peek dos dois lados ao deslizar
          align: (viewSize, snapSize, index) =>
            index === 0 ? 0 : (viewSize - snapSize) / 2,
        }}
        className="w-full"
      >
        {showHeader ? (
          <div
            className={cn(
              'mb-4 flex items-center justify-between gap-4 pr-6 lg:pr-0',
              titleRowClassName,
            )}
          >
            <span className="text-sm font-semibold text-[#E0E0EE]">
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

        <div className="relative min-w-0 w-full">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

          <CarouselContent className="-ml-4">
            {SLIDES.map((item) => (
              <CarouselItem
                key={item}
                className={`${NOVIDADES_SLIDE_BASIS_CLASS} pl-4`}
              >
                <NewContentCard />
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
