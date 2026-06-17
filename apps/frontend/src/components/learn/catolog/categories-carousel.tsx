'use client'

import { Card } from '@/components/ui/card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import Image from 'next/image'

type CategorySlide = {
  id: string
  title: string
  icon: string
}

const CATEGORIES: CategorySlide[] = [
  { id: 'front-end', title: 'JavaScript', icon: "https://xesque.rocketseat.dev/platform/1724859112038.svg" },
  { id: 'reactjs', title: 'ReactJS', icon: "https://xesque.rocketseat.dev/platform/1724859367235.svg" },
  { id: 'design', title: 'Angular', icon: "https://xesque.rocketseat.dev/platform/1757013792759.svg" },
  { id: 'csharp', title: 'C#', icon: "https://xesque.rocketseat.dev/platform/1724859337625.svg" },
  { id: 'python', title: 'Python', icon: "https://xesque.rocketseat.dev/platform/1724859580254.svg" },
  { id: 'nodejs', title: 'NodeJS', icon: "https://xesque.rocketseat.dev/platform/1724859305154.svg" },
  { id: 'vue', title: 'VueJS', icon: "https://xesque.rocketseat.dev/platform/1765389099642.svg" },
  { id: 'native', title: 'React Native', icon: "https://xesque.rocketseat.dev/platform/1724859380835.svg" },
  { id: 'nodejs2', title: 'NodeJS', icon: "https://xesque.rocketseat.dev/platform/1724859305154.svg" },
]

export function CategoriesCarousel() {
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
          <CarouselContent className="-ml-4">
            {CATEGORIES.map((category) => (
              <CarouselItem
                key={category.id}
                className="basis-auto shrink-0 pl-4"
              >
                <Card className="flex w-full max-w-[200px] min-w-[200px] flex-col items-center justify-center rounded-[16px] bg-gray-gradient p-4 hover:bg-gray-gradient-first hover:border-[#3f3f48] hover:shadow-[0_30px_60px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06),inset_0_-24px_24px_rgba(255,255,255,0.03)] transition-all duration-300 cursor-pointer">
                  <Image
                    src={category.icon}
                    alt={`Ilustração da categoria ${category.title}`}
                    width={28}
                    height={28}
                  />
                  <div className="">
                    <span className="text-[14px] font-normal text-white">
                      {category.title}
                    </span>
                  </div>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </div>
      </Carousel>
    </div>
  )
}
