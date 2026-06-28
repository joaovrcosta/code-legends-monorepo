import type { Challenge, ParsonsPiece } from './types'

export function arraysEqual(a: string[], b: string[]): boolean {
  if (a.length !== b.length) return false
  return a.every((v, i) => v === b[i])
}

/** Mesma regra do export do hub: núcleo em `solution` + distratores anexados. */
export function normalizeBlockSlotsSolution(
  challenge: Challenge,
): string[] | null {
  const pieces = challenge.pieces ?? []
  if (pieces.length === 0) return null
  const ids = pieces.map((p) => p.id)
  const idSet = new Set(ids)
  if (idSet.size !== ids.length) return null

  let core = challenge.solution?.filter(Boolean) ?? []
  if (core.length === 0) {
    core = [...ids]
  }
  const coreSet = new Set(core)
  for (const id of core) {
    if (!idSet.has(id)) return null
  }
  if (coreSet.size !== core.length) return null

  const extras = ids.filter((id) => !coreSet.has(id)).sort()
  const full = [...core, ...extras]
  if (full.length !== ids.length) return null
  return full
}

export function blockSlotsTextareasFromChallenge(ch: Challenge): {
  correct: string
  distr: string
} {
  const pieces = ch.pieces ?? []
  const sol = ch.solution ?? []
  const byId: Record<string, string> = Object.fromEntries(
    pieces.map((p) => [p.id, p.content]),
  )
  if (sol.length > 0) {
    const correct = sol
      .map((id) => byId[id])
      .filter((c) => c !== undefined)
      .join('\n')
    const inSol = new Set(sol)
    const distr = pieces
      .filter((p) => !inSol.has(p.id))
      .map((p) => p.content)
      .join('\n')
    return { correct, distr }
  }
  if (pieces.length > 0) {
    return { correct: pieces.map((p) => p.content).join('\n'), distr: '' }
  }
  return { correct: '', distr: '' }
}

export function buildBlockSlotsFromLines(
  correct: string,
  distr: string,
): { pieces: ParsonsPiece[]; solution: string[] } {
  const correctLines = correct
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
  const distrLines = distr
    .split('\n')
    .map((l) => l.replace(/\r$/, ''))
    .filter((l) => l.trim().length > 0)
  const cPieces = correctLines.map((content, i) => ({ id: `c${i}`, content }))
  const dPieces = distrLines.map((content, i) => ({ id: `d${i}`, content }))
  return {
    pieces: [...cPieces, ...dPieces],
    solution: [...cPieces.map((p) => p.id), ...dPieces.map((p) => p.id)],
  }
}

export function buildBlockSlotsChallenge(
  base: Challenge,
  correct: string,
  distr: string,
): Challenge {
  const { pieces, solution } = buildBlockSlotsFromLines(correct, distr)
  return {
    ...base,
    type: 'block_slots',
    pieces,
    solution,
    correctAnswer: undefined,
    options: undefined,
  }
}
