import type { VideoProviderHandler } from '../types'

export function normalizePandaInput(url: string): string {
  const trimmed = url.trim()
  const iframeSrc = trimmed.match(/src=["']([^"']*pandavideo[^"']*)["']/i)
  return iframeSrc?.[1] ?? trimmed
}

export function isPandaVideoUrl(url: string): boolean {
  return /pandavideo\.com(\.br)?/i.test(url)
}

export function formatPandaVideoUrl(url: string): string | null {
  const input = normalizePandaInput(url)
  if (!isPandaVideoUrl(input)) return null

  const embedMatch = input.match(
    /https?:\/\/player[.-]vz-[^/]+\.tv\.pandavideo\.com\.br\/embed\/\?v=[^&\s"'<>]+/i,
  )
  if (embedMatch) return embedMatch[0]

  const hlsMatch = input.match(
    /https?:\/\/b[.-]vz-([^.]+)\.tv\.pandavideo\.com\.br\/([a-f0-9-]+)\/playlist\.m3u8/i,
  )
  if (hlsMatch?.[1] && hlsMatch[2]) {
    return `https://player-vz-${hlsMatch[1]}.tv.pandavideo.com.br/embed/?v=${hlsMatch[2]}`
  }

  try {
    const parsed = new URL(input)
    const videoId = parsed.searchParams.get('v')
    if (
      videoId &&
      /^player[.-]vz-/i.test(parsed.hostname) &&
      parsed.hostname.includes('pandavideo')
    ) {
      parsed.pathname = '/embed/'
      parsed.search = `?v=${videoId}`
      return parsed.toString()
    }
  } catch {
    /* invalid */
  }

  return null
}

export const pandaHandler: VideoProviderHandler = {
  handlerKey: 'panda',
  detectFromUrl: isPandaVideoUrl,
  formatEmbedUrl: formatPandaVideoUrl,
}
