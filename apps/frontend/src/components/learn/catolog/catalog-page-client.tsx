'use client'

import { useMemo } from 'react'
import type { CourseWithCount } from '@/types/user-course.ts'
import { CatalogCoursesGrid } from '@/components/learn/catolog/catalog-courses-grid'
import { CatalogCoursesCarousel } from '@/components/home/catalog-courses-carousel'
import {
  getFreeCourses,
  getTrendingCourses,
} from '@/lib/catalog-filter-utils'

type CatalogPageClientProps = {
  courses: CourseWithCount[]
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-8 pb-4 pt-2">
      <span className="text-[14px] font-semibold text-muted-foreground">
        {children}
      </span>
    </div>
  )
}

export function CatalogPageClient({ courses }: CatalogPageClientProps) {
  const trendingCourses = useMemo(() => getTrendingCourses(courses), [courses])
  const freeCourses = useMemo(() => getFreeCourses(courses), [courses])

  return (
    <div className="w-full min-w-0 pb-8">
      <section className="mb-8">
        <CatalogCoursesCarousel
          courses={trendingCourses}
          sectionTitle="Em alta"
        />
      </section>

      <section>
        <SectionTitle>Acesse gratuitamente</SectionTitle>
        <CatalogCoursesGrid
          courses={freeCourses}
          emptyMessage="Nenhum curso gratuito disponível no momento."
        />
      </section>
    </div>
  )
}
