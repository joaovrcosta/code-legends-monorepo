import { describe, it, expect } from 'vitest'
import { findNextUnlockedLessonId } from './complete'
import { shouldGrantLessonCompletionXp } from './lesson-complete-xp-gate'
import {
  effectiveCurrentStreak,
  formatYYYYMMDDInTZSP,
} from '../../../utils/streak-calendar'

type LessonRef = { id: number; order: number; moduleId: string }

function lessons(ids: number[]): LessonRef[] {
  return ids.map((id, order) => ({
    id,
    order,
    moduleId: order < 3 ? 'm1' : 'm2',
  }))
}

describe('Complete lesson — unlock em memória', () => {
  it('libera a próxima aula quando a atual fica completa no Map', () => {
    const all = lessons([1, 2, 3, 4])
    const completed = new Map<number, boolean>([
      [1, true],
      [2, true],
    ])

    expect(findNextUnlockedLessonId(all, 2, completed)).toBe(3)
  })

  it('pula aulas travadas até achar a primeira com anterior completa', () => {
    const all = lessons([1, 2, 3, 4])
    // 2 incompleta → 3 travada; 3 completa no map não importa se 2 não está
    const completed = new Map<number, boolean>([
      [1, true],
      [2, false],
      [3, true],
    ])

    expect(findNextUnlockedLessonId(all, 1, completed)).toBe(2)
  })

  it('retorna null quando não há próxima aula desbloqueada', () => {
    const all = lessons([1, 2, 3])
    const completed = new Map<number, boolean>([[1, true]])

    // Atual = 1; próxima candidata 2 exige 1 ok (ok), então retorna 2
    expect(findNextUnlockedLessonId(all, 1, completed)).toBe(2)

    // Na última aula completa, não há next
    completed.set(2, true)
    completed.set(3, true)
    expect(findNextUnlockedLessonId(all, 3, completed)).toBe(null)
  })

  it('primeira aula do curso está sempre desbloqueada como candidata', () => {
    const all = lessons([10, 20])
    const completed = new Map<number, boolean>()
    // Buscando next a partir de um id inexistente → null
    expect(findNextUnlockedLessonId(all, 999, completed)).toBe(null)
  })
})

describe('Complete lesson — gate de XP (regressão)', () => {
  it('não concede XP em recomplete', () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: true,
        isCompleted: true,
        lessonXpEventExists: false,
      }),
    ).toBe(false)
  })

  it('não concede XP quando quiz falha', () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: false,
        lessonXpEventExists: false,
      }),
    ).toBe(false)
  })

  it('concede XP na primeira conclusão válida sem event', () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: true,
        lessonXpEventExists: false,
      }),
    ).toBe(true)
  })

  it('não concede XP se UserXpEvent já existe', () => {
    expect(
      shouldGrantLessonCompletionXp({
        wasAlreadyCompleted: false,
        isCompleted: true,
        lessonXpEventExists: true,
      }),
    ).toBe(false)
  })
})

describe('Complete lesson — progresso de módulo/curso em memória', () => {
  function computeProgress(
    lessonIds: number[],
    completedByTaskId: Map<number, boolean>,
  ) {
    const completed = lessonIds.filter(
      (id) => completedByTaskId.get(id) === true,
    ).length
    const total = lessonIds.length
    return {
      progress: total > 0 ? completed / total : 0,
      completed: total > 0 && completed === total,
      newlyCompleted: (wasAlready: boolean) =>
        total > 0 && completed === total && !wasAlready,
    }
  }

  it('marca moduleNewlyCompleted só na transição 100%', () => {
    const ids = [1, 2, 3]
    const map = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, true],
    ])
    const stats = computeProgress(ids, map)
    expect(stats.completed).toBe(true)
    expect(stats.newlyCompleted(false)).toBe(true)
    expect(stats.newlyCompleted(true)).toBe(false)
  })

  it('curso não completa com quiz falho na última aula', () => {
    const ids = [1, 2, 3]
    const map = new Map<number, boolean>([
      [1, true],
      [2, true],
      [3, false], // MULTI_QUIZ < 70
    ])
    const stats = computeProgress(ids, map)
    expect(stats.progress).toBe(2 / 3)
    expect(stats.completed).toBe(false)
  })
})

describe('Complete lesson — streak calendar (SP)', () => {
  it('zera streak efetivo quando a janela de calendário fechou', () => {
    // lastActiveDate antigo → effective 0 (mesma regra usada dentro da TX)
    expect(effectiveCurrentStreak(5, '2020-01-01', new Date('2026-07-12T15:00:00Z'))).toBe(0)
  })

  it('mantém streak quando última atividade foi hoje (SP)', () => {
    const now = new Date('2026-07-12T15:00:00Z')
    const todayKey = formatYYYYMMDDInTZSP(now)
    expect(todayKey).toBeTruthy()
    expect(effectiveCurrentStreak(3, todayKey, now)).toBe(3)
  })
})
