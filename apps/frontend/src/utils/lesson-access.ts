/** Para usuário FREE, só considera "acessível" aula com status desbloqueado E (isFree === true). */
export function isLessonAccessibleForUser(
  lesson: { status: string; isFree?: boolean },
  isPaidUser: boolean
): boolean {
  if (lesson.status === "locked") return false;
  if (isPaidUser) return true;
  return lesson.isFree === true;
}
