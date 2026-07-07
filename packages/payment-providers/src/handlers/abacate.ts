import type {
  CheckoutInvokeContext,
  CheckoutResult,
  PaymentWebhookEvent,
  RemotePaymentStatus,
  RemotePaymentStatusValue,
  SyncCapableHandler,
  SyncContext,
  WebhookCapableHandler,
  WebhookParseContext,
  WebhookVerifyInput,
} from '../types'
import { WEBHOOK_SECRET_HEADER } from '../constants'
import { headerValue, secureCompare } from '../webhook-security'
import { toAbacateCustomer } from './abacate-customer'

const ABACATE_API_BASE = 'https://api.abacatepay.com/v1'

interface AbacateApiResponse<T> {
  data: T | null
  error: string | null
}

interface AbacateBillingResponse {
  id: string
  url: string
  amount: number
  status: string
  methods?: string[]
}

interface AbacateBillingListItem {
  id: string
  status: string
}

interface AbacateWebhookPayload {
  event?: string
  data?: {
    billing?: { id?: string; status?: string }
  }
}

function mapAbacateStatus(status: string): RemotePaymentStatusValue {
  switch (status) {
    case 'PAID':
      return 'PAID'
    case 'REFUNDED':
      return 'REFUNDED'
    case 'EXPIRED':
    case 'CANCELLED':
      return 'FAILED'
    default:
      return 'PENDING'
  }
}

async function createAbacateBilling(
  apiKey: string,
  ctx: CheckoutInvokeContext,
): Promise<AbacateBillingResponse> {
  const methods = ctx.methods.includes('PIX') ? ['PIX', 'CARD'] : ['CARD']

  const res = await fetch(`${ABACATE_API_BASE}/billing/create`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      frequency: 'ONE_TIME',
      methods,
      products: [
        {
          externalId: ctx.externalId,
          name: ctx.productName,
          description: ctx.productDescription,
          quantity: 1,
          price: ctx.amountCents,
        },
      ],
      returnUrl: ctx.returnUrl,
      completionUrl: ctx.completionUrl,
      customer: toAbacateCustomer(ctx.customer),
    }),
  })

  const raw = (await res.json()) as AbacateApiResponse<AbacateBillingResponse>

  if (!res.ok) {
    const msg =
      raw?.error ??
      (typeof raw === 'object' ? JSON.stringify(raw) : String(raw))
    throw new Error(`Abacate Pay API error ${res.status}: ${msg}`)
  }

  if (raw?.error) {
    throw new Error(`Abacate Pay: ${raw.error}`)
  }

  const data = raw?.data
  if (!data?.url || typeof data.url !== 'string') {
    throw new Error(
      `Abacate Pay: data sem url de checkout. Resposta: ${JSON.stringify(raw)}`,
    )
  }

  return {
    id: data.id,
    url: data.url,
    amount: data.amount ?? 0,
    status: data.status ?? 'PENDING',
    methods: data.methods,
  }
}

async function listAbacateBillings(apiKey: string): Promise<AbacateBillingListItem[]> {
  const res = await fetch(`${ABACATE_API_BASE}/billing/list`, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const raw = (await res.json()) as AbacateApiResponse<AbacateBillingListItem[]>

  if (!res.ok || raw?.error || !Array.isArray(raw?.data)) {
    return []
  }

  return raw.data.filter(
    (b) => b && typeof b.id === 'string' && typeof b.status === 'string',
  )
}

export const abacateHandler: SyncCapableHandler & WebhookCapableHandler = {
  handlerKey: 'abacate',
  gatewayCode: 'ABACATE_PAY',
  supportedMethods: ['CARD', 'PIX'],

  async createCheckout(ctx: CheckoutInvokeContext): Promise<CheckoutResult> {
    const billing = await createAbacateBilling(ctx.getApiKey(), ctx)
    return {
      gatewayPaymentId: billing.id,
      checkoutUrl: billing.url,
    }
  },

  async listRemotePayments(ctx: SyncContext): Promise<RemotePaymentStatus[]> {
    const billings = await listAbacateBillings(ctx.getApiKey())
    return billings.map((b) => ({
      gatewayPaymentId: b.id,
      status: mapAbacateStatus(b.status),
    }))
  },

  parseWebhook(
    payload: unknown,
    _ctx: WebhookParseContext,
  ): PaymentWebhookEvent | null {
    const body = payload as AbacateWebhookPayload
    if (body?.event !== 'billing.paid') {
      return null
    }
    const billingId = body.data?.billing?.id
    if (!billingId || typeof billingId !== 'string') {
      return null
    }
    return { type: 'paid', gatewayPaymentId: billingId }
  },

  verifyWebhook(input: WebhookVerifyInput): boolean {
    const secret = input.getWebhookSecret()
    if (!secret) return false

    const headerSecret = headerValue(input.headers, WEBHOOK_SECRET_HEADER)
    if (headerSecret && secureCompare(headerSecret, secret)) {
      return true
    }

    if (
      input.allowLegacyQuerySecret &&
      input.querySecret &&
      secureCompare(input.querySecret, secret)
    ) {
      return true
    }

    return false
  },
}
