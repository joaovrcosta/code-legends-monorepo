import type { RouteHandlerMethod } from 'fastify'
import { FastifyInstance } from 'fastify'
import { create } from './create.controller'
import { authenticate } from './authenticate.controller'
import { googleAuth } from './google-auth.controller'
import { profile } from './profile.controller'
import { refreshToken } from './refresh-token.controller'
import { getOnboardingStatus } from './get-onboarding-status.controller'
import { updateOnboarding } from './update-onboarding.controller'
import { completeOnboarding } from './complete-onboarding.controller'
import { listUsers } from './list.controller'
import { getById } from './get-by-id.controller'
import { listInstructors } from './list-instructors.controller'
import {
  getAccountOverview,
  updateAccountData,
} from './account-overview.controller'
import { getUserSkills } from './get-user-skills.controller'
import { resetUserSkills } from './reset-user-skills.controller'
import { getCheckoutDados } from './get-checkout-dados.controller'
import { getSubscriptionOverview } from './get-subscription-overview.controller'
import { listPayments } from './list-payments.controller'
import { syncPayments } from './sync-payments.controller'
import { createCheckout } from '../payments/create-checkout.controller'
import { remove } from './delete.controller'
import { unlinkGoogle } from './unlink-google.controller'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { verifyInstructorOrAdmin } from '../../middlewares/verify-instructor-or-admin'
import { updateCheckoutDados } from './update-checkout-dados.controller'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', create)
  app.post('/users/auth', authenticate)
  app.post('/users/auth/google', googleAuth)
  app.post('/token/refresh', refreshToken)

  // Rotas autenticadas
  app.get('/me', { onRequest: [verifyJWT] }, profile)
  app.get('/me/subscription-overview', { onRequest: [verifyJWT] }, getSubscriptionOverview)
  app.get('/me/checkout-dados', { onRequest: [verifyJWT] }, getCheckoutDados)
  app.patch(
    '/me/checkout-dados',
    { onRequest: [verifyJWT] },
    updateCheckoutDados as RouteHandlerMethod,
  )
  app.get(
    '/users/onboarding/status',
    { onRequest: [verifyJWT] },
    getOnboardingStatus,
  )
  app.post('/users/onboarding', { onRequest: [verifyJWT] }, updateOnboarding)
  app.post(
    '/users/onboarding/complete',
    { onRequest: [verifyJWT] },
    completeOnboarding,
  )
  app.delete('/users/unlink-google', { onRequest: [verifyJWT] }, unlinkGoogle)

  // Checkout (usuário autenticado)
  app.post('/payments/checkout', { onRequest: [verifyJWT] }, createCheckout as RouteHandlerMethod)

  // Rotas protegidas - apenas ADMIN
  app.get('/payments', { onRequest: [verifyAdmin] }, listPayments)
  app.post('/payments/sync', { onRequest: [verifyAdmin] }, syncPayments)
  app.get('/users', { onRequest: [verifyInstructorOrAdmin] }, listUsers)
  app.get('/users/:id', { onRequest: [verifyInstructorOrAdmin] }, getById)
  app.get('/users/:userId/skills', { onRequest: [verifyJWT] }, getUserSkills)
  app.delete('/users/:userId/skills', { onRequest: [verifyInstructorOrAdmin] }, resetUserSkills)
  app.delete('/users/:id', { onRequest: [verifyAdmin] }, remove)
  app.get(
    '/users/:userId/overview',
    { onRequest: [verifyAdmin] },
    getAccountOverview,
  )
  app.put(
    '/users/:userId/overview',
    { onRequest: [verifyAdmin] },
    updateAccountData,
  )

  // Rotas protegidas - ADMIN ou INSTRUCTOR
  app.get(
    '/instructors',
    { onRequest: [verifyInstructorOrAdmin] },
    listInstructors,
  )
}
