'use client'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { NewsBanner } from './news-banner'

export function NewsBannerCarousel() {
  return (
    <div className="relative w-full min-w-0">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
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
