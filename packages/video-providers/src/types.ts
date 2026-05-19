export type VideoProviderHandlerKey =
  | 'panda'
  | 'youtube'
  | 'vimeo'
  | 'streamable'
  | 'direct'
  | 'generic'

export type VideoProviderStatus = 'ACTIVE' | 'DEPRECATED' | 'DISABLED'

export interface VideoProviderConfig {
  handlerKey: VideoProviderHandlerKey
  allowedDomains: string[]
  allowedProtocols?: string[]
  maxUrlLength?: number
}

export interface VideoUrlValidationResult {
  valid: boolean
  normalizedUrl?: string
  embedUrl?: string
  errors: string[]
}

export interface VideoProviderHandler {
  handlerKey: VideoProviderHandlerKey
  formatEmbedUrl: (url: string) => string | null
  detectFromUrl: (url: string) => boolean
  isDirectPlayback?: boolean
}
