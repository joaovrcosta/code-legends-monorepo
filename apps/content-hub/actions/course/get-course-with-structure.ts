"use server";

import { getCourseById } from "./get-course-by-slug";
import { listModules } from "../module/list-modules";
import { listGroups } from "../group/list-groups";
import { listLessons } from "../lesson/list-lessons";

export interface ModuleWithStructure {
  id: string;
  title: string;
  slug: string;
  courseId: string;
  orderIndex: number;
  groups: GroupWithStructure[];
}

export interface GroupWithStructure {
  id: number;
  title: string;
  moduleId: string;
  orderIndex: number;
  lessons: LessonWithStructure[];
}

export interface LessonWithStructure {
  id: number;
  title: string;
  description: string;
  type: string;
  slug: string;
  url: string | null;
  isFree: boolean;
  video_url: string | null;
  video_duration: string | null;
  locked: boolean;
  completed: boolean;
  submoduleId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
}

export interface CourseWithStructure {
  course: Awaited<ReturnType<typeof getCourseById>>;
  modules: ModuleWithStructure[];
}

/**
 * Busca um curso completo com sua estrutura hierárquica (módulos, grupos e aulas)
 */
export async function getCourseWithStructure(
  courseId: string
): Promise<CourseWithStructure | null> {
  try {
    // Buscar curso
    const course = await getCourseById(courseId);
    if (!course) {
      return null;
    }

    // Buscar módulos
    const { modules: modulesList } = await listModules(courseId);

    // Para cada módulo, buscar grupos e aulas
    const modulesWithStructure: ModuleWithStructure[] = await Promise.all(
      modulesList.map(async (module) => {
        const { groups: groupsList } = await listGroups(module.id);

        const groupsWithStructure: GroupWithStructure[] = await Promise.all(
          groupsList.map(async (group) => {
            const { lessons: lessonsList } = await listLessons(group.id);

            return {
              id: group.id,
              title: group.title,
              moduleId: group.moduleId,
              orderIndex: (group as any).orderIndex || 0,
              lessons: lessonsList.map((lesson) => ({
                id: parseInt(lesson.id, 10),
                title: lesson.title,
                description: lesson.description,
                type: lesson.type,
                slug: lesson.slug,
                url: lesson.url || null,
                isFree: lesson.isFree,
                video_url: lesson.video_url || null,
                video_duration: lesson.video_duration || null,
                locked: lesson.locked,
                completed: false, // Campo não retornado pela API de listagem, sempre false
                submoduleId: lesson.submoduleId,
                order: lesson.order || 0,
                createdAt: lesson.createdAt,
                updatedAt: lesson.updatedAt,
                authorId: lesson.authorId,
              })),
            };
          })
        );

        // Ordenar grupos por orderIndex
        groupsWithStructure.sort((a, b) => a.orderIndex - b.orderIndex);

        // Ordenar aulas dentro de cada grupo por order
        groupsWithStructure.forEach((group) => {
          group.lessons.sort((a, b) => a.order - b.order);
        });

        return {
          id: module.id,
          title: module.title,
          slug: module.slug,
          courseId: module.courseId,
          orderIndex: (module as any).orderIndex || 0,
          groups: groupsWithStructure,
        };
      })
    );

    // Ordenar módulos por orderIndex
    modulesWithStructure.sort((a, b) => a.orderIndex - b.orderIndex);

    return {
      course,
      modules: modulesWithStructure,
    };
  } catch (error) {
    console.error("Erro ao buscar curso com estrutura:", error);
    return null;
  }
}
