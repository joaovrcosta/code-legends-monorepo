const BLOCKED_PROTOCOLS = new Set([
  'javascript:',
  'data:',
  'vbscript:',
  'file:',
  'blob:',
])

const PRIVATE_IPV4_PATTERNS = [
  /^127\./,
  /^10\./,
  /^192\.168\./,
  /^172\.(1[6-9]|2\d|3[0-1])\./,
  /^0\./,
  /^localhost$/i,
]

export function parseSafeHttpUrl(
  raw: string,
  allowedProtocols: string[] = ['https'],
): URL | null {
  const trimmed = raw.trim()
  if (!trimmed || trimmed.length > 4096) return null

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }

  const protocol = parsed.protocol.replace(':', '').toLowerCase()
  if (BLOCKED_PROTOCOLS.has(parsed.protocol.toLowerCase())) return null
  if (!allowedProtocols.includes(protocol)) return null
  if (!parsed.hostname) return null

  const host = parsed.hostname.toLowerCase()
  if (PRIVATE_IPV4_PATTERNS.some((p) => p.test(host))) return null

  return parsed
}

export function hostnameMatchesAllowedDomain(
  hostname: string,
  allowedDomains: string[],
): boolean {
  const host = hostname.toLowerCase()
  for (const pattern of allowedDomains) {
    const domain = pattern.toLowerCase().trim()
    if (!domain) continue
    if (domain.startsWith('*.')) {
      const base = domain.slice(2)
      if (host === base || host.endsWith(`.${base}`)) return true
    } else if (host === domain || host.endsWith(`.${domain}`)) {
      return true
    }
  }
  return false
}

export function stripHtml(value: string): string {
  return value.replace(/<[^>]*>/g, '').trim()
}

export function slugifyProviderName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/^(\d)/, 'p_$1')
    .slice(0, 49)
}

export const SLUG_REGEX = /^[a-z][a-z0-9_]{1,48}$/
