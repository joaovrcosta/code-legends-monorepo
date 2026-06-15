"use server";

import { buildApiHeaders } from "@/actions/auth";
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
  video?: {
    url: string | null;
    duration: string | null;
    providerId?: string | null;
    provider?: {
      id: string;
      slug?: string;
      name?: string;
      handlerKey?: string;
    } | null;
  } | null;
  article?: { body: string } | null;
  quiz?: { content: import('../lesson/list-lessons').Challenge[] } | null;
  project?: { description: string; specs?: Record<string, unknown> | null } | null;
  locked: boolean;
  completed: boolean;
  submoduleId: number;
  order: number;
  createdAt: string;
  updatedAt: string;
  authorId: string;
  production?: {
    status: import("../lesson/get-lesson-production-by-course").LessonProductionStatus;
    priority: import("../lesson/get-lesson-production-by-course").LessonProductionPriority;
    notes: string | null;
    updatedAt: string;
    updatedById: string;
  } | null;
}

export interface CourseWithStructure {
  course: Awaited<ReturnType<typeof getCourseById>>;
  modules: ModuleWithStructure[];
}

export interface GetCourseWithStructureOptions {
  includeContent?: boolean;
  token?: string;
}

function mapLessonFromApi(lesson: Record<string, unknown>): LessonWithStructure {
  return {
    id:
      typeof lesson.id === "number"
        ? lesson.id
        : parseInt(String(lesson.id ?? "0"), 10),
    title: String(lesson.title ?? ""),
    description: String(lesson.description ?? ""),
    type: String(lesson.type ?? "video"),
    slug: String(lesson.slug ?? ""),
    url: (lesson.url as string | null | undefined) ?? null,
    isFree: Boolean(lesson.isFree),
    video_url: (lesson.video_url as string | null | undefined) ?? null,
    video_duration: (lesson.video_duration as string | null | undefined) ?? null,
    video: (lesson.video as LessonWithStructure["video"]) ?? null,
    article: (lesson.article as LessonWithStructure["article"]) ?? null,
    quiz: (lesson.quiz as LessonWithStructure["quiz"]) ?? null,
    project: (lesson.project as LessonWithStructure["project"]) ?? null,
    locked: Boolean(lesson.locked),
    completed: false,
    submoduleId: Number(lesson.submoduleId ?? 0),
    order: Number(lesson.order ?? 0),
    createdAt: String(lesson.createdAt ?? ""),
    updatedAt: String(lesson.updatedAt ?? ""),
    authorId: String(lesson.authorId ?? ""),
    production: null,
  };
}

function mapModulesFromEditorResponse(
  modules: Array<Record<string, unknown>>,
): ModuleWithStructure[] {
  return modules.map((module) => ({
    id: String(module.id ?? ""),
    title: String(module.title ?? ""),
    slug: String(module.slug ?? ""),
    courseId: String(module.courseId ?? ""),
    orderIndex: Number(module.orderIndex ?? 0),
    groups: (Array.isArray(module.groups) ? module.groups : []).map((group) => {
      const g = group as Record<string, unknown>;
      return {
        id: Number(g.id ?? 0),
        title: String(g.title ?? ""),
        moduleId: String(g.moduleId ?? ""),
        orderIndex: Number(g.orderIndex ?? 0),
        lessons: (Array.isArray(g.lessons) ? g.lessons : []).map((lesson) =>
          mapLessonFromApi(lesson as Record<string, unknown>),
        ),
      };
    }),
  }));
}

async function getCourseWithStructureFromEditor(
  courseId: string,
  includeContent: boolean,
  token?: string,
): Promise<CourseWithStructure | null> {
  const query = `includeContent=${includeContent ? "true" : "false"}`;
  const response = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/structure/editor?${query}`,
    {
      method: "GET",
      headers: await buildApiHeaders(undefined, token),
      cache: "no-store",
    },
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as {
    course: Awaited<ReturnType<typeof getCourseById>>;
    modules: Array<Record<string, unknown>>;
  };

  return {
    course: data.course,
    modules: mapModulesFromEditorResponse(data.modules ?? []),
  };
}

async function getCourseWithStructureLegacy(
  courseId: string,
  includeContent: boolean,
): Promise<CourseWithStructure | null> {
  const course = await getCourseById(courseId);
  if (!course) {
    return null;
  }

  const { modules: modulesList } = await listModules(courseId);

  const modulesWithStructure: ModuleWithStructure[] = await Promise.all(
    modulesList.map(async (module) => {
      const { groups: groupsList } = await listGroups(module.id);

      const groupsWithStructure: GroupWithStructure[] = await Promise.all(
        groupsList.map(async (group) => {
          const { lessons: lessonsList } = await listLessons(group.id, {
            includeContent,
          });

          return {
            id: group.id,
            title: group.title,
            moduleId: group.moduleId,
            orderIndex: (group as { orderIndex?: number }).orderIndex || 0,
            lessons: lessonsList.map((lesson) => ({
              id: parseInt(lesson.id, 10),
              title: lesson.title,
              description: lesson.description,
              type: lesson.type,
              slug: lesson.slug,
              url: lesson.url || null,
              isFree: lesson.isFree,
              video_url: lesson.video?.url ?? lesson.video_url ?? null,
              video_duration:
                lesson.video?.duration ?? lesson.video_duration ?? null,
              video: lesson.video ?? null,
              article: lesson.article ?? null,
              quiz: lesson.quiz ?? null,
              project: lesson.project ?? null,
              locked: lesson.locked,
              completed: false,
              submoduleId: lesson.submoduleId,
              order: lesson.order || 0,
              createdAt: lesson.createdAt,
              updatedAt: lesson.updatedAt,
              authorId: lesson.authorId,
              production: null,
            })),
          };
        }),
      );

      groupsWithStructure.sort((a, b) => a.orderIndex - b.orderIndex);
      groupsWithStructure.forEach((group) => {
        group.lessons.sort((a, b) => a.order - b.order);
      });

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        courseId: module.courseId,
        orderIndex: (module as { orderIndex?: number }).orderIndex || 0,
        groups: groupsWithStructure,
      };
    }),
  );

  modulesWithStructure.sort((a, b) => a.orderIndex - b.orderIndex);

  return {
    course,
    modules: modulesWithStructure,
  };
}

/**
 * Busca um curso completo com sua estrutura hierárquica (módulos, grupos e aulas)
 */
export async function getCourseWithStructure(
  courseId: string,
  options?: GetCourseWithStructureOptions,
): Promise<CourseWithStructure | null> {
  const includeContent = options?.includeContent === true;

  try {
    const fromEditor = await getCourseWithStructureFromEditor(
      courseId,
      includeContent,
      options?.token,
    );
    if (fromEditor) {
      return fromEditor;
    }

    return await getCourseWithStructureLegacy(courseId, includeContent);
  } catch (error) {
    console.error("Erro ao buscar curso com estrutura:", error);
    return null;
  }
}
