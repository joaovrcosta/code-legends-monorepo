import {
  validateVideoUrl,
  type VideoProviderHandlerKey,
} from '@code-legends/video-providers'
import { VideoProvider } from '@prisma/client'
import { IVideoProviderRepository } from '../repositories/video-provider-repository'
import { InvalidVideoUrlForProviderError } from '../use-cases/errors/invalid-video-url-for-provider'
import { VideoProviderNotFoundError } from '../use-cases/errors/video-provider-not-found'

export async function resolveLessonVideoInput(params: {
  videoUrl?: string | null
  videoProviderId?: string | null
  videoProviderRepository: IVideoProviderRepository
  requireUrl?: boolean
}): Promise<{
  provider: VideoProvider
  url: string | null
  duration?: string
}> {
  const { videoUrl, videoProviderId, videoProviderRepository, requireUrl } =
    params

  let provider: VideoProvider | null = null

  if (videoProviderId) {
    provider = await videoProviderRepository.findById(videoProviderId)
    if (!provider) {
      throw new VideoProviderNotFoundError()
    }
  } else {
    provider = await videoProviderRepository.findDefault()
    if (!provider) {
      throw new VideoProviderNotFoundError()
    }
  }

  if (provider.status === 'DISABLED') {
    throw new VideoProviderNotFoundError()
  }

  const trimmedUrl = videoUrl?.trim() ?? ''
  if (!trimmedUrl) {
    if (requireUrl) {
      throw new InvalidVideoUrlForProviderError(['URL do vídeo é obrigatória.'])
    }
    return { provider, url: null }
  }

  const allowedDomains = Array.isArray(provider.allowedDomains)
    ? (provider.allowedDomains as string[])
    : []

  const validation = validateVideoUrl(trimmedUrl, {
    handlerKey: provider.handlerKey as VideoProviderHandlerKey,
    allowedDomains,
    allowedProtocols: Array.isArray(provider.allowedProtocols)
      ? (provider.allowedProtocols as string[])
      : ['https'],
    maxUrlLength: provider.maxUrlLength,
  })

  if (!validation.valid) {
    throw new InvalidVideoUrlForProviderError(validation.errors)
  }

  return {
    provider,
    url: validation.normalizedUrl ?? trimmedUrl,
  }
}

export function mapVideoProviderPublic(provider: VideoProvider) {
  return {
    id: provider.id,
    slug: provider.slug,
    name: provider.name,
    handlerKey: provider.handlerKey,
    status: provider.status,
    urlPlaceholder: provider.urlPlaceholder,
    helpText: provider.helpText,
  }
}

export function mapVideoWithProvider(
  video: {
    url: string | null
    duration: string | null
    provider?: VideoProvider | null
  } | null,
) {
  if (!video) return null
  return {
    url: video.url,
    duration: video.duration,
    provider: video.provider
      ? {
          id: video.provider.id,
          slug: video.provider.slug,
          name: video.provider.name,
          handlerKey: video.provider.handlerKey,
        }
      : null,
  }
}
