import type { Lesson, Module, Group } from "@/types/roadmap";

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

/**
 * Encontra o módulo e grupo de uma aula específica no roadmap
 */
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

