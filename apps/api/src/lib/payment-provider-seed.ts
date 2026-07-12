import {
  PaymentProviderMethod,
  type Prisma,
  type PrismaClient,
} from '@prisma/client'
import { BUILTIN_PAYMENT_PROVIDER_SEEDS } from '@code-legends/payment-providers'

function toPrismaMethods(
  methods: readonly string[],
): PaymentProviderMethod[] {
  return methods.filter((m): m is PaymentProviderMethod =>
    ['CARD', 'PIX', 'BOLETO'].includes(m),
  )
}

export async function seedPaymentProviders(
  prisma: Prisma.TransactionClient | PrismaClient,
) {
  const gatewayToId = new Map<string, string>()

  for (const seed of BUILTIN_PAYMENT_PROVIDER_SEEDS) {
    const provider = await prisma.paymentProvider.upsert({
      where: { slug: seed.slug },
      create: {
        name: seed.name,
        slug: seed.slug,
        handlerKey: seed.handlerKey,
        gatewayCode: seed.gatewayCode,
        isBuiltin: true,
        isDefault: seed.isDefault ?? false,
        status: 'ACTIVE',
        supportedMethods: toPrismaMethods(seed.supportedMethods),
        sortOrder: seed.sortOrder,
        helpText: seed.helpText ?? null,
      },
      update: {
        name: seed.name,
        handlerKey: seed.handlerKey,
        gatewayCode: seed.gatewayCode,
        supportedMethods: toPrismaMethods(seed.supportedMethods),
        sortOrder: seed.sortOrder,
        helpText: seed.helpText ?? null,
      },
    })
    gatewayToId.set(seed.gatewayCode, provider.id)
  }

  const defaults = await prisma.paymentProvider.findMany({
    where: { isDefault: true },
  })
  if (defaults.length !== 1) {
    const abacateId = gatewayToId.get('ABACATE_PAY')
    await prisma.paymentProvider.updateMany({ data: { isDefault: false } })
    if (abacateId) {
      await prisma.paymentProvider.update({
        where: { id: abacateId },
        data: { isDefault: true },
      })
    }
  }

  const abacateId = gatewayToId.get('ABACATE_PAY')
  if (abacateId) {
    await prisma.payment.updateMany({
      where: {
        gateway: 'ABACATE_PAY',
        providerId: null,
      },
      data: { providerId: abacateId },
    })
  }
}
