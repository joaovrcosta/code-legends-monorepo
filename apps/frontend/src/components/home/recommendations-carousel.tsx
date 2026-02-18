"use client";

import {
    Carousel,
    CarouselContent,
    CarouselItem,
} from "@/components/ui/carousel";
import type { CourseWithCount } from "@/types/user-course.ts";
import { RecomendationCard } from "./recomendation-card";

// Função para mapear level para color
const getColorByLevel = (level: string): string => {
    const normalized = (level ?? "")
        .toString()
        .trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

    switch (normalized) {
        case "beginner":
        case "iniciante":
            return "blue";
        case "intermediate":
        case "intermediario":
            return "lime";
        case "advanced":
        case "avancado":
            return "orange";
        default:
            return "gray";
    }
};

export function RecommendationsCarousel({
    courses,
}: {
    courses: CourseWithCount[];
}) {
    return (
        <div className="relative">
            <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#121214] to-transparent z-10" />

            <Carousel
                opts={{
                    align: "start",
                    loop: false,
                }}
                className="w-full"
            >
                <CarouselContent className="-ml-4">
                    {courses.map((course) => (
                        <CarouselItem
                            key={course.id}
                            /* 1. pl-4: Mantém o espaçamento de 16px.
                                2. basis-[85%]: Em celulares muito pequenos, ocupa 85% da tela.
                                3. sm:basis-[316px]: A partir de telas "sm" (640px) ou maiores,
                                   o item trava em 316px (300px de conteúdo + 16px de padding).
                                   Isso garante que o card nunca passe de 300px visíveis.
                            */
                            className="pl-4 basis-[85%] sm:basis-[316px] flex-shrink-0"
                        >
                            <RecomendationCard
                                name={course.title}
                                image={course.icon || course.thumbnail || ""}
                                url={`/learn/paths/${course.slug}`}
                                color={getColorByLevel(course.level)}
                                status="not-started"
                                isCurrent={false}
                                tags={course.tags}
                                courseId={course.id}
                                level={course.level}
                                isFree={course.isFree}
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
            </Carousel>
        </div>
    );
}