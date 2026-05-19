import type { VideoProviderHandler } from '../types'

export function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com')
}

export function formatVimeoUrl(url: string): string | null {
  if (!isVimeoUrl(url)) return null
  if (url.includes('player.vimeo.com/video/')) return url

  const match = url.match(/vimeo\.com\/(\d+)/)
  if (match?.[1]) {
    return `https://player.vimeo.com/video/${match[1]}`
  }

  return null
}

export const vimeoHandler: VideoProviderHandler = {
  handlerKey: 'vimeo',
  detectFromUrl: isVimeoUrl,
  formatEmbedUrl: formatVimeoUrl,
}
