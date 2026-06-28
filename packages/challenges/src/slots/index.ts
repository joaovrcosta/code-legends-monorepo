import { extractChallengeFenceInnersFromArticleBody } from '@code-legends/shared-types'
import { LESSON_CHALLENGE_TYPES } from '../labels'
import type { ChallengeType } from '../types'

const LESSON_TYPE_SLUGS = new Set(LESSON_CHALLENGE_TYPES)

export function isQuizChallengeLike(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.question === 'string') return true
  if (typeof o.type === 'string') {
    const t = o.type.toLowerCase()
    if (LESSON_TYPE_SLUGS.has(t as ChallengeType)) return true
  }
  return false
}

const QUIZ_JSON_KEYS = [
  'content',
  'challenges',
  'items',
  'questions',
  'data',
  'quiz',
  'steps',
  'blocks',
] as const

export function normalizeQuizContentToArray(
  content: unknown,
  depth = 0,
): unknown[] {
  if (depth > 14) return []
  if (content == null) return []

  if (typeof content === 'string') {
    const trimmed = content.trim()
    if (!trimmed) return []
    try {
      return normalizeQuizContentToArray(JSON.parse(trimmed) as unknown, depth + 1)
    } catch {
      return []
    }
  }

  if (Array.isArray(content)) {
    const flatChallenges = content.filter(isQuizChallengeLike)
    if (flatChallenges.length > 0) return flatChallenges
    for (const el of content) {
      const inner = normalizeQuizContentToArray(el, depth + 1)
      if (inner.length > 0) return inner
    }
    return []
  }

  if (typeof content === 'object') {
    const o = content as Record<string, unknown>
    for (const k of QUIZ_JSON_KEYS) {
      if (o[k] !== undefined && o[k] !== null) {
        const inner = normalizeQuizContentToArray(o[k], depth + 1)
        if (inner.length > 0) return inner
      }
    }
    for (const v of Object.values(o)) {
      if (v === undefined || v === null) continue
      const inner = normalizeQuizContentToArray(v, depth + 1)
      if (inner.length > 0) return inner
    }
  }

  return []
}

export function countArticleChallengeBlocks(
  body: string | null | undefined,
): number {
  return extractChallengeFenceInnersFromArticleBody(body).length
}

export function normalizeLessonTypeForXp(typeRaw: unknown): string {
  return String(typeRaw ?? '')
    .toUpperCase()
    .replace(/-/g, '_')
}

export function countChallengeSlots(
  typeRaw: unknown,
  quizContent: unknown,
  articleBody: string | null | undefined,
): number {
  const type = normalizeLessonTypeForXp(typeRaw)
  if (type === 'QUIZ' || type === 'MULTI_QUIZ') {
    const fromQuiz = normalizeQuizContentToArray(quizContent).length
    if (fromQuiz > 0) return fromQuiz
    return countArticleChallengeBlocks(articleBody)
  }
  if (type === 'ARTICLE' || type === 'TEXT') {
    return countArticleChallengeBlocks(articleBody)
  }
  return 0
}
