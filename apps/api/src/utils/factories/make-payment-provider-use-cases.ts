import { PrismaPaymentProviderRepository } from '../../repositories/prisma/prisma-payment-provider-repository'
import { CreateCheckoutUseCase } from '../../use-cases/entities/Payment/create-checkout'
import { HandlePaymentPaidUseCase } from '../../use-cases/entities/Payment/handle-payment-paid'
import { SyncPaymentsUseCase } from '../../use-cases/entities/Payment/sync-payments'
import {
  CreatePaymentProviderUseCase,
  ListPaymentProvidersUseCase,
  SetDefaultPaymentProviderUseCase,
  SetPaymentProviderStatusUseCase,
  UpdatePaymentProviderUseCase,
} from '../../use-cases/entities/PaymentProvider/manage-payment-providers'

const paymentProviderRepo = new PrismaPaymentProviderRepository()

export function makePaymentProviderRepository() {
  return paymentProviderRepo
}

export function makeCreateCheckoutUseCase() {
  return new CreateCheckoutUseCase(paymentProviderRepo)
}

export function makeHandlePaymentPaidUseCase() {
  return new HandlePaymentPaidUseCase()
}

export function makeSyncPaymentsUseCase(logger?: {
  warn: (message: string, meta?: Record<string, unknown>) => void
}) {
  return new SyncPaymentsUseCase(
    paymentProviderRepo,
    makeHandlePaymentPaidUseCase(),
    logger,
  )
}

export function makeListPaymentProvidersUseCase() {
  return new ListPaymentProvidersUseCase(paymentProviderRepo)
}

export function makeCreatePaymentProviderUseCase() {
  return new CreatePaymentProviderUseCase(paymentProviderRepo)
}

export function makeUpdatePaymentProviderUseCase() {
  return new UpdatePaymentProviderUseCase(paymentProviderRepo)
}

export function makeSetDefaultPaymentProviderUseCase() {
  return new SetDefaultPaymentProviderUseCase(paymentProviderRepo)
}

export function makeSetPaymentProviderStatusUseCase() {
  return new SetPaymentProviderStatusUseCase(paymentProviderRepo)
}
