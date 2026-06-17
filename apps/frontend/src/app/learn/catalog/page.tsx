import { NewContentCaroussel } from '@/components/learn/catolog/new-content-caroussel'
import { CategoriesCarousel } from '@/components/learn/catolog/categories-carousel'
import {
  CareerTracksSection,
  type CareerTrack,
} from '@/components/learn/catolog/career-tracks-section'
import { CatalogPageClient } from '@/components/learn/catolog/catalog-page-client'
import { listCourses } from '@/actions/course'
import { listCareers } from '@/actions/career/list-careers'
import type { Metadata } from 'next'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Catálogo de Cursos - Code Legends',
  description:
    'Explore todos os cursos disponíveis e encontre o próximo passo na sua jornada de programação.',
}

export default async function CoursesPage() {
  const courses = await listCourses()
  const careers = await listCareers()

  const tracks: CareerTrack[] = careers.careers.map((c) => ({
    id: c.id,
    title: c.title,
    href: `/learn/careers/${c.slug}`,
    badge: 'Carreira',
    pills: [`${c.modulesCount} módulos`],
  }))

  return (
    <div className="w-full min-w-0">
      <div className="flex flex-col items-start xl:mt-10 mt-6">
        {/* Novidades */}
        <div className="flex items-center space-x-2 mb-4 px-6 lg:px-[84px]">
          <span className="text-muted-foreground text-[14px] font-semibold">
            Novidades
          </span>
        </div>

        <div className="w-full relative min-w-0 overflow-x-hidden px-4 lg:px-0">
          <NewContentCaroussel />
        </div>

        {/* Categorias e trilhas — largura total */}
        <div className="lg:pl-20 pl-4 w-full min-w-0 pr-4 lg:pr-6">
          <div>
            <div className="flex items-center space-x-2 py-4 mt-4">
              <span className="text-muted-foreground text-[14px] font-semibold">
                Categorias
              </span>
            </div>
            <div className="relative w-full min-w-0 overflow-hidden px-0 pb-4">
              <CategoriesCarousel />
            </div>
          </div>

          <div>
            <div className="flex items-center space-x-2 py-4 mt-4">
              <span className="text-muted-foreground text-[14px] font-semibold">
                Trilhas de carreira
              </span>
            </div>
            <div className="relative w-full min-w-0 overflow-hidden px-0 pb-2">
              <CareerTracksSection tracks={tracks} />
            </div>
          </div>
        </div>

        {/* Filtros + conteúdo */}
        <div className="w-full min-w-0 mt-10">
          <CatalogPageClient courses={courses.courses} tracks={tracks} />
        </div>
      </div>
    </div>
  )
}
