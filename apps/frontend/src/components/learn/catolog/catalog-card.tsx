'use client'

import Image, { StaticImageData } from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { Check, Plus, Star } from '@phosphor-icons/react/dist/ssr'
import { enrollInCourse } from '@/actions/course'
import { useState } from 'react'
import { useEnrolledCoursesStore } from '@/stores/enrolled-courses-store'
import coverBackground from '../../../../public/cover-background.png'
import { LevelBars } from '@/components/course/level-bars'
import { CatalogAccessBadge } from '@/components/catalog/catalog-access-badge'

function EnrollButton({
    courseId,
    onEnrollSuccess,
}: {
    courseId?: string
    onEnrollSuccess?: () => void
}) {
    const [isLoading, setIsLoading] = useState(false)
    const userCourses = useEnrolledCoursesStore((state) => state.userCourses)
    const refreshEnrolledCourses = useEnrolledCoursesStore(
        (state) => state.refreshEnrolledCourses,
    )

    const isEnrolled = courseId
        ? userCourses.some((course) => course.courseId === courseId)
        : false

    const handleEnroll = async () => {
        if (!courseId || isLoading || isEnrolled) return

        try {
            setIsLoading(true)
            await enrollInCourse(courseId)
            onEnrollSuccess?.()

            await refreshEnrolledCourses()
        } catch (error) {
            console.error('Erro ao inscrever:', error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isEnrolled) {
        return (
            <div className="flex items-center justify-center w-8 h-8 rounded-full cursor-pointer hover:text-[#35BED5]">
                <Check size={20} className="text-green-500 hover:text-[#35BED5]" />
            </div>
        )
    }

    return (
        <button
            onClick={handleEnroll}
            disabled={!courseId || isLoading}
            className="bg-gray-gradient-first rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
            <div className="flex items-center justify-center w-8 h-8 hover:bg-[#25252A] rounded-full cursor-pointer hover:text-[#35BED5]">
                <Plus size={28} className="text-white hover:text-[#35BED5]" />
            </div>
        </button>
    )
}

function getStatusInfo(status?: RecomendationCardProps['status']) {
    switch (status) {
        case 'in-progress':
            return {
                label: 'Em progresso...',
                className: 'text-[#007e97]',
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
                    />
                ),
            }
        case 'completed':
            return {
                label: 'Concluído',
                className: 'text-green-600',
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
                    />
                ),
            }
        case 'career':
        case 'continue':
            return {
                label: 'Curso atual',
                className: 'text-white',
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
                    />
                ),
            }
        case 'not-started':
        default:
            return {
                label: 'Curso',
                className: 'text-gray-500',
                icon: (isFavorite?: boolean) => (
                    <Star
                        size={20}
                        weight="fill"
                        className={isFavorite ? 'text-[#35BED5]' : 'text-gray-600'}
                    />
                ),
            }
    }
}

interface RecomendationCardProps {
    name: string
    icon: string | StaticImageData
    thumbnail?: string | StaticImageData
    url: string
    color: string
    className?: string
    isCurrent?: boolean
    isFavorite?: boolean
    status?: 'in-progress' | 'completed' | 'not-started' | 'career' | 'continue'
    tags?: string[]
    courseId?: string
    onEnrollSuccess?: () => void
    level?: string
    isFree?: boolean
    position?: 'first' | 'middle' | 'last'
    progress?: number
    variant?: 'carousel' | 'grid'
}

export function CatalogCard({
    name,
    icon,
    url,
    status,
    className,
    isCurrent,
    courseId,
    onEnrollSuccess,
    level,
    isFree,
    position = 'middle',
    progress = 0,
    variant = 'carousel',
}: RecomendationCardProps) {
    const { label, className: statusClass } = getStatusInfo(status)
    const isGrid = variant === 'grid'
    const transformOriginClass =
        position === 'first'
            ? 'origin-left'
            : position === 'last'
                ? 'origin-right'
                : 'origin-center'
    return (
        <Link href={url} className="block h-full group">
            <div
                className={`relative z-0 overflow-hidden w-full h-full flex flex-col rounded-[16px] border shadow-2xl cursor-pointer
    transition-[border-color,box-shadow,transform] duration-300 ease-out
    ${isGrid
        ? 'md:hover:-translate-y-1 md:hover:border-[#3f3f48]'
        : `md:w-[314px] md:max-w-[314px] md:hover:border-[#3f3f48]
    md:hover:shadow-[0_20px_40px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06),inset_0_-24px_24px_rgba(255,255,255,0.03)]`}
    ${isCurrent
                        ? 'bg-blue-gradient-second border-[#35BED5]'
                        : 'bg-gray-gradient border-[#25252A]'
                    }
    ${transformOriginClass}
    ${className}`}
            >
                <Image
                    src={coverBackground}
                    alt="Background do Card"
                    fill
                    priority
                    className="object-cover absolute inset-0 opacity-80 pointer-events-none transition-transform duration-500 ease-out md:group-hover:scale-105"
                />

                {label && (
                    <div className="relative z-10 flex items-center justify-between rounded-t-[20px] pr-4 pl-4 pt-4 pb-0">
                        <div
                            className={`text-white ${statusClass} rounded-full px-2 border ${isCurrent ? 'border-white' : 'border-[#25252A]'
                                }`}
                        >
                            <p className="text-xs text-muted-foreground">{label}</p>
                        </div>
                        <CatalogAccessBadge isFree={isFree} />
                    </div>
                )}

                <div className="relative z-10 flex flex-col flex-1 p-4">
                    <Image src={icon} alt={name} width={80} height={80} />
                    <div className="px-3 pt-2">
                        <div className="flex items-center space-x-1">
                            <span
                                className={`font-semibold bg-clip-text text-base text-white line-clamp-2`}
                            >
                                {name}
                            </span>
                            <ArrowUpRight className="flex-shrink-0" />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 mt-2 flex items-center justify-between px-4 pb-4">
                    <div className="flex items-center gap-2 text-xs text-white">
                        <LevelBars level={level} isSmall={true} />
                    </div>

                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                        <div onClick={(e) => e.stopPropagation()}>
                            <EnrollButton
                                courseId={courseId}
                                onEnrollSuccess={onEnrollSuccess}
                            />
                        </div>
                    </div>
                </div>

                <div className="absolute bottom-0 left-0 w-full h-[4px] bg-white/10 z-20">
                    <div
                        className="h-full bg-blue-gradient-500 transition-all duration-700 ease-out"
                        style={{
                            width: `${(progress <= 1 ? progress * 100 : progress)}%`
                        }}
                    />
                </div>

            </div>
        </Link>
    )
}