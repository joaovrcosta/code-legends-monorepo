import { describe, expect, it } from 'vitest'
import {
  buildBlockSlotsFromLines,
  normalizeBlockSlotsSolution,
  validateAnswer,
  validateTextAnswer,
  validateBlockSlotsAnswer,
  normalizeAnswer,
} from './index'
import type { Challenge } from './types'

describe('normalizeAnswer', () => {
  it('trims and lowercases', () => {
    expect(normalizeAnswer('  Hello   World  ')).toBe('hello world')
  })
})

describe('validateTextAnswer', () => {
  const base: Challenge = {
    type: 'mcq',
    question: 'Q?',
    correctAnswer: 'Foo Bar',
  }

  it('matches correctAnswer case-insensitively', () => {
    expect(validateTextAnswer(base, 'foo bar')).toBe(true)
    expect(validateTextAnswer(base, 'wrong')).toBe(false)
  })

  it('matches any correctAnswers', () => {
    const ch: Challenge = {
      ...base,
      correctAnswer: undefined,
      correctAnswers: ['a', 'b'],
    }
    expect(validateTextAnswer(ch, 'B')).toBe(true)
    expect(validateTextAnswer(ch, 'c')).toBe(false)
  })
})

describe('validateBlockSlotsAnswer', () => {
  const challenge: Challenge = {
    type: 'block_slots',
    question: 'Ordene',
    pieces: [
      { id: 'c0', content: 'a' },
      { id: 'c1', content: 'b' },
      { id: 'd0', content: 'x' },
    ],
    solution: ['c0', 'c1', 'd0'],
  }

  it('accepts correct order', () => {
    expect(validateBlockSlotsAnswer(challenge, ['c0', 'c1', 'd0'])).toBe(true)
  })

  it('rejects wrong order', () => {
    expect(validateBlockSlotsAnswer(challenge, ['c1', 'c0', 'd0'])).toBe(false)
  })

  it('rejects string answer', () => {
    expect(validateBlockSlotsAnswer(challenge, 'c0')).toBe(false)
  })
})

describe('normalizeBlockSlotsSolution', () => {
  it('appends distractors after core solution', () => {
    const ch: Challenge = {
      type: 'block_slots',
      question: 'Q',
      pieces: [
        { id: 'c0', content: '1' },
        { id: 'd0', content: '2' },
      ],
      solution: ['c0'],
    }
    expect(normalizeBlockSlotsSolution(ch)).toEqual(['c0', 'd0'])
  })
})

describe('buildBlockSlotsFromLines', () => {
  it('creates c/d ids', () => {
    const { pieces, solution } = buildBlockSlotsFromLines('line1\nline2', 'dist')
    expect(pieces).toHaveLength(3)
    expect(solution).toEqual(['c0', 'c1', 'd0'])
  })
})

describe('validateAnswer', () => {
  it('delegates by type', () => {
    const ch: Challenge = { type: 'prediction', question: 'Q', correctAnswer: 'x' }
    expect(validateAnswer(ch, 'x')).toBe(true)
  })
})
