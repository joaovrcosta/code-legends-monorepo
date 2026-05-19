export type LessonVideoProviderRef = {
  id: string
  slug?: string
  name?: string
  handlerKey?: string
}

export type LessonVideoWithProvider = {
  url?: string | null
  duration?: string | null
  providerId?: string | null
  provider?: LessonVideoProviderRef | null
}

export function getLessonVideoProviderId(
  video: LessonVideoWithProvider | null | undefined,
): string {
  if (!video) return ''
  return video.provider?.id ?? video.providerId ?? ''
}

export function mapLessonVideoForState(
  video: LessonVideoWithProvider | null | undefined,
  fallbackUrl?: string | null,
  fallbackDuration?: string | null,
) {
  if (!video && !fallbackUrl && !fallbackDuration) return null

  const provider = video?.provider
  const providerId = getLessonVideoProviderId(video)

  return {
    url: video?.url ?? fallbackUrl ?? null,
    duration: video?.duration ?? fallbackDuration ?? null,
    ...(provider
      ? {
          provider: {
            id: provider.id,
            slug: provider.slug,
            name: provider.name,
            handlerKey: provider.handlerKey,
          },
        }
      : providerId
        ? { provider: { id: providerId } }
        : {}),
  }
}
