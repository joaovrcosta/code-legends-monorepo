'use client'

import { useCallback, useRef, useState } from 'react'
import { NewContentCaroussel, NOVIDADES_FIRST_SLIDE_WIDTH_CLASS } from '@/components/learn/catolog/new-content-caroussel'
import { CategoriesCarousel } from '@/components/learn/catolog/categories-carousel'
import {
  CareerTracksSection,
  type CareerTrack,
} from '@/components/learn/catolog/career-tracks-section'
import {
  CatalogFilterHeader,
  type CatalogQuickTab,
} from '@/components/learn/catolog/catalog-filter-header'
import { CatalogPageClient } from '@/components/learn/catolog/catalog-page-client'
import type { CourseWithCount } from '@/types/user-course.ts'

type CatalogPageContentProps = {
  courses: CourseWithCount[]
  tracks: CareerTrack[]
}

export function CatalogPageContent({ courses, tracks }: CatalogPageContentProps) {
  const [activeTab, setActiveTab] = useState<CatalogQuickTab>('all')
  const novidadesRef = useRef<HTMLDivElement>(null)
  const carreirasRef = useRef<HTMLDivElement>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  const handleTabChange = useCallback((tab: CatalogQuickTab) => {
    setActiveTab(tab)

    switch (tab) {
      case 'news':
        novidadesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'free':
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'careers':
        carreirasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'all':
      default:
        window.scrollTo({ top: 0, behavior: 'smooth' })
        break
    }
  }, [])

  return (
    <div className="w-full min-w-0">
      <CatalogFilterHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        className={NOVIDADES_FIRST_SLIDE_WIDTH_CLASS}
      />

      <div ref={novidadesRef} className="w-full mb-12">
        <NewContentCaroussel sectionTitle="Novidades" />
      </div>

      <div className="w-full pb-12">
        <CategoriesCarousel sectionTitle="Categorias" />
      </div>

      <div ref={carreirasRef} className="w-full pb-2">
        <CareerTracksSection
          tracks={tracks}
          sectionTitle="Trilhas de carreira"
        />
      </div>

      <div ref={catalogRef} className="mt-10 w-full min-w-0 pr-4 lg:pr-6">
        <CatalogPageClient courses={courses} />
      </div>
    </div>
  )
}
