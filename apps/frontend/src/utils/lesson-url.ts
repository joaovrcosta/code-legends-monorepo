import type { Lesson, Module, Group } from "@/types/roadmap";

/**
 * Escolhe a aula para "continuar" ao entrar no classroom: primeira não concluída
 * na ordem do roadmap, depois fallbacks (isCurrent, unlocked, etc.).
 */
export function pickContinueTargetLesson(
  allLessons: Lesson[],
  isAccessible: (lesson: Lesson) => boolean = () => true,
): Lesson | null {
  const firstPending = allLessons.find(
    (l) => l.status !== "completed" && isAccessible(l),
  );
  if (firstPending) return firstPending;

  const foundCurrent = allLessons.find((l) => l.isCurrent);

  if (
    foundCurrent &&
    foundCurrent.status === "unlocked" &&
    isAccessible(foundCurrent)
  ) {
    return foundCurrent;
  }

  const firstUnlocked = allLessons.find(
    (l) => l.status === "unlocked" && isAccessible(l),
  );
  if (firstUnlocked) return firstUnlocked;

  if (
    foundCurrent &&
    foundCurrent.status !== "locked" &&
    isAccessible(foundCurrent)
  ) {
    return foundCurrent;
  }

  return (
    allLessons.find((l) => l.status !== "locked" && isAccessible(l)) ?? null
  );
}

/**
 * Gera um slug URL-friendly a partir de um texto
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove acentos
    .replace(/[^\w\s-]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "-") // Substitui espaços por hífens
    .replace(/-+/g, "-") // Remove hífens duplicados
    .trim();
}

/**
 * Gera a URL completa de uma aula no formato:
 * /classroom/{module-slug}/group/{group-slug}/lesson/{lesson-slug}
 */
export function generateLessonUrl(
  lesson: Lesson,
  module: Module,
  group: Group
): string {
  const moduleSlug = module.slug || generateSlug(module.title);
  const groupSlug = group.slug || generateSlug(group.title);
  const lessonSlug = lesson.slug;

  return `/classroom/${moduleSlug}/group/${groupSlug}/lesson/${lessonSlug}`;
}

export function appendCourseIdToClassroomHref(
  href: string,
  courseId: string,
): string {
  if (!courseId) return href;
  try {
    const url = new URL(href, "http://local.invalid");
    if (!url.pathname.startsWith("/classroom")) return href;
    url.searchParams.set("courseId", courseId);
    const q = url.searchParams.toString();
    return q ? `${url.pathname}?${q}` : url.pathname;
  } catch {
    const [path, query] = href.split("?");
    const params = new URLSearchParams(query || "");
    params.set("courseId", courseId);
    const q = params.toString();
    return q ? `${path}?${q}` : path;
  }
}

export function findLessonContext(
  lessonId: number,
  modules: Module[]
): { module: Module; group: Group } | null {
  for (const moduleItem of modules) {
    for (const group of moduleItem.groups) {
      const lesson = group.lessons.find((l) => l.id === lessonId);
      if (lesson) {
        return { module: moduleItem, group };
      }
    }
  }
  return null;
}

