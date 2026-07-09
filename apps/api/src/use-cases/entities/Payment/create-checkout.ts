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
import {
  resolveBillingState,
  validateUpgradeEligibility,
  type PlanBillingInfo,
  type UpgradePaymentMetadata,
  type UpgradeRejectionReason,
} from '../../../domain/subscription-upgrade'
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
      reason:
        | UpgradeRejectionReason
        | 'invalid_plan'
        | 'api_not_configured'
        | 'user_not_found'
    }

function toPlanBillingInfo(plan: {
  id: string
  slug: string
  name: string
  order: number
  amountCents: number
}): PlanBillingInfo {
  return {
    id: plan.id,
    slug: plan.slug,
    name: plan.name,
    order: plan.order,
    amountCents: plan.amountCents,
  }
}

export class CreateCheckoutUseCase {
  constructor(
    private paymentProviderRepository: IPaymentProviderRepository,
  ) {}

  async execute(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const slug = input.planSlug?.toUpperCase()
    const planFromDb = await prisma.plan.findUnique({
      where: { slug, active: true },
      select: {
        id: true,
        slug: true,
        name: true,
        order: true,
        amountCents: true,
        productName: true,
        externalId: true,
      },
    })
    if (!planFromDb || planFromDb.amountCents <= 0) {
      return { ok: false, reason: 'invalid_plan' }
    }

    const targetPlan = toPlanBillingInfo(planFromDb)
    const billing = await resolveBillingState(input.userId)
    const eligibility = validateUpgradeEligibility(billing, targetPlan)

    if (!eligibility.ok) {
      return { ok: false, reason: eligibility.reason }
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

    const amountDueCents = eligibility.amountDueCents
    const productName =
      planFromDb.productName ?? `Assinatura ${planFromDb.name}`
    const externalId =
      planFromDb.externalId ?? `CODE-LEGENDS-${planFromDb.slug}`

    let productDescription: string
    let metadata: UpgradePaymentMetadata | undefined

    if (eligibility.mode === 'upgrade') {
      productDescription = `Upgrade ${eligibility.currentPlan.name} → ${eligibility.targetPlan.name} (${eligibility.daysRemaining} dias restantes)`
      metadata = {
        kind: 'upgrade',
        fromSubscriptionId: eligibility.activeSubscription.id,
        fromPlanId: eligibility.currentPlan.id,
        toPlanId: eligibility.targetPlan.id,
        preservedEndsAt: eligibility.preservedEndsAt.toISOString(),
        listPriceCents: eligibility.listPriceCents,
        amountDueCents: eligibility.amountDueCents,
        daysRemaining: eligibility.daysRemaining,
      }
    } else {
      productDescription = `Assinatura anual - ${productName}`
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amountCents: amountDueCents,
        currency: 'BRL',
        status: 'PENDING',
        planId: planFromDb.id,
        gateway: handler.gatewayCode,
        providerId: provider.id,
        ...(metadata ? { metadata } : {}),
      },
    })

    try {
      const checkout = await handler.createCheckout({
        amountCents: amountDueCents,
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
        productDescription,
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
