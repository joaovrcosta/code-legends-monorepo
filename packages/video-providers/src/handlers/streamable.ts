import type { VideoProviderHandler } from '../types'

export function isStreamableUrl(url: string): boolean {
  return url.includes('streamable.com')
}

export function formatStreamableUrl(url: string): string | null {
  if (!isStreamableUrl(url)) return null
  if (url.includes('streamable.com/e/')) return url

  const match = url.match(/streamable\.com\/(?:o\/)?([a-zA-Z0-9]+)/)
  if (match?.[1]) {
    return `https://streamable.com/e/${match[1]}`
  }

  return null
}

export const streamableHandler: VideoProviderHandler = {
  handlerKey: 'streamable',
  detectFromUrl: isStreamableUrl,
  formatEmbedUrl: formatStreamableUrl,
}
