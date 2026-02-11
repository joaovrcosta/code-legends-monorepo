import { getCourseBySlug } from "@/actions/course/get-course-by-slug";
import { getUserCourseProgress } from "@/actions/progress/get-course-progress";
import { CourseBanner } from "@/components/course/courses/react-js/banner";
import { CourseContent } from "@/components/course/courses/react-js/content";
import { CourseOverview } from "@/components/course/courses/react-js/overview";
import { CourseProjects } from "@/components/course/courses/react-js/projects";
import { Tabs } from "@/components/ui/tabs";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function CoursePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const course = await getCourseBySlug(slug);

  if (!course) {
    notFound();
  }

  const userProgress = await getUserCourseProgress(course.slug);

  const myLearningTabs = [
    {
      id: "in-progress",
      label: "Programa de Estudos",
      content: (
        <div>
          <CourseOverview />
        </div>
      ),
    },
    {
      id: "completed",
      label: "Contéudo",
      content: (
        <div>
          <CourseContent />
        </div>
      ),
    },
    {
      id: "about",
      label: "Projetos",
      content: (
        <div className="mt-8">
          <CourseProjects />
        </div>
      ),
    },
  ];

  return (
    <div>
      <CourseBanner course={course} userProgress={userProgress} />
      <section className="flex items-center justify-between mt-4 mb-4 lg:px-12 px-6">
        <Tabs tabs={myLearningTabs} defaultTab="in-progress" />
      </section>
    </div>
  );
}
