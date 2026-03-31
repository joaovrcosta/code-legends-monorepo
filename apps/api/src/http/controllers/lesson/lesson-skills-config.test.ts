import { describe, it, expect } from "vitest";

/**
 * Regras de validação para skills por aula:
 * - Não pode associar na aula uma skill que já exista no curso (CourseSkill).
 *   (Mesmo que o backend também valide via DB, este teste documenta a regra.)
 */
describe("Lesson skills config: bloquear skills já presentes no curso", () => {
  function getInvalidSkillIds(params: {
    courseSkillIds: string[];
    requestedSkillIds: string[];
  }) {
    const courseSet = new Set(params.courseSkillIds);
    return params.requestedSkillIds.filter((id) => courseSet.has(id));
  }

  it("deve retornar interseção quando payload inclui skill do curso", () => {
    const invalid = getInvalidSkillIds({
      courseSkillIds: ["skillA", "skillB", "skillC"],
      requestedSkillIds: ["skillX", "skillB", "skillY", "skillA"],
    });

    expect(invalid).toEqual(["skillB", "skillA"]);
  });

  it("deve retornar vazio quando payload não inclui skills do curso", () => {
    const invalid = getInvalidSkillIds({
      courseSkillIds: ["skillA"],
      requestedSkillIds: ["skillX", "skillY"],
    });

    expect(invalid).toEqual([]);
  });
});

