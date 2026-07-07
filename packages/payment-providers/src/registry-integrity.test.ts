import { describe, expect, it } from 'vitest'
import {
  assertRegistryIntegrity,
  getCheckoutHandler,
  getSyncHandler,
  getWebhookHandler,
} from './registry'
import { PaymentHandlerNotSyncCapableError } from './errors'

describe('registry integrity', () => {
  it('passes for builtin seeds', () => {
    expect(() => assertRegistryIntegrity()).not.toThrow()
  })

  it('abacate handler matches seed gatewayCode', () => {
    const handler = getCheckoutHandler('abacate')
    expect(handler.gatewayCode).toBe('ABACATE_PAY')
  })

  it('getSyncHandler returns abacate', () => {
    expect(getSyncHandler('abacate').handlerKey).toBe('abacate')
  })

  it('getWebhookHandler returns abacate', () => {
    expect(getWebhookHandler('abacate').handlerKey).toBe('abacate')
  })

  it('generic is not sync capable', () => {
    expect(() => getSyncHandler('generic')).toThrow(
      PaymentHandlerNotSyncCapableError,
    )
  })
})
