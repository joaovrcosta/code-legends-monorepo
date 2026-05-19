import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VideoProvider } from '@prisma/client'
import { resolveLessonVideoInput } from './resolve-lesson-video'
import { VideoProviderNotFoundError } from '../use-cases/errors/video-provider-not-found'
import { InvalidVideoUrlForProviderError } from '../use-cases/errors/invalid-video-url-for-provider'
import type { IVideoProviderRepository } from '../repositories/video-provider-repository'

const pandaProvider: VideoProvider = {
  id: 'prov_panda',
  name: 'Panda Video',
  slug: 'panda',
  status: 'ACTIVE',
  isDefault: true,
  isBuiltin: true,
  handlerKey: 'panda',
  urlPlaceholder: 'https://player.../embed/?v=...',
  helpText: null,
  allowedDomains: ['*.pandavideo.com.br', 'player.pandavideo.com.br'],
  allowedProtocols: ['https'],
  maxUrlLength: 2048,
  sortOrder: 0,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: null,
}

function makeRepo(overrides: Partial<IVideoProviderRepository> = {}): IVideoProviderRepository {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn(),
    findDefault: vi.fn().mockResolvedValue(pandaProvider),
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    countCustom: vi.fn(),
    countVideosUsing: vi.fn(),
    createAuditLog: vi.fn(),
    setDefault: vi.fn(),
    ...overrides,
  }
}

describe('resolveLessonVideoInput', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('rejeita URL javascript: para provedor panda', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(pandaProvider),
    })

    await expect(
      resolveLessonVideoInput({
        videoUrl: 'javascript:alert(1)',
        videoProviderId: pandaProvider.id,
        videoProviderRepository: repo,
      }),
    ).rejects.toBeInstanceOf(InvalidVideoUrlForProviderError)
  })

  it('aceita embed Panda válido', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(pandaProvider),
    })

    const url =
      'https://player-vz-abc.tv.pandavideo.com.br/embed/?v=550e8400-e29b-41d4-a716-446655440000'
    const result = await resolveLessonVideoInput({
      videoUrl: url,
      videoProviderId: pandaProvider.id,
      videoProviderRepository: repo,
    })

    expect(result.provider.id).toBe(pandaProvider.id)
    expect(result.url).toBe(url)
  })

  it('usa provedor padrão quando videoProviderId omitido', async () => {
    const repo = makeRepo()

    const result = await resolveLessonVideoInput({
      videoUrl: null,
      videoProviderRepository: repo,
    })

    expect(repo.findDefault).toHaveBeenCalled()
    expect(result.provider.slug).toBe('panda')
    expect(result.url).toBeNull()
  })

  it('lança quando provedor não existe', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(null),
    })

    await expect(
      resolveLessonVideoInput({
        videoUrl: 'https://example.com/video',
        videoProviderId: 'missing',
        videoProviderRepository: repo,
      }),
    ).rejects.toBeInstanceOf(VideoProviderNotFoundError)
  })

  it('exige URL quando requireUrl=true', async () => {
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(pandaProvider),
    })

    await expect(
      resolveLessonVideoInput({
        videoUrl: '   ',
        videoProviderId: pandaProvider.id,
        videoProviderRepository: repo,
        requireUrl: true,
      }),
    ).rejects.toBeInstanceOf(InvalidVideoUrlForProviderError)
  })
})
