import { describe, it, expect } from 'vitest'
import {
  distributeXpToSkills,
  distributeAdditiveSkillXp,
  sumXpEntries,
  xpRemainderAfterDistribution,
} from './skill-xp-distribution'

describe('distributeXpToSkills', () => {
  it('deve aplicar peso 100% integralmente', () => {
    expect(
      distributeXpToSkills(15, [{ skillId: 'js', weight: 100 }]),
    ).toEqual([{ skillId: 'js', xpAmount: 15 }])
  })

  it('deve ignorar pesos que arredondam para 0', () => {
    expect(
      distributeXpToSkills(15, [
        { skillId: 'low', weight: 1 },
        { skillId: 'ok', weight: 10 },
      ]),
    ).toEqual([{ skillId: 'ok', xpAmount: 2 }])
  })

  it('deve dividir pesos parciais com arredondamento', () => {
    const entries = distributeXpToSkills(15, [
      { skillId: 'a', weight: 33 },
      { skillId: 'b', weight: 33 },
      { skillId: 'c', weight: 34 },
    ])

    expect(sumXpEntries(entries)).toBe(15)
    expect(entries).toEqual([
      { skillId: 'a', xpAmount: 5 },
      { skillId: 'b', xpAmount: 5 },
      { skillId: 'c', xpAmount: 5 },
    ])
  })
})

describe('distributeAdditiveSkillXp', () => {
  it('deve somar XP de skills do curso e da aula (aditivo)', () => {
    const entries = distributeAdditiveSkillXp(
      15,
      [{ skillId: 'courseSkill', weight: 100 }],
      [{ skillId: 'lessonSkill', weight: 100 }],
    )

    expect(entries).toEqual([
      { skillId: 'courseSkill', xpAmount: 15 },
      { skillId: 'lessonSkill', xpAmount: 15 },
    ])
    expect(sumXpEntries(entries)).toBe(30)
  })

  it('deve calcular remainder quando arredondamento perde XP', () => {
    const entries = distributeAdditiveSkillXp(
      15,
      [
        { skillId: 'a', weight: 33 },
        { skillId: 'b', weight: 33 },
      ],
      [],
    )

    expect(sumXpEntries(entries)).toBe(10)
    expect(xpRemainderAfterDistribution(15, entries)).toBe(5)
  })
})

describe('XP por desafio (xpPerLesson / 5)', () => {
  it('deve gerar 3 XP por desafio quando xpPerLesson é 15', () => {
    const xpPerLesson = 15
    const challengeXp = Math.max(
      1,
      Math.min(80, Math.round(xpPerLesson / 5)),
    )

    expect(challengeXp).toBe(3)
  })

  it('6 aulas: só lesson_completed somava 98; com desafio (+3) totaliza 101', () => {
    const lessonCompletedXp = [15, 15, 26, 15, 15, 12]
    const challengeXp = 3

    expect(lessonCompletedXp.reduce((a, b) => a + b, 0)).toBe(98)
    expect(
      lessonCompletedXp.reduce((a, b) => a + b, 0) + challengeXp,
    ).toBe(101)
  })

  it('só lesson_completed subconta XP e simula os 3 XP “fantasma” na barra', () => {
    const lessonOnly = [15, 15, 26, 15, 15, 12]
    const challengeXp = 3
    const totalOnSkill = lessonOnly.reduce((a, b) => a + b, 0) + challengeXp
    const gainedInModuleLessonOnly = lessonOnly.reduce((a, b) => a + b, 0)
    const previousXpBug = totalOnSkill - gainedInModuleLessonOnly

    expect(totalOnSkill).toBe(101)
    expect(gainedInModuleLessonOnly).toBe(98)
    expect(previousXpBug).toBe(3)
  })
})
