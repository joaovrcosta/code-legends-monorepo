import type { SandpackConsoleLog } from '../types'

export function formatConsolePart(part: unknown): string {
  if (part == null) return ''
  if (
    typeof part === 'string' ||
    typeof part === 'number' ||
    typeof part === 'boolean'
  ) {
    return String(part)
  }
  try {
    return JSON.stringify(part)
  } catch {
    return String(part)
  }
}

export function logFingerprint(log: SandpackConsoleLog): string {
  return `${log.method}:${(log.data ?? []).map(formatConsolePart).join('\u0000')}`
}

/** Remove linhas consecutivas idênticas (Jest + preview costumam duplicar). */
export function dedupeConsecutiveLogs(
  logs: SandpackConsoleLog[],
): SandpackConsoleLog[] {
  const out: SandpackConsoleLog[] = []
  let prev = ''
  for (const log of logs) {
    const fp = logFingerprint(log)
    if (fp === prev) continue
    prev = fp
    out.push(log)
  }
  return out
}

/**
 * Se a lista for N execuções iguais (restore + refresh, ou 3×),
 * ou uma execução + cauda parcial da mesma execução, mantém só um ciclo.
 * Não colapsa padrões legítimos curtos (ex.: 1, 2, 1 do aluno).
 */
export function collapseDuplicatedRun(
  logs: SandpackConsoleLog[],
): SandpackConsoleLog[] {
  const consecutive = dedupeConsecutiveLogs(logs)
  const n = consecutive.length
  if (n < 2) return consecutive

  const fps = consecutive.map(logFingerprint)

  // Pelo menos 2 ciclos completos iguais (e o resto prefixo do ciclo).
  for (let period = 1; period <= Math.floor(n / 2); period += 1) {
    if (n < period * 2) continue
    const first = fps.slice(0, period).join('\u0001')
    const second = fps.slice(period, period * 2).join('\u0001')
    if (first !== second) continue
    let ok = true
    for (let i = period * 2; i < n; i += 1) {
      if (fps[i] !== fps[i % period]) {
        ok = false
        break
      }
    }
    if (ok) return consecutive.slice(0, period)
  }

  // Uma execução + cauda parcial: [a,b,c, a,b].
  // Exige cauda com ≥2 itens para não colapsar padrões legítimos (1, 2, 1).
  for (let period = n - 1; period >= 2; period -= 1) {
    const restLen = n - period
    if (restLen < 2 || restLen >= period) continue
    const first = fps.slice(0, period)
    const rest = fps.slice(period)
    if (rest.every((fp, i) => fp === first[i])) {
      return consecutive.slice(0, period)
    }
  }

  return consecutive
}
