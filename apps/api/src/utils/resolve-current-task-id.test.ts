import { describe, expect, it } from 'vitest'
import { resolveDisplayCurrentTaskId } from './resolve-current-task-id'

const lessons = [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]

describe('resolveDisplayCurrentTaskId', () => {
  it('retorna a primeira incompleta mesmo com storedTaskId à frente', () => {
    const completed = new Set([4])
    const result = resolveDisplayCurrentTaskId(
      lessons,
      (id) => completed.has(id),
      4,
    )
    expect(result).toBe(1)
  })

  it('retorna a primeira incompleta quando só a última do módulo anterior foi feita', () => {
    const completed = new Set([3])
    const result = resolveDisplayCurrentTaskId(
      lessons,
      (id) => completed.has(id),
      4,
    )
    expect(result).toBe(1)
  })

  it('quando todas completas, usa storedTaskId se válido', () => {
    const completed = new Set([1, 2, 3, 4])
    expect(
      resolveDisplayCurrentTaskId(lessons, (id) => completed.has(id), 3),
    ).toBe(3)
  })

  it('quando todas completas sem stored, retorna a última', () => {
    const completed = new Set([1, 2, 3, 4])
    expect(
      resolveDisplayCurrentTaskId(lessons, (id) => completed.has(id), null),
    ).toBe(4)
  })

  it('sem progresso, retorna a primeira lição', () => {
    expect(
      resolveDisplayCurrentTaskId(lessons, () => false, 99),
    ).toBe(1)
  })

  it('lista vazia retorna null', () => {
    expect(resolveDisplayCurrentTaskId([], () => false, 1)).toBe(null)
  })
})
