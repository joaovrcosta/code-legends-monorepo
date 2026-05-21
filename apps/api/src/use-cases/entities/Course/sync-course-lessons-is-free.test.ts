import { describe, it, expect } from 'vitest'
import { resolveLessonFreeSyncAction } from './sync-course-lessons-is-free'

describe('resolveLessonFreeSyncAction', () => {
  it('marca all_free ao tornar curso gratuito sem param explícito', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: false,
        isFreeNow: true,
      }),
    ).toBe('all_free')
  })

  it('respeita all_free explícito', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: true,
        isFreeNow: true,
        explicit: 'all_free',
      }),
    ).toBe('all_free')
  })

  it('respeita all_paid explícito ao desmarcar curso gratuito', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: true,
        isFreeNow: false,
        explicit: 'all_paid',
      }),
    ).toBe('all_paid')
  })

  it('keep não dispara sync', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: true,
        isFreeNow: false,
        explicit: 'keep',
      }),
    ).toBe(null)
  })

  it('desmarcar gratuito sem param não altera aulas', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: true,
        isFreeNow: false,
      }),
    ).toBe(null)
  })

  it('curso permanece pago sem sync', () => {
    expect(
      resolveLessonFreeSyncAction({
        wasFree: false,
        isFreeNow: false,
      }),
    ).toBe(null)
  })
})
