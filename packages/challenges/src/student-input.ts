import type { Challenge, StudentInputMode } from './types'

const CHOICE_TYPES = new Set(['prediction', 'conceptual', 'mcq', 'bug'])
const TEXT_TYPES = new Set(['refactor', 'complete'])

/** Modo de entrada do aluno no classroom (não confundir com metadados do editor). */
export function getStudentInputMode(challenge: Challenge): StudentInputMode {
  if (challenge.type === 'block_slots') return 'block_slots'
  if (challenge.type === 'exam_mcq') return 'exam_mcq'

  const hasOptions =
    Array.isArray(challenge.options) && challenge.options.length > 0

  if (CHOICE_TYPES.has(challenge.type) && hasOptions) return 'choice'
  if (TEXT_TYPES.has(challenge.type)) return 'text'
  if (
    !hasOptions &&
    (challenge.type === 'bug' ||
      challenge.type === 'conceptual' ||
      challenge.type === 'mcq')
  ) {
    return 'text'
  }
  if (hasOptions) return 'choice'
  return 'text'
}

/** Múltipla escolha no fluxo de exame da carreira (com ou sem tipo `exam_mcq`). */
export function isCareerExamMultipleChoice(challenge: Challenge): boolean {
  const opts = challenge.options
  const hasOptions = Array.isArray(opts) && opts.length > 0
  if (!hasOptions) return false
  if (challenge.type === 'exam_mcq') return true
  return (
    challenge.type === 'conceptual' ||
    challenge.type === 'prediction' ||
    challenge.type === 'bug'
  )
}
