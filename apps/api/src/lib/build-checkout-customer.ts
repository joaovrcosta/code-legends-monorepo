import type {
  CheckoutCustomer,
  CheckoutCustomerAddress,
} from '@code-legends/payment-providers'

export interface BuildCheckoutCustomerInput {
  email: string
  name?: string | null
  fullname?: string | null
  phone?: string | null
  document?: string | null
  address?: {
    postal_code?: string | null
    street_name?: string | null
    number?: string | null
    complement?: string | null
    neighborhood?: string | null
    city?: string | null
    state?: string | null
    country?: string | null
  } | null
}

function trimOrUndefined(value?: string | null): string | undefined {
  const trimmed = value?.trim()
  return trimmed || undefined
}

function buildAddress(
  address: NonNullable<BuildCheckoutCustomerInput['address']>,
): CheckoutCustomerAddress | undefined {
  const mapped: CheckoutCustomerAddress = {
    postalCode: trimOrUndefined(address.postal_code),
    street: trimOrUndefined(address.street_name),
    number: trimOrUndefined(address.number),
    complement: trimOrUndefined(address.complement),
    neighborhood: trimOrUndefined(address.neighborhood),
    city: trimOrUndefined(address.city),
    state: trimOrUndefined(address.state),
    country: trimOrUndefined(address.country),
  }

  const hasValue = Object.values(mapped).some(Boolean)
  return hasValue ? mapped : undefined
}

export function buildCheckoutCustomer(
  input: BuildCheckoutCustomerInput,
): CheckoutCustomer {
  const customer: CheckoutCustomer = {
    email: input.email,
    name: trimOrUndefined(input.fullname) ?? trimOrUndefined(input.name),
  }

  const cellphone = trimOrUndefined(input.phone)
  if (cellphone) {
    customer.cellphone = cellphone
  }

  const taxId = trimOrUndefined(input.document)
  if (taxId) {
    customer.taxId = taxId
  }

  if (input.address) {
    const address = buildAddress(input.address)
    if (address) {
      customer.address = address
    }
  }

  return customer
}
