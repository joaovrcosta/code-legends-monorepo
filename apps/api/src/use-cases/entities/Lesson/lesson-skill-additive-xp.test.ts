import { describe, it, expect } from "vitest";

/**
 * Documenta a regra escolhida: distribuição de XP por skill é ADITIVA
 * (CourseSkill + LessonSkill), com pesos 0-100 aplicados sobre xpAmount.
 */
describe("Lesson completion: XP por skill (aditivo curso + aula)", () => {
  function distribute(xpAmount: number, rows: Array<{ skillId: string; weight: number }>) {
    return rows
      .map((row) => ({
        skillId: row.skillId,
        xp: Math.round(xpAmount * (row.weight / 100)),
      }))
      .filter((row) => row.xp > 0);
  }

  it("deve aplicar XP para skills do curso e da aula (aditivo)", () => {
    const xpAmount = 15;

    const course = distribute(xpAmount, [
      { skillId: "courseSkill", weight: 100 },
    ]);
    const lesson = distribute(xpAmount, [
      { skillId: "lessonSkill", weight: 100 },
    ]);

    expect(course).toEqual([{ skillId: "courseSkill", xp: 15 }]);
    expect(lesson).toEqual([{ skillId: "lessonSkill", xp: 15 }]);

    // aditivo => total em skills pode ser maior que xpAmount
    const total = [...course, ...lesson].reduce((sum, row) => sum + row.xp, 0);
    expect(total).toBe(30);
  });

  it("deve ignorar pesos que resultam em 0 XP", () => {
    const xpAmount = 15;
    const rows = distribute(xpAmount, [
      { skillId: "low", weight: 1 }, // Math.round(0.15) => 0
      { skillId: "ok", weight: 10 }, // Math.round(1.5) => 2
    ]);

    expect(rows).toEqual([{ skillId: "ok", xp: 2 }]);
  });
});

