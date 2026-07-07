export class PaymentHandlerNotFoundError extends Error {
  constructor(handlerKey: string) {
    super(`Payment handler not found: ${handlerKey}`)
    this.name = 'PaymentHandlerNotFoundError'
  }
}

export class PaymentHandlerNotSyncCapableError extends Error {
  constructor(handlerKey: string) {
    super(`Payment handler is not sync-capable: ${handlerKey}`)
    this.name = 'PaymentHandlerNotSyncCapableError'
  }
}

export class PaymentHandlerNotWebhookCapableError extends Error {
  constructor(handlerKey: string) {
    super(`Payment handler is not webhook-capable: ${handlerKey}`)
    this.name = 'PaymentHandlerNotWebhookCapableError'
  }
}

export class PaymentRegistryIntegrityError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'PaymentRegistryIntegrityError'
  }
}
