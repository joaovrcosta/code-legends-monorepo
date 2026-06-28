import type { Challenge, ChallengeType } from './types'

/** Metadados de UI para formulários do content-hub (camada de aplicação, não domínio). */
export interface ChallengeEditorMeta {
  showCode: boolean
  hasOptions: boolean
  isBlockSlots: boolean
  defaultRows: number
  codeFontMono: boolean
}

const DEFAULT_EDITOR_META: ChallengeEditorMeta = {
  showCode: true,
  hasOptions: false,
  isBlockSlots: false,
  defaultRows: 5,
  codeFontMono: true,
}

export const CHALLENGE_EDITOR_META: Record<ChallengeType, ChallengeEditorMeta> = {
  prediction: {
    showCode: true,
    hasOptions: true,
    isBlockSlots: false,
    defaultRows: 5,
    codeFontMono: true,
  },
  bug: {
    showCode: true,
    hasOptions: true,
    isBlockSlots: false,
    defaultRows: 5,
    codeFontMono: true,
  },
  refactor: {
    showCode: true,
    hasOptions: false,
    isBlockSlots: false,
    defaultRows: 5,
    codeFontMono: true,
  },
  complete: {
    showCode: true,
    hasOptions: false,
    isBlockSlots: false,
    defaultRows: 5,
    codeFontMono: true,
  },
  conceptual: {
    showCode: false,
    hasOptions: true,
    isBlockSlots: false,
    defaultRows: 2,
    codeFontMono: false,
  },
  mcq: {
    showCode: false,
    hasOptions: true,
    isBlockSlots: false,
    defaultRows: 3,
    codeFontMono: false,
  },
  block_slots: {
    showCode: false,
    hasOptions: false,
    isBlockSlots: true,
    defaultRows: 4,
    codeFontMono: true,
  },
  exam_mcq: {
    showCode: false,
    hasOptions: true,
    isBlockSlots: false,
    defaultRows: 3,
    codeFontMono: false,
  },
}

export function getEditorMeta(type: ChallengeType): ChallengeEditorMeta {
  return CHALLENGE_EDITOR_META[type] ?? DEFAULT_EDITOR_META
}

/** Resolve se o editor deve exibir opções para um desafio concreto. */
export function editorShowsOptions(challenge: Challenge): boolean {
  const meta = getEditorMeta(challenge.type)
  if (!meta.hasOptions) return false
  if (challenge.type === 'bug') return true
  return true
}

/** Resolve se o editor deve exibir bloco de código para um desafio concreto. */
export function editorShowsCode(challenge: Challenge): boolean {
  return getEditorMeta(challenge.type).showCode
}
