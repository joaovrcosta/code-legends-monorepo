import { listCourses } from '@/actions/course'
import { getUserEnrolledList } from '@/actions/progress'
import { CurrentCourseCard } from '@/components/home/current-course-card'
import { CategoriesCarousel } from '@/components/learn/catolog/categories-carousel'
import { NewsBannerCarousel } from '@/components/home/news-banner-carousel'
import type { Metadata } from 'next'
import { UserProfiler } from '@/components/home/user-profiler'
import { CurrentCourses } from '@/components/home/current-courses'
import { RecommendationsCarousel } from '@/components/home/recommendations-carousel'
import { HomePageWrapper } from '@/components/home/home-page-wrapper'
import { PostPaymentWelcomeGate } from '@/components/providers/post-payment-welcome-gate'
import { Flame } from '@phosphor-icons/react/ssr'

export const metadata: Metadata = {
  title: 'Início - Code Legends',
  description:
    'Dashboard principal com suas trilhas, recomendações e progresso de aprendizado.',
}

export default async function Home() {
  const courses = await listCourses()
  const enrolledCoursesData = await getUserEnrolledList()

  return (
    <>
      <HomePageWrapper initialUserCourses={enrolledCoursesData.userCourses || []}>
      <div className="w-full lg:p-6 xl:pt-8 pt-6 pl-6 pr-0 pb-6">
        <div className="flex flex-col lg:flex-row max-w-[1420px] pb-10 gap-8 md:gap-10 mx-auto">
          <div className="flex-1 flex flex-col items-start min-w-0">
            <div className="w-full">
              <div className="flex items-center space-x-2 pb-4 pt-0">
                <span className="text-muted-foreground text-[14px] font-semibold">
                  Trilha atual
                </span>
              </div>
              <div className="lg:pr-0 pr-6">
                <CurrentCourseCard />
              </div>

              <div className="w-full mt-0">
                <CurrentCourses />
              </div>

              <div className="lg:hidden w-full pr-6 lg:mt-6 mt-12">
                <UserProfiler />
              </div>

              <div className="mb-8">
                <RecommendationsCarousel
                  courses={courses.courses}
                  sectionTitle="Em alta"
                  titleRowClassName="pt-8"
                  sectionIcon={
                    <Flame
                      weight="fill"
                      size={16}
                      className="text-[#eceeef]"
                      aria-hidden
                    />
                  }
                />
              </div>

              <div className="mb-8">
                <RecommendationsCarousel
                  courses={courses.courses}
                  sectionTitle="Recomendações"
                />
              </div>

              <div className="relative w-full min-w-0 overflow-hidden px-0 mb-6">
                <NewsBannerCarousel variant="novidades" />
              </div>

              <div className="relative w-full min-w-0 overflow-hidden px-0 pb-4">
                <CategoriesCarousel variant="carreiras" />
              </div>
            </div>
          </div>

          <div className="hidden lg:block flex-shrink-0">
            <UserProfiler />
          </div>
        </div>
      </div>
      </HomePageWrapper>
      <PostPaymentWelcomeGate />
    </>
  )
}
