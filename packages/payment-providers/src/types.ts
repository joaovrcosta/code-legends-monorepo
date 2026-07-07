export type PaymentProviderHandlerKey = 'abacate' | 'generic'

export type PaymentMethod = 'CARD' | 'PIX' | 'BOLETO'

export type RemotePaymentStatusValue =
  | 'PENDING'
  | 'PAID'
  | 'FAILED'
  | 'REFUNDED'

export type PaymentWebhookEventType = 'paid' | 'failed' | 'refunded'

export interface CheckoutCustomer {
  name?: string
  email: string
  cellphone?: string
  taxId?: string
}

/** Dados de checkout sem credenciais (seguro para logs). */
export interface CheckoutContext {
  amountCents: number
  currency: string
  customer: CheckoutCustomer
  returnUrl: string
  completionUrl: string
  methods: PaymentMethod[]
  externalId: string
  productName: string
  productDescription?: string
  metadata?: Record<string, string>
}

/** Contexto de invocação com credencial lazy — nunca logar este objeto inteiro. */
export interface CheckoutInvokeContext extends CheckoutContext {
  getApiKey: () => string
}

export interface SyncContext {
  getApiKey: () => string
}

export interface CheckoutResult {
  gatewayPaymentId: string
  checkoutUrl: string
}

export interface RemotePaymentStatus {
  gatewayPaymentId: string
  status: RemotePaymentStatusValue
}

export interface PaymentWebhookEvent {
  type: PaymentWebhookEventType
  gatewayPaymentId: string
}

export interface WebhookParseContext {
  rawBody: string
}

export interface WebhookVerifyInput {
  rawBody: string
  headers: Record<string, string | string[] | undefined>
  getWebhookSecret: () => string
  /** Somente rota legada Abacate: permite query param (deprecado). */
  allowLegacyQuerySecret?: boolean
  querySecret?: string
}

export interface PaymentProviderHandler {
  readonly handlerKey: PaymentProviderHandlerKey
  readonly gatewayCode: string
  readonly supportedMethods: readonly PaymentMethod[]
  createCheckout(ctx: CheckoutInvokeContext): Promise<CheckoutResult>
}

export interface SyncCapableHandler extends PaymentProviderHandler {
  listRemotePayments(ctx: SyncContext): Promise<RemotePaymentStatus[]>
}

export interface WebhookCapableHandler extends PaymentProviderHandler {
  parseWebhook(
    payload: unknown,
    ctx: WebhookParseContext,
  ): PaymentWebhookEvent | null
  verifyWebhook(input: WebhookVerifyInput): boolean
}

export interface BuiltinPaymentProviderSeed {
  slug: string
  name: string
  handlerKey: PaymentProviderHandlerKey
  gatewayCode: string
  supportedMethods: PaymentMethod[]
  isDefault?: boolean
  sortOrder: number
  helpText?: string
}
