import { describe, it, expect } from "vitest";

/**
 * Regra de negócio: não permitir associar na aula uma skill que já exista no curso.
 * (A validação real ocorre no controller PUT /lessons/:id/skills-config.)
 */
describe("Lesson skills: bloquear duplicidade com skills do curso", () => {
  function getInvalidSkillIds(params: {
    courseSkillIds: string[];
    requestedSkillIds: string[];
  }) {
    const courseSet = new Set(params.courseSkillIds);
    return params.requestedSkillIds.filter((id) => courseSet.has(id));
  }

  it("deve bloquear skill da aula quando ela já está no curso", () => {
    const invalid = getInvalidSkillIds({
      courseSkillIds: ["logic", "js", "design"],
      requestedSkillIds: ["logic"],
    });

    expect(invalid).toEqual(["logic"]);
  });

  it("deve permitir skills que não estejam no curso", () => {
    const invalid = getInvalidSkillIds({
      courseSkillIds: ["logic", "js", "design"],
      requestedSkillIds: ["databases", "docker"],
    });

    expect(invalid).toEqual([]);
  });
});

