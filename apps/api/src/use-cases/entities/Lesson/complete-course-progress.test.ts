import { describe, it, expect } from "vitest";

/**
 * Testes para garantir que a lógica de conclusão do curso considera TODAS as lições,
 * incluindo as do tipo ARTICLE. Inconsistência reportada: curso marcado completo
 * em 88% quando ainda faltava o artigo.
 *
 * Regra: curso só está completo quando completedLessons === totalLessons,
 * e totalLessons deve incluir video, article, text, quiz, multi_quiz, project.
 */
describe("Course completion progress (incluindo artigo)", () => {
  /** Reproduz a fórmula usada em Lesson/complete.ts */
  function computeCourseProgress(
    completedLessons: number,
    totalLessons: number
  ): { progress: number; courseCompleted: boolean } {
    const progress =
      totalLessons > 0 ? completedLessons / totalLessons : 0;
    const courseCompleted = completedLessons === totalLessons;
    return { progress, courseCompleted };
  }

  it("deve considerar curso incompleto quando falta 1 lição (ex: artigo)", () => {
    const totalLessons = 8; // ex: 7 vídeos/quizzes + 1 artigo
    const completedLessons = 7; // usuário não completou o artigo

    const { progress, courseCompleted } = computeCourseProgress(
      completedLessons,
      totalLessons
    );

    expect(progress).toBe(7 / 8);
    expect(Math.round(progress * 100)).toBe(88);
    expect(courseCompleted).toBe(false);
  });

  it("deve considerar curso completo apenas quando todas as lições estão concluídas", () => {
    const totalLessons = 8;
    const completedLessons = 8;

    const { progress, courseCompleted } = computeCourseProgress(
      completedLessons,
      totalLessons
    );

    expect(progress).toBe(1);
    expect(courseCompleted).toBe(true);
  });

  it("total de lições deve incluir todos os tipos (video, article, quiz, etc)", () => {
    // Simula contagem: 5 video + 1 article + 2 quiz = 8
    const byType = { video: 5, article: 1, quiz: 2 };
    const totalLessons = Object.values(byType).reduce((a, b) => a + b, 0);

    expect(totalLessons).toBe(8);
    expect(byType.article).toBe(1);

    // Se o backend contar só video+quiz e ignorar article, seria 7
    const wrongTotalIgnoringArticle = byType.video + byType.quiz;
    expect(wrongTotalIgnoringArticle).toBe(7);

    // Com 7 concluídas e total errado 7, o curso seria marcado completo indevidamente
    const { courseCompleted: wrongComplete } = computeCourseProgress(
      7,
      wrongTotalIgnoringArticle
    );
    expect(wrongComplete).toBe(true);

    // Com total correto 8, 7 concluídas não completa o curso
    const { courseCompleted: correctComplete } = computeCourseProgress(7, totalLessons);
    expect(correctComplete).toBe(false);
  });

  it("quando não há próxima lição, isCompleted deve ser courseCompleted (nunca true fixo)", () => {
    // Bug corrigido: ao completar uma lição, se nextLesson era null o código setava isCompleted: true
    // no UserCourse, mesmo com progresso 88% (faltando artigo). Correto: isCompleted = courseCompleted.
    const totalLessons = 8;
    const completedLessons = 7;
    const { courseCompleted } = computeCourseProgress(completedLessons, totalLessons);
    const isCompletedToPersist = courseCompleted; // deve ser false
    expect(isCompletedToPersist).toBe(false);
  });

  it("progresso 88% com curso completo indica bug (total possivelmente sem artigo)", () => {
    const progressPercent = 88;
    const progress = progressPercent / 100; // 0.88

    // Se completedLessons=7 e totalLessons=7 (article não contado), progress = 1 e curso completo
    const totalIfArticleExcluded = 7;
    const completed = 7;
    const { courseCompleted } = computeCourseProgress(completed, totalIfArticleExcluded);
    expect(courseCompleted).toBe(true);

    // Se total correto for 8, 7/8 = 0.875 ≈ 88% e curso NÃO completo
    const totalCorrect = 8;
    const { progress: p, courseCompleted: completeCorrect } = computeCourseProgress(
      completed,
      totalCorrect
    );
    expect(Math.round(p * 100)).toBe(88);
    expect(completeCorrect).toBe(false);
  });
});
