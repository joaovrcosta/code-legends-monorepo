import { prisma } from '../../../lib/prisma'
import { createBilling } from '../../../lib/abacatepay'
import { env } from '../../../env'
import type { UserPlan } from '@prisma/client'

const VALID_PAID_PLANS: UserPlan[] = ['PRO', 'PREMIUM']

export interface CreateCheckoutInput {
  userId: string
  planSlug: string // "pro" | "premium" (ou slug do Plan no banco)
  returnUrl: string
  completionUrl: string
}

export type CreateCheckoutResult =
  | { ok: true; checkoutUrl: string; paymentId: string }
  | {
      ok: false
      reason: 'invalid_plan' | 'api_not_configured' | 'user_not_found'
    }

export class CreateCheckoutUseCase {
  async execute(input: CreateCheckoutInput): Promise<CreateCheckoutResult> {
    const slug = input.planSlug?.toUpperCase()
    const planFromDb = await prisma.plan.findUnique({
      where: { slug, active: true },
    })
    if (
      !planFromDb ||
      planFromDb.amountCents <= 0 ||
      !VALID_PAID_PLANS.includes(planFromDb.slug as UserPlan)
    ) {
      return { ok: false, reason: 'invalid_plan' }
    }
    const config = {
      amountCents: planFromDb.amountCents,
      plan: planFromDb.slug as UserPlan,
      productName: planFromDb.productName ?? `Assinatura ${planFromDb.name}`,
      externalId: planFromDb.externalId ?? `CODE-LEGENDS-${planFromDb.slug}`,
    }

    const apiKey = env.ABACATE_PAY_API_KEY
    if (!apiKey) {
      return { ok: false, reason: 'api_not_configured' }
    }

    const user = await prisma.user.findUnique({
      where: { id: input.userId },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        document: true,
      },
    })
    if (!user) {
      return { ok: false, reason: 'user_not_found' }
    }

    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        amountCents: config.amountCents,
        currency: 'BRL',
        status: 'PENDING',
        plan: config.plan as UserPlan,
        gateway: 'ABACATE_PAY',
      },
    })

    try {
      const billing = await createBilling(apiKey, {
        frequency: 'ONE_TIME',
        methods: ['CARD'],
        products: [
          {
            externalId: config.externalId,
            name: config.productName,
            description: `Assinatura anual - ${config.productName}`,
            quantity: 1,
            price: config.amountCents,
          },
        ],
        returnUrl: input.returnUrl,
        completionUrl: input.completionUrl,
        customer: {
          name: user.name ?? undefined,
          email: user.email,
          cellphone: user.phone ?? '',
          taxId: user.document ?? '',
        },
      })

      await prisma.payment.update({
        where: { id: payment.id },
        data: { gatewayPaymentId: billing.id },
      })

      return {
        ok: true,
        checkoutUrl: billing.url,
        paymentId: payment.id,
      }
    } catch (err) {
      await prisma.payment.delete({ where: { id: payment.id } }).catch(() => {})
      throw err
    }
  }
}
