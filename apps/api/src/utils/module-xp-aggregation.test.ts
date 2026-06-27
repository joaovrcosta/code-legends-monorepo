import { describe, it, expect } from 'vitest'
import { aggregateModuleXpBySkill } from './module-xp-aggregation'

const JS = 'skill-javascript'

describe('aggregateModuleXpBySkill', () => {
  const moduleLessonIds = [1, 2, 3, 4, 5, 6]

  it('deve somar lesson_completed e challenge_first_correct do módulo', () => {
    const historyRows = [
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 2 },
      { skillId: JS, xpAmount: 26, source: 'lesson_completed', sourceId: 3 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 4 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 5 },
      { skillId: JS, xpAmount: 12, source: 'lesson_completed', sourceId: 6 },
      { skillId: JS, xpAmount: 3, source: 'challenge_first_correct', sourceId: 3 },
    ]

    const result = aggregateModuleXpBySkill(historyRows, moduleLessonIds)

    expect(result.xpGainedInModule).toBe(101)
    expect(result.xpGainedInModuleBySkill).toEqual([{ skillId: JS, xp: 101 }])
  })

  it('não deve contar XP de aulas fora do módulo', () => {
    const historyRows = [
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 20, source: 'lesson_completed', sourceId: 99 },
      { skillId: JS, xpAmount: 3, source: 'challenge_first_correct', sourceId: 99 },
    ]

    const result = aggregateModuleXpBySkill(historyRows, moduleLessonIds)

    expect(result.xpGainedInModule).toBe(15)
  })

  it('não deve contar fontes desconhecidas (ex.: bônus manual)', () => {
    const historyRows = [
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 50, source: 'admin_adjustment', sourceId: 1 },
    ]

    const result = aggregateModuleXpBySkill(historyRows, moduleLessonIds)

    expect(result.xpGainedInModule).toBe(15)
  })

  it('deve agrupar XP por skill quando há mais de uma', () => {
    const historyRows = [
      { skillId: 'logic', xpAmount: 10, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 5, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 3, source: 'challenge_first_correct', sourceId: 1 },
    ]

    const result = aggregateModuleXpBySkill(historyRows, [1])

    expect(result.xpGainedInModule).toBe(18)
    expect(result.xpGainedInModuleBySkill).toEqual(
      expect.arrayContaining([
        { skillId: 'logic', xp: 10 },
        { skillId: JS, xp: 8 },
      ]),
    )
  })

  it('previousXp = totalXp - gainedInModule fica 0 após reset quando agregação está correta', () => {
    const totalXpOnSkill = 101
    const historyRows = [
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 1 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 2 },
      { skillId: JS, xpAmount: 26, source: 'lesson_completed', sourceId: 3 },
      { skillId: JS, xpAmount: 3, source: 'challenge_first_correct', sourceId: 3 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 4 },
      { skillId: JS, xpAmount: 15, source: 'lesson_completed', sourceId: 5 },
      { skillId: JS, xpAmount: 12, source: 'lesson_completed', sourceId: 6 },
    ]

    const { xpGainedInModule } = aggregateModuleXpBySkill(
      historyRows,
      moduleLessonIds,
    )
    const previousXp = Math.max(0, totalXpOnSkill - xpGainedInModule)

    expect(xpGainedInModule).toBe(101)
    expect(previousXp).toBe(0)
  })
})
