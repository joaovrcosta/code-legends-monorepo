import type { GamificationSettings } from '../utils/gamification-settings-cache'

function challengeXpPerCorrect(gamification: GamificationSettings): number {
  return Math.max(1, Math.min(80, Math.round(gamification.xpPerLesson / 5)))
}

/** XP estimado ao concluir a aula (mesma base do complete + challenge-xp). */
export function computeEstimatedLessonXpReward(
  lessonType: string,
  gamification: GamificationSettings,
  options?: { challengeCount?: number },
): number {
  const type = lessonType.toLowerCase()
  const challenges = options?.challengeCount ?? 0
  const perChallenge = challengeXpPerCorrect(gamification)

  if (type === 'multi_quiz') {
    const lessonXp = Math.round(
      gamification.xpPerLesson * gamification.xpQuizMultiplier,
    )
    return lessonXp + challenges * perChallenge
  }

  if (type === 'quiz') {
    return gamification.xpPerLesson + challenges * perChallenge
  }

  // complete.ts usa xpPerLesson para vídeo, artigo, texto e projeto
  return gamification.xpPerLesson
}
