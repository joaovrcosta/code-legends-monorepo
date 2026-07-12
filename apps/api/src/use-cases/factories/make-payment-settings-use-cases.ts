import { prisma } from '../../lib/prisma'
import { PrismaPaymentProviderRepository } from '../../repositories/prisma/prisma-payment-provider-repository'
import { BootstrapPaymentSettingsUseCase } from '../system/payments/bootstrap'
import { GetPaymentSettingsUseCase } from '../system/payments/get-settings'

export function makeGetPaymentSettingsUseCase() {
  return new GetPaymentSettingsUseCase(new PrismaPaymentProviderRepository())
}

export function makeBootstrapPaymentSettingsUseCase() {
  return new BootstrapPaymentSettingsUseCase(
    prisma,
    new PrismaPaymentProviderRepository(),
  )
}
