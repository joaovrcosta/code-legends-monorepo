'use client'

import { useSession } from 'next-auth/react'
import type { CourseWithCount } from '@/types/user-course.ts'
import type { CareerTrack } from '@/components/learn/catolog/career-tracks-section'
import { CatalogCard } from '@/components/learn/catolog/catalog-card'
import { CareerTrackCard } from '@/components/learn/catolog/career-track-card'
import { cn } from '@/lib/utils'
import { normalizeLevel } from '@/lib/catalog-filter-utils'

const LEVEL_COLORS: Record<string, string> = {
  beginner: 'blue',
  intermediate: 'lime',
  advanced: 'orange',
}

function getColorByLevel(level: string): string {
  const normalized = normalizeLevel(level)
  return normalized ? LEVEL_COLORS[normalized] ?? 'gray' : 'gray'
}

type CatalogCoursesGridProps = {
  courses?: CourseWithCount[]
  tracks?: CareerTrack[]
  className?: string
  emptyMessage?: string
}

export function CatalogCoursesGrid({
  courses = [],
  tracks = [],
  className,
  emptyMessage = 'Nenhum resultado encontrado para os filtros selecionados.',
}: CatalogCoursesGridProps) {
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

  const isEmpty = courses.length === 0 && tracks.length === 0

  if (isEmpty) {
    return (
      <p className="py-8 text-center text-sm text-[#7c7c8a]">{emptyMessage}</p>
    )
  }

  return (
    <div
      className={cn(
        'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4',
        className,
      )}
    >
      {tracks.map((track) => (
        <div key={`career-${track.id}`} className="min-w-0 overflow-hidden">
          <CareerTrackCard
            title={track.title}
            href={track.href}
            badgeVariant={track.badgeVariant}
            pills={track.pills}
            level={track.level}
            iconUrl={track.iconUrl}
            thumbnailUrl={track.thumbnailUrl}
            colorHex={track.colorHex}
            modulesCount={track.modulesCount}
          />
        </div>
      ))}
      {courses.map((course) => (
        <div key={`course-${course.id}`} className="min-w-0 overflow-hidden">
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
            isFreeUser={isFreeUser}
            progress={course.progress}
            variant="grid"
          />
        </div>
      ))}
    </div>
  )
}
