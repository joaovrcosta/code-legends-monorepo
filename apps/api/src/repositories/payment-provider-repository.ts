import {
  PaymentProvider,
  PaymentProviderAuditAction,
  PaymentProviderStatus,
  Prisma,
} from '@prisma/client'

export interface CreatePaymentProviderInput {
  name: string
  slug: string
  handlerKey: string
  gatewayCode: string
  supportedMethods?: ('CARD' | 'PIX' | 'BOLETO')[]
  sortOrder?: number
  helpText?: string | null
}

export interface IPaymentProviderRepository {
  findById(id: string): Promise<PaymentProvider | null>
  findBySlug(slug: string): Promise<PaymentProvider | null>
  findByGatewayCode(gatewayCode: string): Promise<PaymentProvider | null>
  findDefault(): Promise<PaymentProvider | null>
  list(options?: {
    includeDeprecated?: boolean
    status?: PaymentProviderStatus
  }): Promise<PaymentProvider[]>
  listActiveOrDeprecated(): Promise<PaymentProvider[]>
  findDistinctPendingGateways(): Promise<string[]>
  countCustom(): Promise<number>
  create(data: CreatePaymentProviderInput): Promise<PaymentProvider>
  update(
    id: string,
    data: Prisma.PaymentProviderUpdateInput,
  ): Promise<PaymentProvider>
  clearDefaultExcept(providerId: string): Promise<void>
  createAuditLog(data: {
    providerId: string
    actorId: string
    action: PaymentProviderAuditAction
    before?: Prisma.InputJsonValue
    after?: Prisma.InputJsonValue
  }): Promise<void>
}
