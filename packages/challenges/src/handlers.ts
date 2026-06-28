import type { Challenge, ChallengeAnswer } from './types'
import { normalizeAnswer } from './normalize-answer'
import {
  arraysEqual,
  normalizeBlockSlotsSolution,
} from './block-slots'

export interface ChallengeHandler {
  /** Como validar resposta do aluno. */
  validateAnswer: (challenge: Challenge, answer: ChallengeAnswer) => boolean
}

export function validateTextAnswer(
  challenge: Challenge,
  answer: ChallengeAnswer,
): boolean {
  if (typeof answer !== 'string') return false
  const norm = normalizeAnswer(answer)
  if (challenge.correctAnswer !== undefined) {
    if (normalizeAnswer(challenge.correctAnswer) === norm) return true
  }
  if (challenge.correctAnswers) {
    return challenge.correctAnswers.some((a) => normalizeAnswer(a) === norm)
  }
  return false
}

export function validateBlockSlotsAnswer(
  challenge: Challenge,
  answer: ChallengeAnswer,
): boolean {
  if (!Array.isArray(answer)) return false
  const target = normalizeBlockSlotsSolution(challenge)
  if (!target) return false
  return arraysEqual(target, answer)
}

export const textAnswerHandler: ChallengeHandler = {
  validateAnswer: validateTextAnswer,
}

export const blockSlotsHandler: ChallengeHandler = {
  validateAnswer: validateBlockSlotsAnswer,
}
