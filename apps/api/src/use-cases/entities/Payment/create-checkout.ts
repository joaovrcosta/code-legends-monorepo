import { prisma } from '../../../lib/prisma'
import { buildCheckoutCustomer } from '../../../lib/build-checkout-customer'
import {
  getPaymentProviderCredentials,
  hasPaymentProviderCredentials,
} from '../../../lib/payment-provider-credentials'
import {
  resolveCheckoutHandler,
  resolvePaymentProvider,
} from '../../../lib/resolve-checkout'
import { IPaymentProviderRepository } from '../../../repositories/payment-provider-repository'

export interface CreateCheckoutInput {
  userId: string
  planSlug: string
  returnUrl: string
  completionUrl: string
  providerId?: string | null
}

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string; paymentId: string }
  | {
      ok: false
      reason: 'invalid_plan' | 'api_not_configured' | 'user_not_found'
    }

export class CreateCheckoutUseCase {
  constructor(
    private paymentProviderRepository: IPaymentProviderRepository,
  ) {}

  async execute(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const slug = input.planSlug?.toUpperCase()
    const planFromDb = await prisma.plan.findUnique({
      where: { slug, active: true },
    })
    if (!planFromDb || planFromDb.amountCents <= 0) {
      return { ok: false, reason: 'invalid_plan' }
    }

    const provider = await resolvePaymentProvider({
      providerId: input.providerId,
      paymentProviderRepository: this.paymentProviderRepository,
    })

    const handler = resolveCheckoutHandler(provider)

    if (!hasPaymentProviderCredentials(handler.handlerKey)) {
      return { ok: false, reason: 'api_not_configured' }
    }

    const credentials = getPaymentProviderCredentials(handler.handlerKey)

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        name: true,
        fullname: true,
        email: true,
        phone: true,
        document: true,
        Address: true,
      },
    })
    if (!user) {
      return { ok: false, reason: 'user_not_found' }
    }

    const productName =
      planFromDb.productName ?? `Assinatura ${planFromDb.name}`
    const externalId =
      planFromDb.externalId ?? `CODE-LEGENDS-${planFromDb.slug}`

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amountCents: planFromDb.amountCents,
        currency: 'BRL',
        status: 'PENDING',
        planId: planFromDb.id,
        gateway: handler.gatewayCode,
        providerId: provider.id,
      },
    })

    try {
      const checkout = await handler.createCheckout({
        amountCents: planFromDb.amountCents,
        currency: 'BRL',
        customer: buildCheckoutCustomer({
          email: user.email,
          name: user.name,
          fullname: user.fullname,
          phone: user.phone,
          document: user.document,
          address: user.Address,
        }),
        returnUrl: input.returnUrl,
        completionUrl: input.completionUrl,
        methods: [...handler.supportedMethods],
        externalId,
        productName,
        productDescription: `Assinatura anual - ${productName}`,
        getApiKey: credentials.getApiKey,
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: checkout.gatewayPaymentId },
      })

      return {
        ok: true,
        checkoutUrl: checkout.checkoutUrl,
        paymentId: payment.id,
      }
    } catch (err) {
      await prisma.payment.delete({ where: { id: payment.id } }).catch(() => {})
      throw err
    }
  }
}
