/**
 * Testa o retorno do GET /billing/list da Abacate Pay.
 * Uso: pnpm exec tsx scripts/test-billing-get.ts [billingId]
 */
import 'dotenv/config'
import { getSyncHandler } from '@code-legends/payment-providers'
import { env } from '../src/env'
import { prisma } from '../src/lib/prisma'

const ABACATE_API_BASE = 'https://api.abacatepay.com/v1'

async function main() {
  const apiKey = env.ABACATE_PAY_API_KEY
  if (!apiKey) {
    console.error('Defina ABACATE_PAY_API_KEY no .env')
    process.exit(1)
  }

  let billingId = process.argv[2]
  if (!billingId) {
    const payment = await prisma.payment.findFirst({
      where: { gateway: 'ABACATE_PAY', gatewayPaymentId: { not: null } },
      select: { gatewayPaymentId: true },
    })
    billingId = payment?.gatewayPaymentId ?? undefined
    if (!billingId) {
      console.error(
        'Nenhum billingId passado e nenhum Payment com gatewayPaymentId no banco.',
      )
      console.error('Uso: pnpm exec tsx scripts/test-billing-get.ts <billingId>')
      process.exit(1)
    }
    console.log('Usando gatewayPaymentId do primeiro Payment:', billingId)
  }

  const url = `${ABACATE_API_BASE}/billing/list`
  console.log('\n--- Request ---')
  console.log('GET', url)

  const res = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
  })

  const rawBody = await res.text()
  let parsed: unknown
  try {
    parsed = JSON.parse(rawBody)
  } catch {
    parsed = rawBody
  }

  console.log('\n--- Resposta bruta (status', res.status, ') ---')
  console.log(JSON.stringify(parsed, null, 2))

  console.log('\n--- Resultado listRemotePayments() ---')
  const syncHandler = getSyncHandler('abacate')
  const list = await syncHandler.listRemotePayments({
    getApiKey: () => apiKey,
  })
  console.log('Total de cobranças:', list.length)
  const one = billingId ? list.find((b) => b.gatewayPaymentId === billingId) : list[0]
  if (one) {
    console.log('Cobrança encontrada:', JSON.stringify(one, null, 2))
  } else if (billingId) {
    console.log('Cobrança com id', billingId, 'não encontrada na lista.')
  }

  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
