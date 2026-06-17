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



function CatalogSectionLabel({ children }: { children: React.ReactNode }) {

  return (

    <div className="flex items-center space-x-2 py-4 first:pt-0">

      <span className="text-muted-foreground text-[14px] font-semibold">

        {children}

      </span>

    </div>

  )

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

      <div className="flex flex-col items-start xl:mt-10 mt-6 pl-4 pr-4 lg:pl-20 lg:pr-6">

        <CatalogSectionLabel>Novidades</CatalogSectionLabel>

        <div className="relative w-full min-w-0">

          <NewContentCaroussel />

        </div>



        <CatalogSectionLabel>Categorias</CatalogSectionLabel>

        <div className="relative w-full min-w-0 pb-4">

          <CategoriesCarousel />

        </div>



        <CatalogSectionLabel>Trilhas de carreira</CatalogSectionLabel>

        <div className="relative w-full min-w-0 pb-2">

          <CareerTracksSection tracks={tracks} />

        </div>



        <div className="mt-10 w-full min-w-0">

          <CatalogPageClient courses={courses.courses} tracks={tracks} />

        </div>

      </div>

    </div>

  )

}


