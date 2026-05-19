import { VideoProvider, VideoProviderStatus } from '@prisma/client'
import {
  slugifyProviderName,
  SLUG_REGEX,
  stripHtml,
} from '@code-legends/video-providers'
import { IVideoProviderRepository } from '../../../repositories/video-provider-repository'
import { CannotModifyBuiltinProviderError } from '../../errors/cannot-modify-builtin-provider'
import { ProviderSlugTakenError } from '../../errors/provider-slug-taken'
import { VideoProviderNotFoundError } from '../../errors/video-provider-not-found'

const MAX_CUSTOM_PROVIDERS = 50

function snapshot(provider: VideoProvider) {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    status: provider.status,
    isDefault: provider.isDefault,
    handlerKey: provider.handlerKey,
    allowedDomains: provider.allowedDomains,
  }
}

export class ListVideoProvidersUseCase {
  constructor(private repo: IVideoProviderRepository) {}

  async execute(options?: { activeOnly?: boolean; includeDeprecated?: boolean }) {
    if (options?.activeOnly) {
      return this.repo.list({ status: 'ACTIVE' })
    }
    return this.repo.list({ includeDeprecated: options?.includeDeprecated })
  }
}

export class CreateVideoProviderUseCase {
  constructor(private repo: IVideoProviderRepository) {}

  async execute(data: {
    name: string
    allowedDomains: string[]
    urlPlaceholder?: string
    helpText?: string | null
    actorId: string
  }) {
    const customCount = await this.repo.countCustom()
    if (customCount >= MAX_CUSTOM_PROVIDERS) {
      throw new Error('Limite de provedores customizados atingido.')
    }

    const name = stripHtml(data.name.trim())
    if (name.length < 2 || name.length > 80) {
      throw new Error('Nome deve ter entre 2 e 80 caracteres.')
    }

    const domains = data.allowedDomains
      .map((d) => d.trim().toLowerCase())
      .filter(Boolean)
    if (domains.length === 0) {
      throw new Error('Informe ao menos um domínio permitido.')
    }

    let slug = slugifyProviderName(name)
    if (!SLUG_REGEX.test(slug)) {
      slug = `custom_${slug}`.slice(0, 49)
    }

    const existing = await this.repo.findBySlug(slug)
    if (existing) {
      slug = `${slug}_${Date.now().toString(36).slice(-4)}`
    }

    if (await this.repo.findBySlug(slug)) {
      throw new ProviderSlugTakenError()
    }

    const provider = await this.repo.create({
      name,
      slug,
      handlerKey: 'generic',
      urlPlaceholder:
        data.urlPlaceholder ?? 'https://player.exemplo.com/embed/...',
      helpText: data.helpText ? stripHtml(data.helpText) : null,
      allowedDomains: domains,
      createdById: data.actorId,
    })

    await this.repo.createAuditLog({
      providerId: provider.id,
      actorId: data.actorId,
      action: 'CREATE',
      after: snapshot(provider),
    })

    return { provider }
  }
}

export class UpdateVideoProviderUseCase {
  constructor(private repo: IVideoProviderRepository) {}

  async execute(data: {
    id: string
    name?: string
    urlPlaceholder?: string
    helpText?: string | null
    allowedDomains?: string[]
    sortOrder?: number
    actorId: string
  }) {
    const provider = await this.repo.findById(data.id)
    if (!provider) throw new VideoProviderNotFoundError()

    const before = snapshot(provider)
    const update: Record<string, unknown> = {}

    if (data.name !== undefined) {
      update.name = stripHtml(data.name.trim())
    }
    if (data.urlPlaceholder !== undefined) {
      update.urlPlaceholder = data.urlPlaceholder
    }
    if (data.helpText !== undefined) {
      update.helpText = data.helpText ? stripHtml(data.helpText) : null
    }
    if (data.sortOrder !== undefined) {
      update.sortOrder = data.sortOrder
    }
    if (data.allowedDomains !== undefined) {
      if (provider.isBuiltin) {
        throw new CannotModifyBuiltinProviderError(
          'Domínios de provedores built-in não podem ser alterados.',
        )
      }
      const domains = data.allowedDomains.map((d) => d.trim()).filter(Boolean)
      if (domains.length === 0) {
        throw new Error('Informe ao menos um domínio permitido.')
      }
      update.allowedDomains = domains
    }

    const updated = await this.repo.update(data.id, update)

    await this.repo.createAuditLog({
      providerId: updated.id,
      actorId: data.actorId,
      action: 'UPDATE',
      before,
      after: snapshot(updated),
    })

    return { provider: updated }
  }
}

export class SetDefaultVideoProviderUseCase {
  constructor(private repo: IVideoProviderRepository) {}

  async execute(data: { id: string; actorId: string }) {
    const provider = await this.repo.findById(data.id)
    if (!provider || provider.status !== 'ACTIVE') {
      throw new VideoProviderNotFoundError()
    }

    const before = snapshot(provider)
    await this.repo.clearDefaultExcept(data.id)
    const updated = await this.repo.update(data.id, { isDefault: true })

    await this.repo.createAuditLog({
      providerId: updated.id,
      actorId: data.actorId,
      action: 'SET_DEFAULT',
      before,
      after: snapshot(updated),
    })

    return { provider: updated }
  }
}

export class SetVideoProviderStatusUseCase {
  constructor(private repo: IVideoProviderRepository) {}

  async execute(data: {
    id: string
    status: VideoProviderStatus
    actorId: string
  }) {
    const provider = await this.repo.findById(data.id)
    if (!provider) throw new VideoProviderNotFoundError()

    if (provider.isDefault && data.status !== 'ACTIVE') {
      throw new Error('Não é possível desativar o provedor padrão.')
    }

    const before = snapshot(provider)
    const updated = await this.repo.update(data.id, { status: data.status })

    const action =
      data.status === 'DEPRECATED'
        ? 'DEPRECATE'
        : data.status === 'DISABLED'
          ? 'DISABLE'
          : 'UPDATE'

    await this.repo.createAuditLog({
      providerId: updated.id,
      actorId: data.actorId,
      action,
      before,
      after: snapshot(updated),
    })

    return { provider: updated }
  }
}
