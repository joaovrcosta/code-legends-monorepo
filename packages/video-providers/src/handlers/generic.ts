import type { VideoProviderHandler } from '../types'

export const genericHandler: VideoProviderHandler = {
  handlerKey: 'generic',
  detectFromUrl: () => false,
  formatEmbedUrl: (url) => url.trim() || null,
}
