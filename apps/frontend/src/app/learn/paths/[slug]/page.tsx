import { getCourseBySlug } from "@/actions/course/get-course-by-slug";
import { getUserCourseProgress } from "@/actions/progress/get-course-progress";
import { getCourseRoadmap } from "@/actions/course/roadmap";
import { CourseBanner } from "@/components/course/banner";
import { CourseContent } from "@/components/course/courses/react-js/content";
import { CourseOverview } from "@/components/course/overview";
import { CourseProjects } from "@/components/course/courses/react-js/projects";
import { Tabs } from "@/components/ui/tabs";
import { notFound } from "next/navigation";
import { getAuthToken } from "@/actions/auth/session";
import type { RoadmapResponse } from "@/types/roadmap";
import {
  mapLessonTypeToCategoryLabel,
  type ModuleLessonGridItem,
} from "@/lib/module-lesson-overview";
import type {
  StudyProgramLessonLine,
  StudyProgramModuleSection,
} from "@/lib/study-program-overview";
import { findLessonContext, generateLessonUrl } from "@/utils/lesson-url";

export const dynamic = "force-dynamic";

function resolveResumeLessonHref(
  roadmap: RoadmapResponse | null | undefined,
  lessonId: number | undefined
): string | null {
  if (!roadmap?.modules?.length || lessonId == null) return null;
  const ctx = findLessonContext(lessonId, roadmap.modules);
  if (!ctx) return null;
  const lesson = ctx.group.lessons.find((l) => l.id === lessonId);
  if (!lesson) return null;
  return generateLessonUrl(lesson, ctx.module, ctx.group);
}

function buildModuleLessonsForOverview(
  roadmap: RoadmapResponse | null | undefined,
  currentLessonId: number | undefined
): ModuleLessonGridItem[] {
  if (!roadmap?.modules?.length || currentLessonId == null) return [];
  const ctx = findLessonContext(currentLessonId, roadmap.modules);
  if (!ctx) return [];
  const { module } = ctx;
  const items: ModuleLessonGridItem[] = [];
  for (const group of module.groups) {
    for (const lesson of group.lessons) {
      items.push({
        id: lesson.id,
        title: lesson.title,
        href: generateLessonUrl(lesson, module, group),
        categoryLabel: mapLessonTypeToCategoryLabel(lesson.type),
        isCurrent: lesson.id === currentLessonId,
        isCompleted: lesson.status === "completed",
        isLocked: lesson.status === "locked",
      });
    }
  }
  return items;
}

function buildStudyProgramModules(
  roadmap: RoadmapResponse | null | undefined
): StudyProgramModuleSection[] {
  if (!roadmap?.modules?.length) return [];
  return roadmap.modules.map((module) => {
    const lessons: StudyProgramLessonLine[] = [];
    for (const group of module.groups) {
      for (const lesson of group.lessons) {
        lessons.push({
          id: lesson.id,
          title: lesson.title,
          categoryLabel: mapLessonTypeToCategoryLabel(lesson.type),
          href: generateLessonUrl(lesson, module, group),
          isLocked: lesson.status === "locked",
        });
      }
    }
    const n = lessons.length;
    const pct = Math.round((module.progress ?? 0) * 100);
    const progressLabel = `${pct}% concluído`;
    const lessonsLabel = `${n} ${n === 1 ? "aula" : "aulas"}`;
    return {
      id: module.id,
      title: module.title,
      subtitle: n > 0 ? `${progressLabel} · ${lessonsLabel}` : progressLabel,
      progress: module.progress ?? 0,
      lessons,
    };
  });
}

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

  let currentLesson = null;
  let resumeLessonHref: string | null = null;
  let roadmap: RoadmapResponse | null = null;
  try {
    const token = await getAuthToken();
    if (token) {
      roadmap = await getCourseRoadmap(course.id);
      currentLesson = roadmap?.currentLesson || null;
      resumeLessonHref = resolveResumeLessonHref(
        roadmap ?? undefined,
        currentLesson?.id
      );
    }
  } catch (error) {
    console.error("Erro ao buscar roadmap:", error);
  }

  const moduleLessons = buildModuleLessonsForOverview(
    roadmap ?? undefined,
    currentLesson?.id
  );
  const studyProgramModules = buildStudyProgramModules(roadmap ?? undefined);

  const myLearningTabs = [
    {
      id: "in-progress",
      label: "Programa de Estudos",
      content: (
        <div>
          <CourseOverview
            tags={course.tags || []}
            moduleLessons={moduleLessons}
            studyProgramModules={studyProgramModules}
            currentLesson={currentLesson}
            resumeLessonHref={resumeLessonHref}
          />
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
      <section className="flex items-center justify-between mt-4 mb-4 lg:px-0 px-4 max-w-[1356px] mx-auto">
        <Tabs tabs={myLearningTabs} defaultTab="in-progress" />
      </section>
    </div>
  );
}
