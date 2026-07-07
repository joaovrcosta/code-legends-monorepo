import {
  PaymentProvider,
  PaymentProviderMethod,
  PaymentProviderStatus,
} from '@prisma/client'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'
import { CannotModifyBuiltinProviderError } from '../../errors/cannot-modify-builtin-provider'
import { PaymentProviderNotFoundError } from '../../errors/payment-provider-not-found'

const MAX_CUSTOM_PROVIDERS = 20

function snapshot(provider: PaymentProvider) {
  return {
    id: provider.id,
    name: provider.name,
    slug: provider.slug,
    status: provider.status,
    isDefault: provider.isDefault,
    handlerKey: provider.handlerKey,
    gatewayCode: provider.gatewayCode,
    supportedMethods: provider.supportedMethods,
  }
}

function slugifyName(name: string): string {
  return name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48)
}

export class ListPaymentProvidersUseCase {
  constructor(private repo: IPaymentProviderRepository) {}

  async execute(options?: {
    activeOnly?: boolean
    includeDeprecated?: boolean
  }) {
    if (options?.activeOnly) {
      return this.repo.list({ status: 'ACTIVE' })
    }
    return this.repo.list({ includeDeprecated: options?.includeDeprecated })
  }
}

export class CreatePaymentProviderUseCase {
  constructor(private repo: IPaymentProviderRepository) {}

  async execute(data: {
    name: string
    supportedMethods?: PaymentProviderMethod[]
    helpText?: string | null
    actorId: string
  }) {
    const customCount = await this.repo.countCustom()
    if (customCount >= MAX_CUSTOM_PROVIDERS) {
      throw new Error('Limite de provedores customizados atingido.')
    }

    const name = data.name.trim()
    if (name.length < 2 || name.length > 80) {
      throw new Error('Nome deve ter entre 2 e 80 caracteres.')
    }

    let slug = slugifyName(name)
    if (!slug) slug = `provider-${Date.now().toString(36)}`

    const existing = await this.repo.findBySlug(slug)
    if (existing) {
      slug = `${slug}-${Date.now().toString(36).slice(-4)}`
    }

    const gatewayCode = `CUSTOM_${slug.toUpperCase().replace(/-/g, '_')}`

    const provider = await this.repo.create({
      name,
      slug,
      handlerKey: 'generic',
      gatewayCode,
      supportedMethods: data.supportedMethods ?? ['CARD'],
      helpText: data.helpText ?? null,
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

export class UpdatePaymentProviderUseCase {
  constructor(private repo: IPaymentProviderRepository) {}

  async execute(data: {
    id: string
    name?: string
    helpText?: string | null
    sortOrder?: number
    actorId: string
  }) {
    const provider = await this.repo.findById(data.id)
    if (!provider) throw new PaymentProviderNotFoundError()

    const before = snapshot(provider)
    const update: Record<string, unknown> = {}

    if (data.name !== undefined) {
      update.name = data.name.trim()
    }
    if (data.helpText !== undefined) {
      update.helpText = data.helpText
    }
    if (data.sortOrder !== undefined) {
      update.sortOrder = data.sortOrder
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

export class SetDefaultPaymentProviderUseCase {
  constructor(private repo: IPaymentProviderRepository) {}

  async execute(data: { id: string; actorId: string }) {
    const provider = await this.repo.findById(data.id)
    if (!provider || provider.status !== 'ACTIVE') {
      throw new PaymentProviderNotFoundError()
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

export class SetPaymentProviderStatusUseCase {
  constructor(private repo: IPaymentProviderRepository) {}

  async execute(data: {
    id: string
    status: PaymentProviderStatus
    actorId: string
  }) {
    const provider = await this.repo.findById(data.id)
    if (!provider) throw new PaymentProviderNotFoundError()

    if (provider.isBuiltin && data.status === 'DISABLED') {
      throw new CannotModifyBuiltinProviderError(
        'Provedores built-in não podem ser desabilitados.',
      )
    }

    if (provider.isDefault && data.status !== 'ACTIVE') {
      throw new Error('Não é possível desativar o provedor padrão.')
    }

    const before = snapshot(provider)
    const updated = await this.repo.update(data.id, { status: data.status })

    await this.repo.createAuditLog({
      providerId: updated.id,
      actorId: data.actorId,
      action: 'SET_STATUS',
      before,
      after: snapshot(updated),
    })

    return { provider: updated }
  }
}
