import type { VideoProviderHandler } from '../types'

const VIDEO_EXTENSIONS = ['.mp4', '.webm', '.ogg', '.mov', '.avi', '.m3u8']

export function isDirectVideoUrl(url: string): boolean {
  const lower = url.toLowerCase()
  return VIDEO_EXTENSIONS.some((ext) => lower.includes(ext))
}

export const directHandler: VideoProviderHandler = {
  handlerKey: 'direct',
  detectFromUrl: isDirectVideoUrl,
  formatEmbedUrl: (url) => (isDirectVideoUrl(url) ? url : null),
  isDirectPlayback: true,
}
