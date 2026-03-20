'use client'

import { Briefcase } from '@phosphor-icons/react'
import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  carouselHeaderNavButtonClassName,
} from '@/components/ui/carousel'
import { CarouselSectionHeader } from '@/components/ui/carousel-section-header'
import Image, { type StaticImageData } from 'next/image'

import patternsIcon from '../../../../public/patterns-course-icon.svg'
import reactIcon from '../../../../public/react-course-icon.svg'
import tailwindIcon from '../../../../public/tailwind-course-icon.svg'

type CategorySlide = {
  id: string
  title: string
  icon: StaticImageData
}

const CATEGORIES: CategorySlide[] = [
  { id: 'front-end', title: 'Front-end', icon: reactIcon },
  { id: 'back-end', title: 'Back-end', icon: patternsIcon },
  { id: 'design', title: 'Design', icon: tailwindIcon },
  { id: 'full-stack', title: 'Full-stack', icon: tailwindIcon },
]

export type CategoriesCarouselProps = {
  /** Na home: cabeçalho "Carreiras" + botões ◀ ▶ à direita. */
  variant?: 'default' | 'carreiras'
}

export function CategoriesCarousel({
  variant = 'default',
}: CategoriesCarouselProps) {
  const showCareersHeader = variant === 'carreiras'

  return (
    <div className="relative w-full min-w-0">
      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        {showCareersHeader && (
          <CarouselSectionHeader
            className="pb-4 pt-2"
            icon={
              <Briefcase
                weight="fill"
                size={16}
                className="text-[#eceeef]"
                aria-hidden
              />
            }
            title="Carreiras"
            actions={
              <>
                <CarouselPrevious
                  variant="ghost"
                  aria-label="Categorias anteriores"
                  className={carouselHeaderNavButtonClassName}
                />
                <CarouselNext
                  variant="ghost"
                  aria-label="Próximas categorias"
                  className={carouselHeaderNavButtonClassName}
                />
              </>
            }
          />
        )}

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-20 bg-gradient-to-l from-surface via-surface/60 to-transparent sm:w-32 lg:w-40" />

          <CarouselContent className="-ml-4">
            {CATEGORIES.map((category) => (
              <CarouselItem
                key={category.id}
                className={
                  'pl-4 flex-[0_0_82%] min-w-0 sm:flex-[0_0_46%] md:min-w-[214px] md:max-w-[214px] md:flex-[0_0_214px]'
                }
              >
                <Card className="flex w-full max-w-full flex-col items-center justify-center rounded-[20px] bg-gray-gradient md:max-w-[214px]">
                  <div className="p-4">
                    <span className="text-[20px] font-semibold text-white">
                      {category.title}
                    </span>
                  </div>
                  <Image
                    src={category.icon}
                    alt={`Ilustração da categoria ${category.title}`}
                  />
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
