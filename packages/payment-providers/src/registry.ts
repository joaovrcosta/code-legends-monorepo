import { BUILTIN_PAYMENT_PROVIDER_SEEDS } from './constants'
import {
  PaymentHandlerNotFoundError,
  PaymentHandlerNotSyncCapableError,
  PaymentHandlerNotWebhookCapableError,
  PaymentRegistryIntegrityError,
} from './errors'
import { abacateHandler } from './handlers/abacate'
import { genericHandler } from './handlers/generic'
import type {
  BuiltinPaymentProviderSeed,
  PaymentProviderHandler,
  PaymentProviderHandlerKey,
  SyncCapableHandler,
  WebhookCapableHandler,
} from './types'

const CHECKOUT_HANDLERS: Record<
  PaymentProviderHandlerKey,
  PaymentProviderHandler
> = {
  abacate: abacateHandler,
  generic: genericHandler,
}

const GATEWAY_CODE_TO_HANDLER_KEY = new Map<string, PaymentProviderHandlerKey>(
  Object.values(CHECKOUT_HANDLERS).map((h) => [h.gatewayCode, h.handlerKey]),
)

function isSyncCapable(
  handler: PaymentProviderHandler,
): handler is SyncCapableHandler {
  return 'listRemotePayments' in handler
}

function isWebhookCapable(
  handler: PaymentProviderHandler,
): handler is WebhookCapableHandler {
  return 'parseWebhook' in handler && 'verifyWebhook' in handler
}

export function getCheckoutHandler(
  key: PaymentProviderHandlerKey,
): PaymentProviderHandler {
  const handler = CHECKOUT_HANDLERS[key]
  if (!handler) {
    throw new PaymentHandlerNotFoundError(key)
  }
  return handler
}

export function getSyncHandler(key: PaymentProviderHandlerKey): SyncCapableHandler {
  const handler = getCheckoutHandler(key)
  if (!isSyncCapable(handler)) {
    throw new PaymentHandlerNotSyncCapableError(key)
  }
  return handler
}

export function getWebhookHandler(
  key: PaymentProviderHandlerKey,
): WebhookCapableHandler {
  const handler = getCheckoutHandler(key)
  if (!isWebhookCapable(handler)) {
    throw new PaymentHandlerNotWebhookCapableError(key)
  }
  return handler
}

export function getHandlerByGatewayCode(code: string): PaymentProviderHandler {
  const key = GATEWAY_CODE_TO_HANDLER_KEY.get(code)
  if (!key) {
    throw new PaymentHandlerNotFoundError(code)
  }
  return getCheckoutHandler(key)
}

export function resolveHandlerKeyFromGatewayCode(
  code: string,
): PaymentProviderHandlerKey | null {
  return GATEWAY_CODE_TO_HANDLER_KEY.get(code) ?? null
}

export function isSyncCapableHandlerKey(key: PaymentProviderHandlerKey): boolean {
  try {
    getSyncHandler(key)
    return true
  } catch {
    return false
  }
}

export function assertRegistryIntegrity(
  seeds: BuiltinPaymentProviderSeed[] = BUILTIN_PAYMENT_PROVIDER_SEEDS,
): void {
  for (const seed of seeds) {
    const handler = getCheckoutHandler(seed.handlerKey)
    if (handler.gatewayCode !== seed.gatewayCode) {
      throw new PaymentRegistryIntegrityError(
        `Seed ${seed.slug}: gatewayCode "${seed.gatewayCode}" does not match handler "${handler.gatewayCode}"`,
      )
    }
  }

  const seedGatewayCodes = new Set(seeds.map((s) => s.gatewayCode))
  for (const handler of Object.values(CHECKOUT_HANDLERS)) {
    if (
      handler.handlerKey !== 'generic' &&
      !seedGatewayCodes.has(handler.gatewayCode)
    ) {
      throw new PaymentRegistryIntegrityError(
        `Handler ${handler.handlerKey} (${handler.gatewayCode}) has no matching seed`,
      )
    }
  }
}

export { BUILTIN_PAYMENT_PROVIDER_SEEDS }
