import { describe, expect, it } from 'vitest'
import { buildCheckoutCustomer } from './build-checkout-customer'

describe('buildCheckoutCustomer', () => {
  it('prefers fullname over name', () => {
    const customer = buildCheckoutCustomer({
      email: 'user@example.com',
      name: 'João',
      fullname: 'João Victor Costa',
    })

    expect(customer.name).toBe('João Victor Costa')
  })

  it('falls back to name when fullname is empty', () => {
    const customer = buildCheckoutCustomer({
      email: 'user@example.com',
      name: 'João',
      fullname: '   ',
    })

    expect(customer.name).toBe('João')
  })

  it('maps address fields and omits empty address', () => {
    const withAddress = buildCheckoutCustomer({
      email: 'user@example.com',
      address: {
        postal_code: '03572-000',
        street_name: 'Rua A',
        number: '1668',
        complement: 'Casa',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
      },
    })

    expect(withAddress.address).toEqual({
      postalCode: '03572-000',
      street: 'Rua A',
      number: '1668',
      complement: 'Casa',
      neighborhood: 'Centro',
      city: 'São Paulo',
      state: 'SP',
      country: undefined,
    })

    const withoutAddress = buildCheckoutCustomer({
      email: 'user@example.com',
      address: {
        postal_code: '',
        street_name: null,
      },
    })

    expect(withoutAddress.address).toBeUndefined()
  })

  it('omits empty cellphone and taxId', () => {
    const customer = buildCheckoutCustomer({
      email: 'user@example.com',
      phone: '  ',
      document: '',
    })

    expect(customer.cellphone).toBeUndefined()
    expect(customer.taxId).toBeUndefined()
  })

  it('includes cellphone and taxId when present', () => {
    const customer = buildCheckoutCustomer({
      email: 'user@example.com',
      phone: '11999999999',
      document: '52998224725',
    })

    expect(customer.cellphone).toBe('11999999999')
    expect(customer.taxId).toBe('52998224725')
  })
})
