import { FastifyInstance } from 'fastify'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { listVideoProviders } from './list.controller'
import { listActiveVideoProviders } from './list-active.controller'
import { createVideoProvider } from './create.controller'
import { updateVideoProvider } from './update.controller'
import { setDefaultVideoProvider } from './set-default.controller'
import { setVideoProviderStatus } from './set-status.controller'

export async function videoProviderRoutes(app: FastifyInstance) {
  app.get('/video-providers/active', { onRequest: [verifyJWT] }, listActiveVideoProviders)
  app.get(
    '/video-providers',
    { onRequest: [verifyAdmin] },
    listVideoProviders,
  )
  app.post(
    '/video-providers',
    { onRequest: [verifyAdmin] },
    createVideoProvider,
  )
  app.put(
    '/video-providers/:id',
    { onRequest: [verifyAdmin] },
    updateVideoProvider,
  )
  app.patch(
    '/video-providers/:id/default',
    { onRequest: [verifyAdmin] },
    setDefaultVideoProvider,
  )
  app.patch(
    '/video-providers/:id/status',
    { onRequest: [verifyAdmin] },
    setVideoProviderStatus,
  )
}
