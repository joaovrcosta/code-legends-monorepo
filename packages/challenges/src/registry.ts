import type { ChallengeType } from './types'
import {
  blockSlotsHandler,
  textAnswerHandler,
  type ChallengeHandler,
} from './handlers'
import { CHALLENGE_TYPES, LEGACY_CHALLENGE_TYPE_ALIASES } from './labels'

export const CHALLENGE_HANDLERS: Record<ChallengeType, ChallengeHandler> = {
  prediction: textAnswerHandler,
  bug: textAnswerHandler,
  refactor: textAnswerHandler,
  complete: textAnswerHandler,
  conceptual: textAnswerHandler,
  mcq: textAnswerHandler,
  exam_mcq: textAnswerHandler,
  block_slots: blockSlotsHandler,
}

const TYPE_SET = new Set<string>(CHALLENGE_TYPES)

export function isChallengeType(s: string): s is ChallengeType {
  return TYPE_SET.has(s)
}

export function normalizeChallengeType(raw: string): ChallengeType | null {
  const lower = raw.toLowerCase().trim()
  if (LEGACY_CHALLENGE_TYPE_ALIASES[lower]) {
    return LEGACY_CHALLENGE_TYPE_ALIASES[lower]
  }
  if (isChallengeType(lower)) return lower
  return null
}

export function getHandler(type: ChallengeType): ChallengeHandler {
  return CHALLENGE_HANDLERS[type] ?? textAnswerHandler
}

export function validateAnswer(
  challenge: { type: ChallengeType } & Parameters<ChallengeHandler['validateAnswer']>[0],
  answer: Parameters<ChallengeHandler['validateAnswer']>[1],
): boolean {
  return getHandler(challenge.type).validateAnswer(challenge, answer)
}
