import { FastifyInstance } from 'fastify'
import { expireSubscriptions } from './expire-subscriptions.controller'
import { verifyJobsSecret } from '../../middlewares/verify-jobs-secret'

export async function internalRoutes(app: FastifyInstance) {
  app.post(
    '/internal/jobs/expire-subscriptions',
    { onRequest: [verifyJobsSecret] },
    expireSubscriptions,
  )
}
