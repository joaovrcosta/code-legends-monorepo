import { describe, it, expect } from 'vitest'
import {
  calculateLevel,
  calculateXpForLevel,
  calculateXpRemainingToNextLevel,
} from './xp-progression'

describe('xp-progression', () => {
  it('deve calcular level básico', () => {
    expect(calculateLevel(0)).toBe(1)
    expect(calculateLevel(99)).toBe(1)
    expect(calculateLevel(100)).toBe(1)
    expect(calculateLevel(250)).toBe(2) // xpForLevel(2)=250
  })

  it('deve calcular XP faltante para o próximo nível', () => {
    const level2At250 = calculateLevel(250)
    expect(level2At250).toBe(2)
    expect(calculateXpForLevel(3)).toBe(450)
    expect(calculateXpRemainingToNextLevel(2, 250)).toBe(200)
    expect(calculateXpRemainingToNextLevel(2, 999999)).toBe(0)
  })
})

