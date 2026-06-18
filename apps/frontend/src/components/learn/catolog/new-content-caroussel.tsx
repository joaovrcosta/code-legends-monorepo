'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { NewContentCard } from './new-content-card'

const SLIDES = [1, 2, 3, 4, 5]

/** Largura do 1º slide — manter em sync com o header de filtros */
export const NOVIDADES_FIRST_SLIDE_WIDTH_CLASS = 'max-w-[92.5%]' as const
export const NOVIDADES_SLIDE_BASIS_CLASS = 'basis-[92.5%]' as const

export function NewContentCaroussel() {
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
        <div className="relative min-w-0 w-full">
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
