'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { NewContentCard } from './new-content-card'

const SLIDES = [1, 2, 3, 4, 5]

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
                className="basis-[92.5%] pl-4 sm:basis-[92.5%] lg:basis-[92.5%]"
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
