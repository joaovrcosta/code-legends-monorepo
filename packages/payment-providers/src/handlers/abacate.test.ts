import { describe, expect, it } from 'vitest'
import { abacateHandler } from './abacate'
import { WEBHOOK_SECRET_HEADER } from '../constants'

describe('abacateHandler', () => {
  it('exposes gateway metadata', () => {
    expect(abacateHandler.handlerKey).toBe('abacate')
    expect(abacateHandler.gatewayCode).toBe('ABACATE_PAY')
    expect(abacateHandler.supportedMethods).toContain('CARD')
  })

  it('parseWebhook returns paid event for billing.paid', () => {
    const event = abacateHandler.parseWebhook(
      {
        event: 'billing.paid',
        data: { billing: { id: 'bill_123' } },
      },
      { rawBody: '{}' },
    )
    expect(event).toEqual({
      type: 'paid',
      gatewayPaymentId: 'bill_123',
    })
  })

  it('parseWebhook ignores unknown events', () => {
    expect(
      abacateHandler.parseWebhook({ event: 'other' }, { rawBody: '{}' }),
    ).toBeNull()
  })

  it('verifyWebhook accepts header secret', () => {
    const ok = abacateHandler.verifyWebhook({
      rawBody: '{}',
      headers: { [WEBHOOK_SECRET_HEADER]: 'secret-value' },
      getWebhookSecret: () => 'secret-value',
    })
    expect(ok).toBe(true)
  })

  it('verifyWebhook rejects missing secret', () => {
    const ok = abacateHandler.verifyWebhook({
      rawBody: '{}',
      headers: {},
      getWebhookSecret: () => 'secret-value',
    })
    expect(ok).toBe(false)
  })

  it('verifyWebhook accepts legacy query secret when allowed', () => {
    const ok = abacateHandler.verifyWebhook({
      rawBody: '{}',
      headers: {},
      getWebhookSecret: () => 'legacy-secret',
      allowLegacyQuerySecret: true,
      querySecret: 'legacy-secret',
    })
    expect(ok).toBe(true)
  })

  it('verifyWebhook rejects query secret without allowLegacyQuerySecret', () => {
    const ok = abacateHandler.verifyWebhook({
      rawBody: '{}',
      headers: {},
      getWebhookSecret: () => 'legacy-secret',
      querySecret: 'legacy-secret',
    })
    expect(ok).toBe(false)
  })
})
