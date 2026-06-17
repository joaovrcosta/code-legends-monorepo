import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import { NewContentCard } from './new-content-card'

export function NewContentCaroussel() {
  return (
    <div className="relative isolate min-w-0">
      <Carousel
        opts={{
          align: 'start',
        }}
      >
        <CarouselContent className="-ml-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <CarouselItem
              key={index}
              className="basis-[85%] pl-4 lg:basis-[90%]"
            >
              <NewContentCard />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
