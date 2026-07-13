import { describe, expect, it } from 'vitest'
import { pickContinueTargetLesson } from './lesson-url'
import type { RoadmapLesson } from '../types/roadmap'

function lesson(
  id: number,
  status: RoadmapLesson['status'],
  isCurrent = false,
): RoadmapLesson {
  return {
    id,
    title: `Lesson ${id}`,
    slug: `lesson-${id}`,
    description: '',
    type: 'video',
    order: id,
    status,
    isCurrent,
    canReview: status === 'completed',
  }
}

describe('pickContinueTargetLesson', () => {
  it('prefere primeira pendente sobre isCurrent à frente', () => {
    const all = [
      lesson(1, 'unlocked'),
      lesson(2, 'unlocked'),
      lesson(3, 'completed'),
      lesson(4, 'unlocked', true),
    ]
    expect(pickContinueTargetLesson(all)?.id).toBe(1)
  })

  it('retorna primeira unlocked se isCurrent está completed', () => {
    const all = [
      lesson(1, 'completed'),
      lesson(2, 'unlocked', true),
    ]
    expect(pickContinueTargetLesson(all)?.id).toBe(2)
  })

  it('respeita isAccessible', () => {
    const all = [
      lesson(1, 'unlocked'),
      lesson(2, 'unlocked'),
    ]
    expect(
      pickContinueTargetLesson(all, (l) => l.id !== 1)?.id,
    ).toBe(2)
  })
})
