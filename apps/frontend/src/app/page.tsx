import { listCourses } from "@/actions/course";
import { getUserEnrolledList } from "@/actions/progress";
import { CurrentCourseCard } from "@/components/home/current-course-card";
import { CategoriesCarousel } from "@/components/learn/catolog/categories-carousel";
import { NewsBannerCarousel } from "@/components/home/news-banner-carousel";
import type { Metadata } from "next";
import { UserProfiler } from "@/components/home/user-profiler";
import { CurrentCourses } from "@/components/home/current-courses";
import { RecommendationsCarousel } from "@/components/home/recommendations-carousel";
import { HomePageWrapper } from "@/components/home/home-page-wrapper";

export const metadata: Metadata = {
  title: "Início - Code Legends",
  description: "Dashboard principal com suas trilhas, recomendações e progresso de aprendizado.",
};

export default async function Home() {
  const [courses, enrolledCoursesData] = await Promise.all([
    listCourses(),
    getUserEnrolledList(),
  ]);

  return (
    <HomePageWrapper initialUserCourses={enrolledCoursesData.userCourses || []}>
      <div className="w-full lg:p-6 xl:pt-16 pt-6 pl-6 pr-0 pb-6">
        <div className="flex flex-col lg:flex-row max-w-[1520px] pb-10 gap-8 md:gap-10 mx-auto">
          {/* Conteúdo principal - Esquerda */}
          <div className="flex-1 flex flex-col items-start min-w-0">
            {/* Seus cursos e Catálogo */}
            <div className="w-full">
              <div className="flex items-center space-x-2 pb-4 pt-0">
                <span className="text-muted-foreground text-[14px] font-semibold">
                  Trilha atual
                </span>
              </div>
              <div className="lg:pr-0 pr-6">
                <CurrentCourseCard />
              </div>

              <div className="w-full pr-6 mt-6">
                <CurrentCourses />
              </div>

              {/* UserProfiler - Mobile: aparece aqui, Desktop: hidden */}
              <div className="lg:hidden w-full pr-6 lg:mt-6 mt-12">
                <UserProfiler />
              </div>

              <div className="mb-8">
                <div className="flex items-center space-x-2 py-4 pt-8">
                  <span className="text-muted-foreground text-[14px] font-semibold">
                    Em alta
                  </span>
                </div>
                <RecommendationsCarousel courses={courses.courses} />
              </div>


              {/* Catálogo */}
              <div className="mb-8">
                <div className="flex items-center space-x-2 py-4 pt-0">
                  <span className="text-muted-foreground text-[14px] font-semibold">
                    Recomendações
                  </span>
                </div>
                <RecommendationsCarousel courses={courses.courses} />
              </div>

              {/* Novidades */}
              <div className="flex items-start space-x-2 mb-4 w-full">
                <span className="text-muted-foreground text-[14px] font-semibold">
                  Novidades
                </span>
              </div>


              <div className="w-full relative px-0 overflow-hidden min-w-0">
                <NewsBannerCarousel />
              </div>

              <div className="flex items-center space-x-2 py-4 mt-4">
                <span className="text-muted-foreground text-[14px] font-semibold">
                  Categorias
                </span>
              </div>
              <div className="pb-4">
                <CategoriesCarousel />
              </div>
            </div>
          </div>

          {/* UserProfiler - Desktop: aparece aqui, Mobile: hidden */}
          <div className="hidden lg:block flex-shrink-0">
            <UserProfiler />
          </div>
        </div>
      </div>
    </HomePageWrapper>
  );
}
