"use client";

import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import { CatalogCard } from "@/components/course/catalog-card";
import type { CourseWithCount } from "@/types/user-course.ts";

// Função para mapear level para color
const getColorByLevel = (level: string): string => {
  switch (level) {
    case "beginner":
      return "blue";
    case "intermediate":
      return "lime";
    case "advanced":
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

      <Carousel>
        <CarouselContent className="w-full">
          {courses.map((course) => (
            <CarouselItem
              key={course.id}
              className="md:basis-[48%] basis-[85%] lg:basis-[28%]"
            >
              <CatalogCard
                name={course.title}
                image={course.icon || course.thumbnail}
                url={`/learn/paths/${course.slug}`}
                color={getColorByLevel(course.level)}
                status="not-started"
                isCurrent={false}
                tags={course.tags}
                courseId={course.id}
                isEnrolled={course.isEnrolled}
                level={course.level}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </div>
  );
}
