import { extractChallengeFenceInnersFromArticleBody } from '@code-legends/shared-types'

/** Idempotência em `UserXpEvent` ao ganhar XP por desafio (primeira resposta certa). */
export function challengeFirstCorrectReasonId(
  lessonId: number,
  challengeIndex: number,
): string {
  return `challenge_first_correct:${lessonId}:${challengeIndex}`
}

export function countArticleChallengeBlocks(body: string | null | undefined): number {
  return extractChallengeFenceInnersFromArticleBody(body).length
}

/** Tipos de desafio persistidos no quiz / artigo (alinhado ao content-hub + classroom). */
const CHALLENGE_TYPE_SLUGS = new Set([
  'prediction',
  'conceptual',
  'bug',
  'refactor',
  'complete',
  'block_slots',
])

function isQuizChallengeLike(x: unknown): boolean {
  if (!x || typeof x !== 'object') return false
  const o = x as Record<string, unknown>
  if (typeof o.question === 'string') return true
  if (typeof o.type === 'string') {
    const t = o.type.toLowerCase()
    if (CHALLENGE_TYPE_SLUGS.has(t)) return true
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

export function normalizeLessonTypeForXp(typeRaw: unknown): string {
  return String(typeRaw ?? '')
    .toUpperCase()
    .replace(/-/g, '_')
}
