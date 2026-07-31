import { FastifyInstance } from 'fastify'
import { expireSubscriptions } from './expire-subscriptions.controller'
import { pruneLabCodeAttempts } from './prune-lab-code-attempts.controller'
import { verifyJobsSecret } from '../../middlewares/verify-jobs-secret'

export async function internalRoutes(app: FastifyInstance) {
  app.post(
    '/internal/jobs/expire-subscriptions',
    { onRequest: [verifyJobsSecret] },
    expireSubscriptions,
  )
  app.post(
    '/internal/jobs/prune-lab-code-attempts',
    { onRequest: [verifyJobsSecret] },
    pruneLabCodeAttempts,
  )
}
