/** Regras de acesso a aulas por plano:
 * - Usuário pago (PRO/PREMIUM): pode acessar qualquer aula do curso.
 * - Usuário FREE: só considera "acessível" aula marcada como gratuita (isFree === true).
 * O status (locked/unlocked) não interfere mais no acesso, apenas em sinalização visual.
 */
export function isLessonAccessibleForUser(
  lesson: { status: string; isFree?: boolean },
  isPaidUser: boolean
): boolean {
  if (isPaidUser) return true;
  return lesson.isFree === true;
}
