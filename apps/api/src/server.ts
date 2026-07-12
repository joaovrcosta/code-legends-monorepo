import { app } from './app'
import { env } from './env'
import { prisma } from './lib/prisma'
import { seedPaymentProviders } from './lib/payment-provider-seed'

async function bootstrap() {
  try {
    await seedPaymentProviders(prisma)
  } catch (error) {
    console.error('Failed to ensure payment providers:', error)
  }

  await app.listen({
    host: '0.0.0.0',
    port: env.PORT ? Number(env.PORT) : 3333,
  })

  console.log('Server is Running...')
}

bootstrap().catch((error) => {
  console.error(error)
  process.exit(1)
})
