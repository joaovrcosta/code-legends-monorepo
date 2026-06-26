'use client'

import type { ReactNode } from 'react'

import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel'
import type { CourseWithCount } from '@/types/user-course.ts'
import { cn } from '@/lib/utils'
import { CatalogCard } from './catalog-card'
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

export type CarouselSectionProps = {
    courses: CourseWithCount[]
    /** Cabeçalho com título + ações (ex. setas), renderizado dentro do `Carousel`. */
    header?: ReactNode
}

export function CarouselSection({ courses, header }: CarouselSectionProps) {
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

    const hasHeader = Boolean(header)

    return (
        <div
            className={cn(
                'relative min-w-0',
                hasHeader ? 'pt-0' : 'pt-6',
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

                <div className="relative min-w-0">
                    <div className="pointer-events-none absolute right-0 top-0 z-10 h-full w-12 bg-gradient-to-l from-surface to-transparent" />

                    {!hasHeader && (
                        <>
                            <CarouselPrevious
                                hideWhenDisabled
                                className="left-0 top-1/2 z-20 h-[42px] w-[42px] -translate-y-1/2 border-[#25252A] bg-surface/80 text-white hover:bg-[#25252A]"
                            />
                            <CarouselNext
                                hideWhenDisabled
                                className="right-0 top-1/2 z-20 h-[42px] w-[42px] -translate-y-1/2 border-[#25252A] bg-surface/80 text-white hover:bg-[#25252A]"
                            />
                        </>
                    )}

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
