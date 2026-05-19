import type { VideoProviderHandler } from '../types'

export function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be')
}

export function formatYouTubeUrl(url: string): string | null {
  if (!isYouTubeUrl(url)) return null
  if (url.includes('youtube.com/embed/')) return url

  const match = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (match?.[1]) {
    return `https://www.youtube.com/embed/${match[1]}`
  }

  const short = url.match(/youtu\.be\/([a-zA-Z0-9_-]+)/)
  if (short?.[1]) {
    return `https://www.youtube.com/embed/${short[1]}`
  }

  return null
}

export const youtubeHandler: VideoProviderHandler = {
  handlerKey: 'youtube',
  detectFromUrl: isYouTubeUrl,
  formatEmbedUrl: formatYouTubeUrl,
}
