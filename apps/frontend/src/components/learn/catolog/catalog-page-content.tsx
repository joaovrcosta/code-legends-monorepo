'use client'

import * as React from 'react'
import { useCallback, useRef, useState } from 'react'
import { NewContentCaroussel } from '@/components/learn/catolog/new-content-caroussel'
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
import { DEFAULT_CATALOG_FILTERS, type CatalogFiltersState } from '@/lib/catalog-filter-utils'

type CatalogPageContentProps = {
  courses: CourseWithCount[]
  tracks: CareerTrack[]
}

function CatalogSectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center space-x-2 py-4 first:pt-0">
      <span className="text-muted-foreground text-[14px] font-semibold">
        {children}
      </span>
    </div>
  )
}

export function CatalogPageContent({ courses, tracks }: CatalogPageContentProps) {
  const [activeTab, setActiveTab] = useState<CatalogQuickTab>('all')
  const [filters, setFilters] = useState<CatalogFiltersState>(DEFAULT_CATALOG_FILTERS)
  const novidadesRef = useRef<HTMLDivElement>(null)
  const carreirasRef = useRef<HTMLDivElement>(null)
  const catalogRef = useRef<HTMLDivElement>(null)

  const handleTabChange = useCallback((tab: CatalogQuickTab) => {
    setActiveTab(tab)

    switch (tab) {
      case 'all':
        setFilters(DEFAULT_CATALOG_FILTERS)
        break
      case 'news':
        setFilters(DEFAULT_CATALOG_FILTERS)
        novidadesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'free':
        setFilters({ ...DEFAULT_CATALOG_FILTERS, prices: ['free'] })
        catalogRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
      case 'careers':
        setFilters({ ...DEFAULT_CATALOG_FILTERS, types: ['career'] })
        carreirasRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
        break
    }
  }, [])

  return (
    <div className="w-full min-w-0">
      <CatalogFilterHeader
        activeTab={activeTab}
        onTabChange={handleTabChange}
        filters={filters}
        onFiltersChange={setFilters}
        tracks={tracks}
        className="pr-4 lg:pr-6"
      />

      <div ref={novidadesRef} className="w-full">
        <CatalogSectionLabel>Novidades</CatalogSectionLabel>
        <div className="relative w-full min-w-0">
          <NewContentCaroussel />
        </div>
      </div>

      <div className="w-full">
        <CatalogSectionLabel>Categorias</CatalogSectionLabel>
        <div className="relative w-full min-w-0 overflow-hidden pb-4">
          <CategoriesCarousel />
        </div>
      </div>

      <div ref={carreirasRef} className="w-full">
        <CatalogSectionLabel>Trilhas de carreira</CatalogSectionLabel>
        <div className="relative w-full min-w-0 overflow-hidden pb-2">
          <CareerTracksSection tracks={tracks} />
        </div>
      </div>

      <div ref={catalogRef} className="mt-10 w-full min-w-0 pr-4 lg:pr-6">
        <CatalogPageClient
          courses={courses}
          tracks={tracks}
          filters={filters}
          onFiltersChange={setFilters}
        />
      </div>
    </div>
  )
}
