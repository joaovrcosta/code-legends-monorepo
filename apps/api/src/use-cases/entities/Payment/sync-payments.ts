import {
  getSyncHandler,
  isSyncCapableHandlerKey,
  resolveHandlerKeyFromGatewayCode,
} from '@code-legends/payment-providers'
import type { PaymentProviderHandlerKey } from '@code-legends/payment-providers'
import { prisma } from '../../../lib/prisma'
import {
  getPaymentProviderCredentials,
  hasPaymentProviderCredentials,
} from '../../../lib/payment-provider-credentials'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'
import { HandlePaymentPaidUseCase } from './handle-payment-paid'

export interface SyncPaymentsLogger {
  warn: (message: string, meta?: Record<string, unknown>) => void
}

export class SyncPaymentsUseCase {
  constructor(
    private paymentProviderRepository: IPaymentProviderRepository,
    private handlePaymentPaid: HandlePaymentPaidUseCase,
    private logger?: SyncPaymentsLogger,
  ) {}

  async execute(): Promise<{ updated: number }> {
    const pendingGateways =
      await this.paymentProviderRepository.findDistinctPendingGateways()
    const activeProviders =
      await this.paymentProviderRepository.listActiveOrDeprecated()
    const activeGatewayCodes = new Set(
      activeProviders.map((p) => p.gatewayCode),
    )

    const gateways = new Set([
      ...pendingGateways,
      ...activeProviders.map((p) => p.gatewayCode),
    ])

    let updated = 0

    for (const gatewayCode of gateways) {
      const hasPending = pendingGateways.includes(gatewayCode)
      const isActiveProvider = activeGatewayCodes.has(gatewayCode)

      if (!hasPending && !isActiveProvider) {
        continue
      }

      const handlerKey = resolveHandlerKeyFromGatewayCode(gatewayCode)
      if (!handlerKey) {
        this.logger?.warn('No handler registered for gateway', { gatewayCode })
        continue
      }

      if (!isSyncCapableHandlerKey(handlerKey)) {
        this.logger?.warn('Gateway is not sync-capable, skipping', {
          gatewayCode,
          handlerKey,
        })
        continue
      }

      if (!hasPaymentProviderCredentials(handlerKey)) {
        this.logger?.warn('Credentials not configured for gateway, skipping', {
          gatewayCode,
          handlerKey,
        })
        continue
      }

      const syncHandler = getSyncHandler(handlerKey)
      const credentials = getPaymentProviderCredentials(handlerKey)

      const remotePayments = await syncHandler.listRemotePayments({
        getApiKey: credentials.getApiKey,
      })
      const remoteById = new Map(
        remotePayments.map((r) => [r.gatewayPaymentId, r]),
      )

      const payments = await prisma.payment.findMany({
        where: {
          gateway: gatewayCode,
          gatewayPaymentId: { not: null },
        },
        select: {
          id: true,
          status: true,
          gatewayPaymentId: true,
        },
      })

      for (const payment of payments) {
        const gatewayPaymentId = payment.gatewayPaymentId!
        const remote = remoteById.get(gatewayPaymentId)
        if (!remote) continue

        if (remote.status === 'PAID' && payment.status !== 'PAID') {
          await this.handlePaymentPaid.execute({
            gatewayPaymentId,
            gateway: gatewayCode,
          })
          updated++
          continue
        }

        if (remote.status === 'FAILED' && payment.status === 'PENDING') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'FAILED' },
          })
          updated++
          continue
        }

        if (remote.status === 'REFUNDED' && payment.status === 'PAID') {
          await prisma.payment.update({
            where: { id: payment.id },
            data: { status: 'REFUNDED' },
          })
          updated++
        }
      }
    }

    return { updated }
  }
}
