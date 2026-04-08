/**
 * Razão idempotente em UserXpEvent ao completar lição (ver AwardXpUseCase / complete lesson).
 */
export function lessonCompletedXpReasonId(lessonId: number): string {
  return `lesson_completed:${lessonId}`;
}

export function shouldGrantLessonCompletionXp(opts: {
  wasAlreadyCompleted: boolean;
  isCompleted: boolean;
  lessonXpEventExists: boolean;
}): boolean {
  return (
    !opts.wasAlreadyCompleted &&
    opts.isCompleted &&
    !opts.lessonXpEventExists
  );
}
