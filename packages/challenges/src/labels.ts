import type { ChallengeType } from './types'

export const CHALLENGE_TYPES: ChallengeType[] = [
  'prediction',
  'conceptual',
  'mcq',
  'bug',
  'refactor',
  'complete',
  'block_slots',
  'exam_mcq',
]

/** Tipos que participam de quiz/artigo de lição (exclui exam_mcq — só carreira). */
export const LESSON_CHALLENGE_TYPES: ChallengeType[] = CHALLENGE_TYPES.filter(
  (t) => t !== 'exam_mcq',
)

export const CHALLENGE_TYPE_LABELS: Record<ChallengeType, string> = {
  prediction: 'Previsão (o que acontece no código?)',
  bug: 'Encontre o Bug',
  refactor: 'Refatoração',
  complete: 'Complete o Código',
  conceptual: 'Conceitual (sem código)',
  mcq: 'Múltipla escolha',
  block_slots: 'Encaixar comandos',
  exam_mcq: 'Exame — múltipla escolha (one-shot, só na carreira)',
}

/** Alias legado no markdown / BlockNote. */
export const LEGACY_CHALLENGE_TYPE_ALIASES: Record<string, ChallengeType> = {
  parsons: 'block_slots',
}
