import 'dotenv/config'

async function main() {
  const key = process.env.ABACATE_PAY_API_KEY
  if (!key) {
    console.error('ABACATE_PAY_API_KEY missing')
    process.exit(1)
  }

  const res = await fetch('https://api.abacatepay.com/v1/billing/create', {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      frequency: 'ONE_TIME',
      methods: ['CARD'],
      products: [
        {
          externalId: 'CODE-LEGENDS-PREMIUM',
          name: 'Code Legends PREMIUM',
          description: 'Test',
          quantity: 1,
          price: 39700,
        },
      ],
      returnUrl: 'http://localhost:3000/cart/premium',
      completionUrl: 'http://localhost:3000/',
      customer: {
        name: 'Test User',
        email: 'test@example.com',
        cellphone: '11999999999',
        taxId: '52998224725',
      },
    }),
  })

  const text = await res.text()
  console.log('STATUS', res.status)
  console.log(text)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
