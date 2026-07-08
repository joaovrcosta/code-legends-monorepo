import { PlanFeatures } from '@code-legends/plans'
import { describe, it, expect } from 'vitest'

/**
 * Regra de acesso a aulas por capability (espelha verify-lesson-access):
 * - catalog.paid: pode acessar qualquer aula do curso em que está inscrito.
 * - sem catalog.paid: só pode acessar aulas com lesson.isFree === true ou curso gratuito.
 */
function canAccessPaidLesson(
  hasCatalogPaid: boolean,
  lessonIsFree: boolean,
  courseIsFree = false,
): boolean {
  if (hasCatalogPaid) return true
  return lessonIsFree === true || courseIsFree === true
}

describe('Lesson access: capability-driven free vs paid', () => {
  it('FREE não acessa aula paga (lessonIsFree = false)', () => {
    expect(canAccessPaidLesson(false, false)).toBe(false)
  })

  it('FREE acessa aula gratuita (lessonIsFree = true)', () => {
    expect(canAccessPaidLesson(false, true)).toBe(true)
  })

  it('FREE acessa qualquer aula quando o curso é gratuito', () => {
    expect(canAccessPaidLesson(false, false, true)).toBe(true)
  })

  it('PRO (catalog.paid) acessa qualquer aula', () => {
    expect(canAccessPaidLesson(true, false)).toBe(true)
    expect(canAccessPaidLesson(true, true)).toBe(true)
  })

  it('PREMIUM (catalog.paid) acessa qualquer aula', () => {
    expect(canAccessPaidLesson(true, false)).toBe(true)
  })

  it('documenta feature usada no middleware', () => {
    expect(PlanFeatures.CATALOG_PAID).toBe('catalog.paid')
  })
})
