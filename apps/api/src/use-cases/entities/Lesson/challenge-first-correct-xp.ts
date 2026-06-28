import {
  countArticleChallengeBlocks,
  countChallengeSlots,
  isQuizChallengeLike,
  normalizeLessonTypeForXp,
  normalizeQuizContentToArray,
} from '@code-legends/challenges/slots'

export {
  countArticleChallengeBlocks,
  countChallengeSlots,
  isQuizChallengeLike,
  normalizeLessonTypeForXp,
  normalizeQuizContentToArray,
}

/** Idempotência em `UserXpEvent` ao ganhar XP por desafio (primeira resposta certa). */
export function challengeFirstCorrectReasonId(
  lessonId: number,
  challengeIndex: number,
): string {
  return `challenge_first_correct:${lessonId}:${challengeIndex}`
}
