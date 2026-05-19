import { describe, it, expect, vi, beforeEach } from 'vitest'
import { VideoProvider } from '@prisma/client'
import {
  CreateVideoProviderUseCase,
  SetDefaultVideoProviderUseCase,
} from './manage-video-providers'
import { ProviderSlugTakenError } from '../../errors/provider-slug-taken'
import { VideoProviderNotFoundError } from '../../errors/video-provider-not-found'
import type { IVideoProviderRepository } from '../../../repositories/video-provider-repository'

const baseProvider: VideoProvider = {
  id: 'prov_1',
  name: 'Custom',
  slug: 'custom_test',
  status: 'ACTIVE',
  isDefault: false,
  isBuiltin: false,
  handlerKey: 'generic',
  urlPlaceholder: 'https://...',
  helpText: null,
  allowedDomains: ['player.example.com'],
  allowedProtocols: ['https'],
  maxUrlLength: 2048,
  sortOrder: 99,
  createdAt: new Date(),
  updatedAt: new Date(),
  createdById: 'user_1',
}

function makeRepo(overrides: Partial<IVideoProviderRepository> = {}): IVideoProviderRepository {
  return {
    findById: vi.fn(),
    findBySlug: vi.fn().mockResolvedValue(null),
    findDefault: vi.fn(),
    list: vi.fn(),
    create: vi.fn().mockImplementation(async (data) => ({
      ...baseProvider,
      ...data,
      id: 'new_id',
    })),
    update: vi.fn(),
    countCustom: vi.fn().mockResolvedValue(0),
    countVideosUsing: vi.fn(),
    createAuditLog: vi.fn(),
    setDefault: vi.fn(),
    ...overrides,
  }
}

describe('CreateVideoProviderUseCase', () => {
  beforeEach(() => vi.clearAllMocks())

  it('exige ao menos um domínio permitido', async () => {
    const useCase = new CreateVideoProviderUseCase(makeRepo())
    await expect(
      useCase.execute({
        name: 'Wistia',
        allowedDomains: [],
        actorId: 'user_1',
      }),
    ).rejects.toThrow('domínio')
  })

  it('cria provedor generic com auditoria', async () => {
    const repo = makeRepo()
    const useCase = new CreateVideoProviderUseCase(repo)

    const { provider } = await useCase.execute({
      name: 'Wistia',
      allowedDomains: ['fast.wistia.net'],
      actorId: 'user_1',
    })

    expect(provider.handlerKey).toBe('generic')
    expect(repo.create).toHaveBeenCalled()
    expect(repo.createAuditLog).toHaveBeenCalledWith(
      expect.objectContaining({ action: 'CREATE', actorId: 'user_1' }),
    )
  })

  it('falha se slug já existir após sufixo', async () => {
    const repo = makeRepo({
      findBySlug: vi.fn().mockResolvedValue(baseProvider),
    })
    const useCase = new CreateVideoProviderUseCase(repo)

    await expect(
      useCase.execute({
        name: 'Test',
        allowedDomains: ['a.com'],
        actorId: 'user_1',
      }),
    ).rejects.toBeInstanceOf(ProviderSlugTakenError)
  })
})

describe('SetDefaultVideoProviderUseCase', () => {
  it('não permite definir padrão em provedor DISABLED', async () => {
    const disabled = { ...baseProvider, status: 'DISABLED' as const }
    const repo = makeRepo({
      findById: vi.fn().mockResolvedValue(disabled),
    })
    const useCase = new SetDefaultVideoProviderUseCase(repo)

    await expect(
      useCase.execute({ id: disabled.id, actorId: 'admin' }),
    ).rejects.toBeInstanceOf(VideoProviderNotFoundError)
  })
})
