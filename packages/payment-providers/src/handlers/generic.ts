import type { PaymentProviderHandler } from '../types'

/** Placeholder admin — não suporta checkout real. */
export const genericHandler: PaymentProviderHandler = {
  handlerKey: 'generic',
  gatewayCode: 'GENERIC',
  supportedMethods: [],

  async createCheckout(): Promise<never> {
    throw new Error('Generic payment handler does not support checkout')
  },
}
