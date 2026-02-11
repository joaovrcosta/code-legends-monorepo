"use client";

import { BookBookmarkIcon } from "@phosphor-icons/react/dist/ssr";
import { Tabs } from "@/components/ui/tabs";
import { LearningCard } from "@/components/learn/learning-card";
import { useState, useEffect, useCallback } from "react";
import { getMyLearning } from "@/actions/progress";
import { getCourseRoadmap } from "@/actions/course";
import type { MyLearningCourse } from "@/actions/progress/my-learning";
import type { Lesson } from "@/types/roadmap";

interface CourseWithModules extends MyLearningCourse {
  modules?: Array<{
    id: string;
    title: string;
    isActive: boolean;
    lessons?: Array<{
      id: string;
      title: string;
      type: "video" | "quiz" | "read" | "informational";
      duration?: string;
      locked?: boolean;
    }>;
  }>;
}

export default function MyLearningPage() {
  const [inProgressCourses, setInProgressCourses] = useState<
    CourseWithModules[]
  >([]);
  const [completedCourses, setCompletedCourses] = useState<CourseWithModules[]>(
    []
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadingCourseId, setLoadingCourseId] = useState<string | null>(null);

  // Busca os cursos iniciais
  useEffect(() => {
    async function fetchCourses() {
      try {
        setIsLoading(true);
        const { inProgress, completed } = await getMyLearning();

        // Mapeia os cursos para o formato esperado
        setInProgressCourses(
          inProgress.map((course) => ({
            ...course,
            progress: Math.round(course.progress * 100),
          }))
        );
        setCompletedCourses(
          completed.map((course) => ({
            ...course,
            progress: Math.round(course.progress * 100),
          }))
        );
      } catch (error) {
        console.error("Erro ao buscar cursos:", error);
        setInProgressCourses([]);
        setCompletedCourses([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCourses();
  }, []);

  // Função para carregar roadmap quando expandir
  const handleExpandCourse = useCallback(async (courseId: string) => {
    try {
      setLoadingCourseId(courseId);

      const roadmap = await getCourseRoadmap(courseId);
      if (!roadmap) {
        setLoadingCourseId(null);
        return;
      }

      // Identifica o módulo ativo (primeiro módulo não completado ou último se todos completos)
      const activeModule =
        roadmap.modules.find((m) => !m.isCompleted) ||
        roadmap.modules[roadmap.modules.length - 1];
      const activeModuleId = activeModule?.id;

      // Mapeia os módulos
      const modules = roadmap.modules.map((module) => {
        const isActive = module.id === activeModuleId;

        // Se for o módulo ativo, inclui as lições
        const lessons = isActive
          ? module.groups
              .flatMap((group) => group.lessons)
              .map((lesson: Lesson) => {
                const lessonType: "video" | "quiz" | "read" | "informational" =
                  lesson.type === "video"
                    ? "video"
                    : lesson.type === "quiz"
                    ? "quiz"
                    : lesson.type === "article"
                    ? "read"
                    : "informational";

                return {
                  id: lesson.id.toString(),
                  title: lesson.title,
                  type: lessonType,
                  duration: lesson.video_duration || undefined,
                  locked: lesson.status === "locked",
                };
              })
          : undefined;

        return {
          id: module.id,
          title: module.title,
          isActive,
          lessons,
        };
      });

      // Atualiza os cursos com os módulos
      setInProgressCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, modules } : course
        )
      );

      setCompletedCourses((prev) =>
        prev.map((course) =>
          course.id === courseId ? { ...course, modules } : course
        )
      );
    } catch (error) {
      console.error(`Erro ao buscar roadmap do curso ${courseId}:`, error);
    } finally {
      setLoadingCourseId(null);
    }
  }, []);

  // Skill paths (mantido como estava)
  const skillPaths = [
    {
      title: "Build Web Apps with ASP.NET",
      type: "skill-path" as const,
      progress: 17,
      icon: "/aspnet-icon.png",
    },
  ];

  const myLearningTabs = [
    {
      id: "in-progress",
      label: "Em andamento",
      content: (
        <div className="space-y-4 mt-6">
          {inProgressCourses.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum curso em andamento
            </p>
          ) : (
            inProgressCourses.map((course, index) => (
              <LearningCard
                key={course.id || index}
                title={course.title}
                type="course"
                progress={course.progress}
                icon={course.icon}
                courseId={course.id}
                modules={course.modules}
                isLoadingModules={loadingCourseId === course.id}
                onExpand={handleExpandCourse}
              />
            ))
          )}
        </div>
      ),
    },
    {
      id: "completed",
      label: "Completos",
      content: (
        <div className="space-y-4 mt-6">
          {completedCourses.length === 0 && !isLoading ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhum curso completo ainda
            </p>
          ) : (
            completedCourses.map((course, index) => (
              <LearningCard
                key={course.id || index}
                title={course.title}
                type="course"
                progress={course.progress}
                icon={course.icon}
                courseId={course.id}
                modules={course.modules}
                isLoadingModules={loadingCourseId === course.id}
                onExpand={handleExpandCourse}
              />
            ))
          )}
        </div>
      ),
    },
    {
      id: "skill-paths",
      label: "Skill Paths",
      content: (
        <div className="space-y-4 mt-6">
          {skillPaths.map((path, index) => (
            <LearningCard key={index} {...path} />
          ))}
        </div>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="py-4 lg:px-12 px-4 w-full">
        <div className="flex items-center justify-start space-x-2 py-6">
          <BookBookmarkIcon
            className="text-[#00C8FF]"
            size={28}
            weight="fill"
          />
          <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
            Meu Aprendizado
          </span>
        </div>
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Carregando cursos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 lg:px-12 px-4 w-full">
      <div className="flex items-center justify-start space-x-2 py-6">
        <BookBookmarkIcon className="text-[#00C8FF]" size={28} weight="fill" />
        <span className="font-bold bg-blue-gradient-500 bg-clip-text text-transparent text-lg">
          Meu Aprendizado
        </span>
      </div>

      {/* Tabs Section */}
      <div>
        <Tabs tabs={myLearningTabs} defaultTab="in-progress" />
      </div>
    </div>
  );
}
