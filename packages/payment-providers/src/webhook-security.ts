import { createHash, timingSafeEqual } from 'node:crypto'

export function secureCompare(provided: string, expected: string): boolean {
  const a = createHash('sha256').update(provided, 'utf8').digest()
  const b = createHash('sha256').update(expected, 'utf8').digest()
  return a.length === b.length && timingSafeEqual(a, b)
}

export function headerValue(
  headers: Record<string, string | string[] | undefined>,
  name: string,
): string | undefined {
  const key = Object.keys(headers).find(
    (k) => k.toLowerCase() === name.toLowerCase(),
  )
  if (!key) return undefined
  const value = headers[key]
  if (Array.isArray(value)) return value[0]
  return value
}
