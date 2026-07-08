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
import { getCapabilities } from './get-capabilities.controller'
import { getPostPurchaseWelcome } from './get-post-purchase-welcome.controller'
import { postPostPurchaseWelcomeAck } from './post-post-purchase-welcome-ack.controller'
import { listPayments } from './list-payments.controller'
import { syncPayments } from './sync-payments.controller'
import { createCheckout } from '../payments/create-checkout.controller'
import { remove } from './delete.controller'
import { unlinkGoogle } from './unlink-google.controller'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { verifyInstructorOrAdmin } from '../../middlewares/verify-instructor-or-admin'
import { updateCheckoutDados } from './update-checkout-dados.controller'
import { getWeeklyXp } from './get-weekly-xp.controller'
import { getXpHistory } from './get-xp-history.controller'
import { getUserXpHistory } from './get-user-xp-history.controller'
import { getLessonActivity } from './get-lesson-activity.controller'
import { getStreak } from './get-streak.controller'
import { getUserStreak } from './get-user-streak.controller'
import { resetUserStreak } from './reset-user-streak.controller'
import { getLessonProductionByCourse } from './get-lesson-production-by-course.controller'
import { patchLessonProduction } from './patch-lesson-production.controller'
import { getLessonProductionLogsByCourse } from './get-lesson-production-logs-by-course.controller'

export async function usersRoutes(app: FastifyInstance) {
  app.post('/users', create)
  app.post('/users/auth', authenticate)
  app.post('/users/auth/google', googleAuth)
  app.post('/token/refresh', refreshToken)

  // Rotas autenticadas
  app.get('/me', { onRequest: [verifyJWT] }, profile)
  app.get('/me/xp/weekly', { onRequest: [verifyJWT] }, getWeeklyXp)
  app.get('/me/xp/history', { onRequest: [verifyJWT] }, getXpHistory)
  app.get('/me/activity/lessons', { onRequest: [verifyJWT] }, getLessonActivity)
  app.get('/me/streak', { onRequest: [verifyJWT] }, getStreak)
  app.get('/me/subscription-overview', { onRequest: [verifyJWT] }, getSubscriptionOverview)
  app.get('/me/capabilities', { onRequest: [verifyJWT] }, getCapabilities)
  app.get('/me/post-purchase-welcome', { onRequest: [verifyJWT] }, getPostPurchaseWelcome)
  app.post(
    '/me/post-purchase-welcome-ack',
    { onRequest: [verifyJWT] },
    postPostPurchaseWelcomeAck as RouteHandlerMethod,
  )
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
  app.get(
    '/users/:userId/xp/history',
    { onRequest: [verifyInstructorOrAdmin] },
    getUserXpHistory,
  )
  app.get(
    '/users/:userId/streak',
    { onRequest: [verifyAdmin] },
    getUserStreak,
  )
  app.post(
    '/users/:userId/streak/reset',
    { onRequest: [verifyAdmin] },
    resetUserStreak as RouteHandlerMethod,
  )

  // Rotas protegidas - ADMIN ou INSTRUCTOR
  app.get(
    '/instructors',
    { onRequest: [verifyInstructorOrAdmin] },
    listInstructors,
  )

  // Produção editorial (Content Hub)
  app.get(
    '/lessons/production',
    { onRequest: [verifyInstructorOrAdmin] },
    getLessonProductionByCourse as RouteHandlerMethod,
  )
  app.get(
    '/lessons/production/logs',
    { onRequest: [verifyInstructorOrAdmin] },
    getLessonProductionLogsByCourse as RouteHandlerMethod,
  )
  app.patch(
    '/lessons/:lessonId/production',
    { onRequest: [verifyInstructorOrAdmin] },
    patchLessonProduction as RouteHandlerMethod,
  )
}
