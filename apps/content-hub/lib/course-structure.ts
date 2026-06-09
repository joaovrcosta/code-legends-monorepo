import type {
  GroupWithStructure,
  LessonWithStructure,
  ModuleWithStructure,
} from "@/actions/course/get-course-with-structure";
import type { LessonProductionItem } from "@/actions/lesson/get-lesson-production-by-course";

export function courseLessonEditPath(
  courseId: string,
  lessonId: number | string,
): string {
  return `/courses/${courseId}/lessons/${lessonId}/edit`;
}

export function findLessonInStructure(
  modules: ModuleWithStructure[],
  lessonId: number,
): LessonWithStructure | null {
  const ctx = findLessonContext(modules, lessonId);
  return ctx?.lesson ?? null;
}

export interface LessonContext {
  lesson: LessonWithStructure;
  module: ModuleWithStructure;
  group: GroupWithStructure;
}

export function findLessonContext(
  modules: ModuleWithStructure[],
  lessonId: number,
): LessonContext | null {
  for (const module of modules) {
    for (const group of module.groups) {
      const lesson = group.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { lesson, module, group };
      }
    }
  }
  return null;
}

export interface LessonBreadcrumbContext {
  courseTitle: string;
  moduleTitle: string;
  groupTitle: string;
  lessonTitle: string;
}

export function buildLessonBreadcrumb(
  courseTitle: string,
  module: Pick<ModuleWithStructure, "title">,
  group: Pick<GroupWithStructure, "title">,
  lesson: Pick<LessonWithStructure, "title">,
): LessonBreadcrumbContext {
  return {
    courseTitle,
    moduleTitle: module.title,
    groupTitle: group.title,
    lessonTitle: lesson.title,
  };
}

export function buildLessonBreadcrumbFromContext(
  ctx: LessonContext,
  courseTitle: string,
): LessonBreadcrumbContext {
  return buildLessonBreadcrumb(
    courseTitle,
    ctx.module,
    ctx.group,
    ctx.lesson,
  );
}

/** @deprecated Prefer LessonContextBreadcrumb component */
export function formatLessonBreadcrumb(
  courseTitle: string,
  module: Pick<ModuleWithStructure, "title">,
  group: Pick<GroupWithStructure, "title">,
  lesson?: Pick<LessonWithStructure, "title">,
): string {
  const ctx = buildLessonBreadcrumb(
    courseTitle,
    module,
    group,
    lesson ?? { title: "" },
  );
  const parts = [
    ctx.courseTitle,
    ctx.moduleTitle,
    ctx.groupTitle,
  ];
  if (lesson?.title) parts.push(ctx.lessonTitle);
  return parts.join(" → ");
}

function toLessonProduction(
  item: LessonProductionItem,
): NonNullable<LessonWithStructure["production"]> {
  return {
    status: item.status,
    priority: item.priority,
    notes: item.notes ?? null,
    updatedAt: item.updatedAt,
    updatedById: item.updatedById,
  };
}

export function isVideoLesson(
  lesson: Pick<LessonWithStructure, "type">,
): boolean {
  return (lesson.type ?? "").trim().toLowerCase() === "video";
}

export function flattenCourseLessons(
  modules: ModuleWithStructure[],
): LessonWithStructure[] {
  const sortedModules = [...modules].sort(
    (a, b) => a.orderIndex - b.orderIndex,
  );

  return sortedModules.flatMap((module) =>
    [...module.groups]
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .flatMap((group) =>
        [...group.lessons].sort((a, b) => a.order - b.order),
      ),
  );
}

export interface VideoLessonNeighbor {
  lesson: LessonWithStructure;
  moduleTitle: string;
  groupTitle: string;
}

export interface AdjacentVideoLessons {
  previous: VideoLessonNeighbor | null;
  next: VideoLessonNeighbor | null;
}

function toVideoLessonNeighbor(
  modules: ModuleWithStructure[],
  lesson: LessonWithStructure,
): VideoLessonNeighbor | null {
  const ctx = findLessonContext(modules, lesson.id);
  if (!ctx) return null;

  return {
    lesson,
    moduleTitle: ctx.module.title,
    groupTitle: ctx.group.title,
  };
}

export function findAdjacentVideoLessons(
  modules: ModuleWithStructure[],
  lessonId: number,
): AdjacentVideoLessons {
  const all = flattenCourseLessons(modules);
  const currentIndex = all.findIndex((l) => l.id === lessonId);
  if (currentIndex === -1) {
    return { previous: null, next: null };
  }

  let previous: VideoLessonNeighbor | null = null;
  for (let i = currentIndex - 1; i >= 0; i--) {
    if (isVideoLesson(all[i])) {
      previous = toVideoLessonNeighbor(modules, all[i]);
      break;
    }
  }

  let next: VideoLessonNeighbor | null = null;
  for (let i = currentIndex + 1; i < all.length; i++) {
    if (isVideoLesson(all[i])) {
      next = toVideoLessonNeighbor(modules, all[i]);
      break;
    }
  }

  return { previous, next };
}

export function mergeProductionIntoModules(
  modules: ModuleWithStructure[],
  items: LessonProductionItem[],
): ModuleWithStructure[] {
  const byLessonId = new Map(items.map((i) => [i.lessonId, i]));

  return modules.map((m) => ({
    ...m,
    groups: m.groups.map((g) => ({
      ...g,
      lessons: g.lessons.map((l) => {
        const item = byLessonId.get(l.id);
        return {
          ...l,
          production: item ? toLessonProduction(item) : null,
        };
      }),
    })),
  }));
}
