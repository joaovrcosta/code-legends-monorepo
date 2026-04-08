import { describe, it, expect } from "vitest";

import {
  lessonCompletedXpReasonId,
  shouldGrantLessonCompletionXp,
} from "./lesson-complete-xp-gate";

describe("Lesson completion XP gate (idempotência pós-reset)", () => {
  it("lessonCompletedXpReasonId segue o contrato UserXpEvent", () => {
    expect(lessonCompletedXpReasonId(42)).toBe("lesson_completed:42");
  });

  it("após reset: progresso novo mas evento XP já existe → não concede", () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: true,
        lessonXpEventExists: true,
      }),
    ).toBe(false);
  });

  it("primeira conclusão: sem evento → concede", () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: true,
        lessonXpEventExists: false,
      }),
    ).toBe(true);
  });

  it("duplo clique: progresso já completo → não concede (evita findUnique extra na prática)", () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: true,
        isCompleted: true,
        lessonXpEventExists: false,
      }),
    ).toBe(false);
  });

  it("quiz reprovado: isCompleted false → não concede", () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: false,
        lessonXpEventExists: false,
      }),
    ).toBe(false);
  });
});
