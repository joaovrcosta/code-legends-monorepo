import type { CheckoutCustomer } from '../types'

export function toAbacateCustomer(customer: CheckoutCustomer): Record<string, string> {
  const payload: Record<string, string> = {
    email: customer.email,
  }

  if (customer.name) {
    payload.name = customer.name
  }

  if (customer.cellphone) {
    payload.cellphone = customer.cellphone
  }

  if (customer.taxId) {
    payload.taxId = customer.taxId
  }

  const postalCode = customer.address?.postalCode?.replace(/\D/g, '')
  if (postalCode) {
    payload.zipCode = postalCode
  }

  return payload
}
