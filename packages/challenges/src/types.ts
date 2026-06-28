export type ChallengeType =
  | 'prediction'
  | 'bug'
  | 'refactor'
  | 'complete'
  | 'conceptual'
  | 'mcq'
  | 'block_slots'
  | 'exam_mcq'

export interface ParsonsPiece {
  id: string
  content: string
}

export interface Challenge {
  type: ChallengeType
  question: string
  code?: string
  language?: string
  options?: string[]
  correctAnswer?: string
  correctAnswers?: string[]
  explanation?: string
  placeholder?: string
  pieces?: ParsonsPiece[]
  solution?: string[]
  missionImageUrl?: string
  shuffleOptions?: boolean
}

/** Resposta do aluno: texto ou ordem de ids (block_slots). */
export type ChallengeAnswer = string | string[]

export type StudentInputMode = 'choice' | 'text' | 'block_slots' | 'exam_mcq'
