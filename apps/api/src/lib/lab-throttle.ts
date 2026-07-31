/**
 * Throttle in-process por chave (user+lesson+rota).
 * Complementa @fastify/rate-limit (skip em non-prod); não substitui Redis em multi-instância.
 */

export class LabRateLimitedError extends Error {
  constructor(message = 'Too many requests. Try again shortly.') {
    super(message)
    this.name = 'LabRateLimitedError'
  }
}

const lastHitMs = new Map<string, number>()

/** PUT workspace: ~1 req/s */
export const LAB_PROGRESS_PUT_MIN_INTERVAL_MS = 1000

/** POST attempts: mais permissivo — ~1 / 2.5s */
export const LAB_ATTEMPT_POST_MIN_INTERVAL_MS = 2500

export function assertLabThrottle(
  key: string,
  minIntervalMs: number,
): void {
  const now = Date.now()
  const prev = lastHitMs.get(key) ?? 0
  if (now - prev < minIntervalMs) {
    throw new LabRateLimitedError()
  }
  lastHitMs.set(key, now)

  // Evita crescimento indefinido em processos longos
  if (lastHitMs.size > 50_000) {
    const cutoff = now - 60_000
    for (const [k, t] of lastHitMs) {
      if (t < cutoff) lastHitMs.delete(k)
    }
  }
}
