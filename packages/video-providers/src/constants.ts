import type { VideoProviderHandlerKey } from './types'

export interface BuiltinProviderSeed {
  slug: string
  name: string
  handlerKey: VideoProviderHandlerKey
  isDefault?: boolean
  urlPlaceholder: string
  helpText?: string
  allowedDomains: string[]
  sortOrder: number
}

export const BUILTIN_PROVIDER_SEEDS: BuiltinProviderSeed[] = [
  {
    slug: 'panda',
    name: 'Panda Video',
    handlerKey: 'panda',
    isDefault: true,
    urlPlaceholder:
      'https://player-vz-....tv.pandavideo.com.br/embed/?v=...',
    helpText: 'Cole a URL do embed (atributo src do iframe) do painel Panda.',
    allowedDomains: ['pandavideo.com.br', 'pandavideo.com', 'tv.pandavideo.com.br'],
    sortOrder: 0,
  },
  {
    slug: 'youtube',
    name: 'YouTube',
    handlerKey: 'youtube',
    urlPlaceholder: 'https://www.youtube.com/watch?v=...',
    helpText: 'URL de watch ou youtu.be.',
    allowedDomains: ['youtube.com', 'youtu.be', 'www.youtube.com'],
    sortOrder: 1,
  },
  {
    slug: 'vimeo',
    name: 'Vimeo',
    handlerKey: 'vimeo',
    urlPlaceholder: 'https://vimeo.com/...',
    allowedDomains: ['vimeo.com', 'player.vimeo.com'],
    sortOrder: 2,
  },
  {
    slug: 'streamable',
    name: 'Streamable',
    handlerKey: 'streamable',
    urlPlaceholder: 'https://streamable.com/...',
    allowedDomains: ['streamable.com'],
    sortOrder: 3,
  },
  {
    slug: 'direct',
    name: 'Arquivo direto',
    handlerKey: 'direct',
    urlPlaceholder: 'https://cdn.exemplo.com/video.mp4',
    helpText: 'MP4, WebM ou playlist HLS (.m3u8).',
    allowedDomains: ['*'],
    sortOrder: 4,
  },
  {
    slug: 'generic',
    name: 'Outro (iframe)',
    handlerKey: 'generic',
    urlPlaceholder: 'https://player.exemplo.com/embed/...',
    helpText: 'Provedor customizado com domínios cadastrados.',
    allowedDomains: [],
    sortOrder: 99,
  },
]
