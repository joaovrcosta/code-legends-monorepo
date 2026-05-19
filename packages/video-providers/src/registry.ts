import { directHandler } from './handlers/direct'
import { genericHandler } from './handlers/generic'
import { pandaHandler } from './handlers/panda'
import { streamableHandler } from './handlers/streamable'
import { vimeoHandler } from './handlers/vimeo'
import { youtubeHandler } from './handlers/youtube'
import type { VideoProviderHandler, VideoProviderHandlerKey } from './types'

export const PROVIDER_HANDLERS: Record<
  VideoProviderHandlerKey,
  VideoProviderHandler
> = {
  panda: pandaHandler,
  youtube: youtubeHandler,
  vimeo: vimeoHandler,
  streamable: streamableHandler,
  direct: directHandler,
  generic: genericHandler,
}

const DETECTION_ORDER: VideoProviderHandlerKey[] = [
  'panda',
  'youtube',
  'streamable',
  'vimeo',
  'direct',
]

export function getHandler(
  handlerKey: VideoProviderHandlerKey,
): VideoProviderHandler {
  return PROVIDER_HANDLERS[handlerKey] ?? PROVIDER_HANDLERS.generic
}

export function detectHandlerKeyFromUrl(url: string): VideoProviderHandlerKey | null {
  for (const key of DETECTION_ORDER) {
    if (PROVIDER_HANDLERS[key].detectFromUrl(url)) {
      return key
    }
  }
  return null
}

export function formatEmbedUrl(
  url: string | null | undefined,
  handlerKey?: VideoProviderHandlerKey | null,
): string | null {
  if (!url?.trim()) return null

  const trimmed = url.trim()

  if (handlerKey) {
    const formatted = getHandler(handlerKey).formatEmbedUrl(trimmed)
    if (formatted) return formatted
    if (handlerKey === 'generic') return trimmed
    return null
  }

  for (const key of DETECTION_ORDER) {
    const formatted = PROVIDER_HANDLERS[key].formatEmbedUrl(trimmed)
    if (formatted) return formatted
  }

  if (
    trimmed.includes('/embed/') ||
    trimmed.includes('/e/') ||
    (trimmed.includes('player.') && !pandaHandler.detectFromUrl(trimmed))
  ) {
    return trimmed
  }

  return null
}

export function isDirectPlaybackUrl(
  url: string | null | undefined,
  handlerKey?: VideoProviderHandlerKey | null,
): boolean {
  if (!url) return false
  if (handlerKey) {
    return getHandler(handlerKey).isDirectPlayback ?? false
  }
  return directHandler.detectFromUrl(url)
}
