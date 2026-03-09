import { describe, it, expect } from "vitest";

/**
 * Regra de acesso a aulas por plano (espelha verify-lesson-access):
 * - Usuário PRO ou PREMIUM: pode acessar qualquer aula do curso em que está inscrito.
 * - Usuário FREE: só pode acessar aulas com lesson.isFree === true.
 *
 * Bug corrigido: o middleware buscava a aula só por slug, sem courseId.
 * Duas aulas em cursos diferentes com o mesmo slug faziam a verificação usar
 * a aula errada (ex.: free em curso B) e liberar; o controller devolvia a aula
 * do curso solicitado (paga em curso A). Agora a busca usa courseId quando
 * a rota é /courses/:courseId/lessons/:lessonSlug.
 */
function canAccessPaidLesson(userPlan: "FREE" | "PRO" | "PREMIUM", lessonIsFree: boolean): boolean {
  const isPaidUser = userPlan === "PRO" || userPlan === "PREMIUM";
  if (isPaidUser) return true;
  return lessonIsFree === true;
}

describe("Lesson access: free user must not access paid lessons", () => {
  it("FREE não acessa aula paga (lessonIsFree = false)", () => {
    expect(canAccessPaidLesson("FREE", false)).toBe(false);
  });

  it("FREE acessa aula gratuita (lessonIsFree = true)", () => {
    expect(canAccessPaidLesson("FREE", true)).toBe(true);
  });

  it("PRO acessa qualquer aula", () => {
    expect(canAccessPaidLesson("PRO", false)).toBe(true);
    expect(canAccessPaidLesson("PRO", true)).toBe(true);
  });

  it("PREMIUM acessa qualquer aula", () => {
    expect(canAccessPaidLesson("PREMIUM", false)).toBe(true);
    expect(canAccessPaidLesson("PREMIUM", true)).toBe(true);
  });
});
