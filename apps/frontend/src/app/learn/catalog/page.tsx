import { NewContentCaroussel } from "@/components/learn/catolog/new-content-caroussel";
import { RecommendationsCarousel } from "@/components/learn/catolog/recommendations-carousel";
import { CategoriesCarousel } from "@/components/learn/catolog/categories-carousel";
import { MyCatalogWrapper } from "@/components/learn/catolog/my-catalog-wrapper";
import { getUserEnrolledList } from "@/actions/progress";
import { listCourses } from "@/actions/course";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Catálogo de Cursos - Code Legends",
  description: "Explore todos os cursos disponíveis e encontre o próximo passo na sua jornada de programação.",
};

export default async function CoursesPage() {
  const courses = await listCourses();
  const { userCourses } = await getUserEnrolledList();

  return (
    <div className="w-full">
      <div className="flex flex-col items-start xl:mt-10 mt-6">
        {/* Novidades */}
        <div className="flex items-center space-x-2 mb-4 px-6 lg:px-[84px]">
          <span className="text-muted-foreground text-[14px] font-semibold">
            Novidades
          </span>
        </div>

        {/* Carrossel */}
        <div className="w-full relative px-4 lg:px-0">
          <NewContentCaroussel />
        </div>

        {/* Seus cursos e Catálogo */}
        <div className="lg:pl-20 pl-4 w-full">
          <div className="flex items-center space-x-2 py-4">
            <span className="text-muted-foreground text-[14px] font-semibold">
              Seus cursos
            </span>
          </div>
          <MyCatalogWrapper initialUserCourses={userCourses} />

          {/* Catálogo */}
          <div>
            <div className="flex items-center space-x-2 py-4 pt-8">
              <span className="text-muted-foreground text-[14px] font-semibold">
                Recomendações
              </span>
            </div>
            <RecommendationsCarousel courses={courses.courses} />
            <div className="flex items-center space-x-2 py-4 pt-4">
              <span className="text-muted-foreground text-[14px] font-semibold">
                Acesse gratuitamente
              </span>
            </div>
            <RecommendationsCarousel courses={courses.courses} />
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
    </div>
  );
}
