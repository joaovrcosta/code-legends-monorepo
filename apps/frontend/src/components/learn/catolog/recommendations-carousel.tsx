'use client'

import { CatalogCard } from '@/components/home/catalog-card'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from '@/components/ui/carousel'
import type { CourseWithCount } from '@/types/user-course.ts'
import { useSession } from 'next-auth/react'

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
  const plan = (data?.user as { plan?: 'FREE' | 'PRO' | 'PREMIUM' } | undefined)
    ?.plan
  const isFreeUser =
    status === 'loading'
      ? undefined
      : plan === 'FREE'
        ? true
        : plan
          ? false
          : undefined
  return (
    <div className="relative">
      <div className="pointer-events-none absolute right-0 top-0 h-full w-12 bg-gradient-to-l from-[#121214] to-transparent z-10" />

      <Carousel>
        <CarouselContent className="w-full">
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
                className="md:basis-[48%] basis-[85%] lg:basis-[28%]"
              >
                <CatalogCard
                  name={course.title}
                  icon={course.icon || ''}
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
