import { CatalogPageContent } from '@/components/learn/catolog/catalog-page-content'
import type { CareerTrack } from '@/components/learn/catolog/career-tracks-section'
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
    badge: 'Para assinantes',
    pills: [`${c.modulesCount} módulos`],
    iconUrl: c.icon,
    thumbnailUrl: c.thumbnail,
    colorHex: c.colorHex,
    modulesCount: c.modulesCount,
  }))

  return <CatalogPageContent courses={courses.courses} tracks={tracks} />
}
