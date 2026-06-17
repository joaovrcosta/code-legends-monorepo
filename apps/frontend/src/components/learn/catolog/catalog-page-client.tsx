'use client'

import { useMemo, useState } from 'react'
import { ListFilter } from 'lucide-react'
import type { CourseWithCount } from '@/types/user-course.ts'
import type { CareerTrack } from '@/components/learn/catolog/career-tracks-section'
import { CatalogFilters } from '@/components/learn/catolog/catalog-filters'
import { CatalogCoursesGrid } from '@/components/learn/catolog/catalog-courses-grid'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DEFAULT_CATALOG_FILTERS,
  countActiveFilters,
  filterCareerTracks,
  filterCourses,
  getFreeCourses,
  getTrendingCourses,
  hasActiveFilters,
  type CatalogFiltersState,
} from '@/lib/catalog-filter-utils'

type CatalogPageClientProps = {
  courses: CourseWithCount[]
  tracks: CareerTrack[]
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

export function CatalogPageClient({ courses, tracks }: CatalogPageClientProps) {
  const [filters, setFilters] = useState<CatalogFiltersState>(
    DEFAULT_CATALOG_FILTERS,
  )
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  const activeFilterCount = countActiveFilters(filters)
  const filtersActive = hasActiveFilters(filters)

  const filteredCourses = useMemo(
    () => filterCourses(courses, filters),
    [courses, filters],
  )

  const filteredTracks = useMemo(
    () => filterCareerTracks(tracks, filters),
    [tracks, filters],
  )

  const trendingCourses = useMemo(() => getTrendingCourses(courses), [courses])
  const freeCourses = useMemo(() => getFreeCourses(courses), [courses])

  const resultCount = filteredCourses.length + filteredTracks.length

  const handleFiltersChange = (next: CatalogFiltersState) => {
    setFilters(next)
  }

  return (
    <div className="w-full min-w-0">
      {/* Mobile filter trigger */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <Sheet open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="gap-2 border-[#25252A] bg-transparent text-white hover:bg-[#25252A]"
            >
              <ListFilter className="h-4 w-4" />
              Filtros
              {activeFilterCount > 0 ? (
                <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#35BED5] px-1.5 text-xs font-semibold text-black">
                  {activeFilterCount}
                </span>
              ) : null}
            </Button>
          </SheetTrigger>
          <SheetContent
            side="left"
            className="w-[min(100vw,320px)] overflow-y-auto border-[#25252A] bg-[#0c0c0d]"
          >
            <SheetHeader className="mb-4">
              <SheetTitle className="text-white">Filtros</SheetTitle>
            </SheetHeader>
            <CatalogFilters
              filters={filters}
              onChange={(next) => {
                handleFiltersChange(next)
              }}
              className="border-0 bg-transparent p-0"
              showHeader={false}
            />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex min-w-0 gap-6 lg:gap-8">
        {/* Desktop filters sidebar — coluna estica com o conteúdo; sticky no filho */}
        <div className="hidden w-[280px] shrink-0 lg:block">
          <div className="sticky top-6 z-10">
            <CatalogFilters filters={filters} onChange={handleFiltersChange} />
          </div>
        </div>

        {/* Content column */}
        <div className="min-w-0 flex-1 overflow-x-hidden pb-8">
          {filtersActive ? (
            <section className="mb-8">
              <SectionTitle>
                Resultados ({resultCount})
              </SectionTitle>
              <CatalogCoursesGrid
                courses={filteredCourses}
                tracks={filteredTracks}
              />
            </section>
          ) : null}

          <section className="mb-8">
            <SectionTitle>Em alta</SectionTitle>
            <CatalogCoursesGrid courses={trendingCourses} />
          </section>

          <section>
            <SectionTitle>Acesse gratuitamente</SectionTitle>
            <CatalogCoursesGrid
              courses={freeCourses}
              emptyMessage="Nenhum curso gratuito disponível no momento."
            />
          </section>
        </div>
      </div>
    </div>
  )
}
