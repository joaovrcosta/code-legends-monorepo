import { describe, expect, it } from 'vitest'
import { computeEstimatedLessonXpReward } from './lesson-xp-reward'

const base = { xpPerLesson: 15, xpPerProject: 50, xpQuizMultiplier: 1.5 }

describe('computeEstimatedLessonXpReward', () => {
  it('vídeo usa xpPerLesson', () => {
    expect(computeEstimatedLessonXpReward('video', base)).toBe(15)
  })

  it('quiz soma XP da lição e dos desafios', () => {
    expect(
      computeEstimatedLessonXpReward('quiz', base, { challengeCount: 3 }),
    ).toBe(15 + 3 * 3)
  })

  it('multi_quiz aplica multiplicador', () => {
    expect(
      computeEstimatedLessonXpReward('multi_quiz', base, { challengeCount: 2 }),
    ).toBe(23 + 2 * 3)
  })
})
