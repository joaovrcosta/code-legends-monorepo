export class PaymentProviderNotFoundError extends Error {
  constructor() {
    super('Payment provider not found or disabled')
    this.name = 'PaymentProviderNotFoundError'
  }
}
