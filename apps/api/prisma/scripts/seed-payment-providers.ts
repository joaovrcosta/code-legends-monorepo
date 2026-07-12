/**
 * Seed built-in payment providers and backfill Payment.providerId.
 * Run: pnpm exec tsx prisma/scripts/seed-payment-providers.ts
 */
import { PrismaClient } from '@prisma/client'
import { seedPaymentProviders } from '../../src/lib/payment-provider-seed'

export { seedPaymentProviders }

const isDirectRun = process.argv[1]?.includes('seed-payment-providers')

if (isDirectRun) {
  const prisma = new PrismaClient()
  seedPaymentProviders(prisma)
    .then(() => console.log('Payment providers seeded.'))
    .catch((e) => {
      console.error(e)
      process.exit(1)
    })
    .finally(() => prisma.$disconnect())
}
