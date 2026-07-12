import type { PrismaClient } from '@prisma/client'
import { seedPaymentProviders } from '../../../lib/payment-provider-seed'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'
import { buildPaymentSettingsResponse } from './build-payment-settings'
import type { PaymentSettingsResponse } from './payment-settings.types'

export class BootstrapPaymentSettingsUseCase {
  constructor(
    private prisma: PrismaClient,
    private paymentProviderRepository: IPaymentProviderRepository,
  ) {}

  async execute(_input: { actorId: string }): Promise<PaymentSettingsResponse> {
    await seedPaymentProviders(this.prisma)
    const provider = await this.paymentProviderRepository.findDefault()
    return buildPaymentSettingsResponse(provider)
  }
}
