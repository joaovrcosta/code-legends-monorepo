import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { NewContentCard } from "./new-content-card";

export function NewContentCaroussel() {
  return (
    <div className="relative">
      {/* Fade esquerda */}
      <div className="pointer-events-none absolute left-0 top-0 h-full xl:w-12 w-0 bg-gradient-to-r from-[#121214] to-transparent z-10" />

      {/* Fade right */}
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#121214] to-transparent z-10" />

      <Carousel>
        <CarouselContent className="-ml-4">
          {[1, 2, 3, 4, 5].map((_, index) => (
            <CarouselItem
              key={index}
              className={`lg:basis-[90%] basis-[85%] lg:pr-4 pr-2 ${
                index === 0 ? "lg:pl-[100px] pl-4" : "pl-4"
              }`}
            >
              <NewContentCard />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
