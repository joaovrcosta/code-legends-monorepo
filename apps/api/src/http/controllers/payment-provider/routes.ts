import { FastifyInstance } from 'fastify'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { listPaymentProviders } from './list.controller'
import { listActivePaymentProviders } from './list-active.controller'
import { createPaymentProvider } from './create.controller'
import { updatePaymentProvider } from './update.controller'
import { setDefaultPaymentProvider } from './set-default.controller'
import { setPaymentProviderStatus } from './set-status.controller'

export async function paymentProviderRoutes(app: FastifyInstance) {
  app.get(
    '/payment-providers/active',
    { onRequest: [verifyJWT] },
    listActivePaymentProviders,
  )
  app.get(
    '/payment-providers',
    { onRequest: [verifyAdmin] },
    listPaymentProviders,
  )
  app.post(
    '/payment-providers',
    { onRequest: [verifyAdmin] },
    createPaymentProvider,
  )
  app.put(
    '/payment-providers/:id',
    { onRequest: [verifyAdmin] },
    updatePaymentProvider,
  )
  app.patch(
    '/payment-providers/:id/default',
    { onRequest: [verifyAdmin] },
    setDefaultPaymentProvider,
  )
  app.patch(
    '/payment-providers/:id/status',
    { onRequest: [verifyAdmin] },
    setPaymentProviderStatus,
  )
}
