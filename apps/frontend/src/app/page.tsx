import { listCourses } from '@/actions/course'
import { getUserEnrolledList } from '@/actions/progress'
import { CurrentCourseCard } from '@/components/home/current-course-card'
import { CategoriesCarousel } from '@/components/learn/catolog/categories-carousel'
import { NewsBannerCarousel } from '@/components/home/news-banner-carousel'
import type { Metadata } from 'next'
import { UserProfiler } from '@/components/home/user-profiler'
import { CurrentCourses } from '@/components/home/current-courses'
import { HomePageWrapper } from '@/components/home/home-page-wrapper'
import { PostPaymentWelcomeGate } from '@/components/providers/post-payment-welcome-gate'
import { CatalogCoursesCarousel } from '@/components/home/catalog-courses-carousel'
import { SectionTitle } from './catalog-courses-carousel-title'
import { CareerTrack, CareerTracksSection } from '@/components/learn/catolog/career-tracks-section'
import { listCareers } from '@/actions/career'

export const metadata: Metadata = {
  title: 'Início - Code Legends',
  description:
    'Dashboard principal com suas trilhas, recomendações e progresso de aprendizado.',
}

export default async function Home() {
  const courses = await listCourses()
  const careers = await listCareers()
  const enrolledCoursesData = await getUserEnrolledList()

  const hasContinueLearningCourses = (enrolledCoursesData.userCourses ?? []).some(
    (course) => course.progress > 0 && !course.isCompleted,
  )

  const tracks: CareerTrack[] = careers.careers.map((c) => ({
    id: c.id,
    title: c.title,
    href: `/learn/careers/${c.slug}`,
    pills: [`${c.modulesCount} módulos`],
    iconUrl: c.icon,
    thumbnailUrl: c.thumbnail,
    colorHex: c.colorHex,
    modulesCount: c.modulesCount,
  }))


  return (
    <>
      <HomePageWrapper initialUserCourses={enrolledCoursesData.userCourses || []}>
        <div className="flex flex-col lg:flex-row gap-8 md:gap-6">
            <div className="flex-1 flex flex-col items-start min-w-0 overflow-x-hidden">
              <div className="w-full">
                <SectionTitle
                  className="mb-4"
                  title="Trilha atual"
                />
                <div className="lg:pr-0">
                  <CurrentCourseCard />
                </div>

                {hasContinueLearningCourses ? (
                  <div className="w-full mt-0">
                    <SectionTitle
                      className="mb-4 mt-10"
                      title="Continuar aprendendo"
                    />
                    <CurrentCourses />
                  </div>
                ) : null}

                <div className="lg:hidden w-full lg:mt-6 mt-12">
                  <UserProfiler />
                </div>

                <div className="mb-12 pt-10">
                  <CatalogCoursesCarousel
                    courses={courses.courses}
                    sectionTitle="Em alta"
                  />
                </div>

                <div className="mb-10">
                  <CatalogCoursesCarousel
                    courses={courses.courses}
                    sectionTitle="Recomendações"
                  />
                </div>

                <div className="relative w-full min-w-0 overflow-hidden px-0 pb-10">
                  <SectionTitle
                    className="mb-4"
                    title="Categorias"
                  />
                  <CategoriesCarousel />
                </div>

                <div className="mb-10">
                  <CareerTracksSection
                    tracks={tracks}
                    sectionTitle="Trilhas de carreira"
                  />
                </div>

                <div className="relative w-full min-w-0 overflow-hidden px-0 mb-6">
                  <SectionTitle
                    className="mb-4"
                    title="Novidades"
                  />
                  <NewsBannerCarousel />
                </div>
              </div>
            </div>

            <div className="relative z-10 hidden lg:block flex-shrink-0">
              <UserProfiler />
            </div>
        </div>
      </HomePageWrapper>
      <PostPaymentWelcomeGate />
    </>
  )
}
