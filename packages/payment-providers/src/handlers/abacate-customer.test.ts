import { describe, expect, it } from 'vitest'
import { toAbacateCustomer } from './abacate-customer'

describe('toAbacateCustomer', () => {
  it('maps neutral customer to Abacate payload with zipCode only for address', () => {
    const payload = toAbacateCustomer({
      email: 'user@example.com',
      name: 'João Victor Costa',
      cellphone: '11999999999',
      taxId: '52998224725',
      address: {
        postalCode: '03572-000',
        street: 'Rua A',
        number: '1668',
      },
    })

    expect(payload).toEqual({
      email: 'user@example.com',
      name: 'João Victor Costa',
      cellphone: '11999999999',
      taxId: '52998224725',
      zipCode: '03572000',
    })
    expect(payload).not.toHaveProperty('street')
    expect(payload).not.toHaveProperty('number')
  })

  it('omits optional fields when absent', () => {
    const payload = toAbacateCustomer({
      email: 'user@example.com',
    })

    expect(payload).toEqual({ email: 'user@example.com' })
  })

  it('omits zipCode when postalCode is empty', () => {
    const payload = toAbacateCustomer({
      email: 'user@example.com',
      address: { postalCode: '   ' },
    })

    expect(payload).toEqual({ email: 'user@example.com' })
    expect(payload).not.toHaveProperty('zipCode')
  })
})
