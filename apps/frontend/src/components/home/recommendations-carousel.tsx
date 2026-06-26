'use client'

import type { ReactNode } from 'react'

import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  carouselHeaderNavButtonClassName,
} from '@/components/ui/carousel'
import { CarouselSectionHeader } from '@/components/ui/carousel-section-header'
import type { CourseWithCount } from '@/types/user-course.ts'
import { cn } from '@/lib/utils'
import { CatalogCard } from './catalog-card'
import { CodeBlock } from '@phosphor-icons/react'
import { useSession } from 'next-auth/react'

const defaultHeaderIcon = (
  <CodeBlock weight="fill" size={16} className="text-[#eceeef]" aria-hidden />
)

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

export type RecommendationsCarouselProps = {
  courses: CourseWithCount[]
  sectionTitle?: string
  titleRowClassName?: string
  sectionIcon?: ReactNode
}

export function RecommendationsCarousel({
  courses,
  sectionTitle,
  titleRowClassName,
  sectionIcon,
}: RecommendationsCarouselProps) {
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

  const inlineHeader = Boolean(sectionTitle)

  return (
    <div
      className={cn(
        'relative min-w-0 overflow-visible pb-16',
        inlineHeader ? 'pt-0' : 'pt-6',
      )}
    >
      <Carousel
        opts={{
          align: 'start',
          loop: false,
        }}
        className="w-full"
      >
        {inlineHeader && (
          <CarouselSectionHeader
            className={cn('mb-4 pb-0', titleRowClassName)}
            icon={sectionIcon ?? defaultHeaderIcon}
            title={sectionTitle}
            actions={
              <>
                <CarouselPrevious
                  variant="ghost"
                  hideWhenDisabled
                  aria-label="Anterior"
                  className={carouselHeaderNavButtonClassName}
                />
                <CarouselNext
                  variant="ghost"
                  hideWhenDisabled
                  aria-label="Próximo"
                  className={carouselHeaderNavButtonClassName}
                />
              </>
            }
          />
        )}

          {!inlineHeader && (
            <div className="mb-4 flex items-center justify-end gap-2 pr-6 lg:pr-0">
              <CarouselPrevious
                variant="ghost"
                hideWhenDisabled
                aria-label="Anterior"
                className={carouselHeaderNavButtonClassName}
              />
              <CarouselNext
                variant="ghost"
                hideWhenDisabled
                aria-label="Próximo"
                className={carouselHeaderNavButtonClassName}
              />
            </div>
          )}

        <div className="relative min-w-0">
          <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

          <CarouselContent>
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
                  className="basis-[85%] flex-shrink-0 sm:basis-[316px]"
                >
                  <CatalogCard
                    name={course.title}
                    icon={course.icon || ''}
                    thumbnail={course.thumbnail || ''}
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
        </div>
      </Carousel>
    </div>
  )
}
