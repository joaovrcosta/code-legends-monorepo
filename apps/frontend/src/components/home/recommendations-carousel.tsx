"use client"

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import type { CourseWithCount } from "@/types/user-course.ts"
import { CatalogCard } from "./catalog-card"
import { useSession } from "next-auth/react"

// Função para mapear level para color
const getColorByLevel = (level: string): string => {
  const normalized = (level ?? '')
    .toString()
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  switch (normalized) {
    case 'beginner':
    case 'iniciante':
      return 'blue'
    case 'intermediate':
    case 'intermediario':
      return 'lime'
    case 'advanced':
    case 'avancado':
      return 'orange'
    default:
      return 'gray'
  }
}

export function RecommendationsCarousel({
  courses,
}: {
  courses: CourseWithCount[]
}) {
  const { data, status } = useSession()
  const plan = (data?.user as { plan?: "FREE" | "PRO" | "PREMIUM" } | undefined)?.plan
  const isFreeUser =
    status === "loading" ? undefined : plan === "FREE" ? true : plan ? false : undefined

  return (
    <div className="relative overflow-y-visible overflow-x-hidden pt-6 pb-0">
      <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-[#121214] to-transparent" />

      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        <CarouselPrevious
          hideWhenDisabled
          className="h-[42px] w-[42px] left-0 top-1/2 z-20 -translate-y-1/2 border-[#25252A] bg-[#121214]/80 hover:bg-[#25252A] text-white"
        />
        <CarouselNext
          hideWhenDisabled
          className="h-[42px] w-[42px] right-0 top-1/2 z-20 -translate-y-1/2 border-[#25252A] bg-[#121214]/80 hover:bg-[#25252A] text-white"
        />
        <CarouselContent className="-ml-4">
          {courses.map((course, index) => {
            const position =
              index === 0
                ? 'first'
                : index === courses.length - 1
                  ? 'last'
                  : 'middle'

            return (
              <CarouselItem
                key={course.id}
                className="pl-4 basis-[85%] sm:basis-[316px] flex-shrink-0"
              >
                <CatalogCard
                  name={course.title}
                  icon={course.icon || ""}
                  thumbnail={course.thumbnail || ""}
                  url={`/learn/paths/${course.slug}`}
                  color={getColorByLevel(course.level)}
                  status="not-started"
                  isCurrent={false}
                  tags={course.tags}
                  courseId={course.id}
                  level={course.level}
                  isFree={course.isFree}
                  position={position}
                  isFreeUser={isFreeUser}
                  progress={course.progress}
                />
              </CarouselItem>
            )
          })}
        </CarouselContent>
      </Carousel>
    </div>
  )
}
