"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import { NewsBanner } from "./news-banner";

export function NewsBannerCarousel() {
    return (
        <div className="relative w-full">
            {/* FADE NA DIREITA:
               - h-full: Garante que cubra toda a altura do banner.
               - w-20 até w-40: Aumentamos a largura do gradiente em telas maiores 
                 para uma transição mais elegante.
               - pointer-events-none: Essencial para não bloquear cliques nos botões do banner.
            */}
            <div className="pointer-events-none absolute right-0 top-0 h-full w-20 sm:w-32 lg:w-40 bg-gradient-to-l from-[#121214] via-[#121214]/60 to-transparent z-10" />

            <Carousel
                opts={{
                    align: "start",
                    loop: true, // Mantive o loop conforme seu código original
                }}
                className="w-full"
            >
                {/* -ml-4 anula o pl-4 do primeiro item para alinhar à esquerda */}
                <CarouselContent className="-ml-4">
                    {/* pl-4 mantém os 16px de distância entre banners */}
                    {[1, 2, 3].map((item) => (
                        <CarouselItem
                            key={item}
                            className="pl-4 basis-[85%] sm:basis-[85%] lg:basis-[85%]"
                        >
                            <NewsBanner />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}