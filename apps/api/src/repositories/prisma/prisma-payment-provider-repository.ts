import {
  PaymentProviderAuditAction,
  PaymentProviderStatus,
  Prisma,
} from '@prisma/client'
import { prisma } from '../../lib/prisma'
import {
  CreatePaymentProviderInput,
  IPaymentProviderRepository,
} from '../payment-provider-repository'

export class PrismaPaymentProviderRepository
  implements IPaymentProviderRepository
{
  async findById(id: string) {
    return prisma.paymentProvider.findUnique({ where: { id } })
  }

  async findBySlug(slug: string) {
    return prisma.paymentProvider.findUnique({ where: { slug } })
  }

  async findByGatewayCode(gatewayCode: string) {
    return prisma.paymentProvider.findUnique({ where: { gatewayCode } })
  }

  async findDefault() {
    return prisma.paymentProvider.findFirst({
      where: { isDefault: true, status: 'ACTIVE' },
    })
  }

  async list(options?: {
    includeDeprecated?: boolean
    status?: PaymentProviderStatus
  }) {
    const statusFilter = options?.status
      ? { status: options.status }
      : options?.includeDeprecated
        ? {}
        : {
            status: {
              in: ['ACTIVE', 'DEPRECATED'] as PaymentProviderStatus[],
            },
          }

    return prisma.paymentProvider.findMany({
      where: statusFilter,
      orderBy: [{ isDefault: 'desc' }, { sortOrder: 'asc' }, { name: 'asc' }],
    })
  }

  async listActiveOrDeprecated() {
    return prisma.paymentProvider.findMany({
      where: { status: { in: ['ACTIVE', 'DEPRECATED'] } },
    })
  }

  async countCustom(): Promise<number> {
    return prisma.paymentProvider.count({ where: { isBuiltin: false } })
  }

  async findDistinctPendingGateways(): Promise<string[]> {
    const rows = await prisma.payment.findMany({
      where: {
        status: 'PENDING',
        gatewayPaymentId: { not: null },
      },
      select: { gateway: true },
      distinct: ['gateway'],
    })
    return rows.map((r) => r.gateway)
  }

  async create(data: CreatePaymentProviderInput) {
    return prisma.paymentProvider.create({
      data: {
        name: data.name,
        slug: data.slug,
        handlerKey: data.handlerKey,
        gatewayCode: data.gatewayCode,
        isBuiltin: false,
        supportedMethods: data.supportedMethods ?? ['CARD'],
        sortOrder: data.sortOrder ?? 100,
        helpText: data.helpText ?? null,
      },
    })
  }

  async update(id: string, data: Prisma.PaymentProviderUpdateInput) {
    return prisma.paymentProvider.update({ where: { id }, data })
  }

  async clearDefaultExcept(providerId: string) {
    await prisma.paymentProvider.updateMany({
      where: { id: { not: providerId }, isDefault: true },
      data: { isDefault: false },
    })
  }

  async createAuditLog(data: {
    providerId: string
    actorId: string
    action: PaymentProviderAuditAction
    before?: Prisma.InputJsonValue
    after?: Prisma.InputJsonValue
  }) {
    await prisma.paymentProviderAuditLog.create({ data })
  }
}
