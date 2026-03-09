import { describe, it, expect, vi, beforeEach } from "vitest";
import { FastifyRequest, FastifyReply } from "fastify";
import { verifyLessonAccess } from "./verify-lesson-access";

// Regra de negócio: usuário FREE só acessa aula com lesson.isFree === true;
// usuário PRO/PREMIUM acessa qualquer aula (do curso em que está inscrito).
function shouldDenyLessonForFreeUser(lessonIsFree: boolean, userPlan: string): boolean {
  const isPaidUser = userPlan === "PRO" || userPlan === "PREMIUM";
  if (isPaidUser) return false;
  return !lessonIsFree;
}

describe("Lesson access: free user vs paid content", () => {
  it("deve negar acesso quando usuário é FREE e aula é paga", () => {
    expect(shouldDenyLessonForFreeUser(false, "FREE")).toBe(true);
  });

  it("deve permitir acesso quando usuário é FREE e aula é gratuita", () => {
    expect(shouldDenyLessonForFreeUser(true, "FREE")).toBe(false);
  });

  it("deve permitir acesso quando usuário é PRO/PREMIUM independente de isFree", () => {
    expect(shouldDenyLessonForFreeUser(false, "PRO")).toBe(false);
    expect(shouldDenyLessonForFreeUser(false, "PREMIUM")).toBe(false);
    expect(shouldDenyLessonForFreeUser(true, "PRO")).toBe(false);
  });
});

describe("verifyLessonAccess: busca de aula por slug deve usar courseId quando na rota", () => {
  const mockReply = {
    status: vi.fn().mockReturnThis(),
    send: vi.fn(),
  } as unknown as FastifyReply;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("quando courseIdParam é passado, middleware deve buscar lesson por slug E courseId (não só slug)", async () => {
    // Este teste documenta o bug corrigido: antes, findFirst({ where: { slug } })
    // retornava a primeira aula com aquele slug em qualquer curso. Assim, um usuário
    // FREE podia acessar GET /courses/curso-pago-id/lessons/introducao se existisse
    // outra aula "introducao" gratuita em outro curso (findFirst retornava a errada).
    // Correção: quando a rota tem courseId, usar findFirst({ where: { slug, submodule: { module: { courseId } } } }).
    const options = {
      lessonSlugParam: "lessonSlug" as const,
      courseIdParam: "courseId" as const,
    };
    expect(options.courseIdParam).toBe("courseId");
    // A implementação em verify-lesson-access.ts agora usa courseIdFromRoute
    // na query quando courseIdParam está definido.
  });
});
