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
import type { CourseWithCount } from '@/types/user-course.ts'
import { cn } from '@/lib/utils'
import { CatalogCard } from './catalog-card'

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

export type CarouselSectionProps = {
    courses: CourseWithCount[]
    sectionTitle?: string
    /** Cabeçalho com título + ações (ex. setas), renderizado dentro do `Carousel`. */
    header?: ReactNode
}

export function CarouselSection({ courses, header, sectionTitle }: CarouselSectionProps) {
    const hasHeader = Boolean(header)
    const showTopNav = !hasHeader

    return (
        <div
            className={cn(
                'relative min-w-0',
                hasHeader || sectionTitle ? 'pt-0' : 'pt-6',
            )}
        >
            <Carousel
                opts={{
                    align: 'start',
                    loop: false,
                }}
                className="w-full"
            >
                {header}

                {showTopNav ? (
                    <div
                        className={cn(
                            'mb-4 flex items-center gap-4 pr-6 lg:pr-0',
                            sectionTitle ? 'justify-between' : 'justify-end',
                        )}
                    >
                        {sectionTitle ? (
                            <span className="text-sm font-semibold text-[#E0E0EE]">
                                {sectionTitle}
                            </span>
                        ) : null}
                        <div className="flex shrink-0 items-center gap-2">
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
                    </div>
                ) : null}

                <div className="relative min-w-0">
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

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
                                    className="basis-[85%] flex-shrink-0 pl-4 sm:basis-[316px]"
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
