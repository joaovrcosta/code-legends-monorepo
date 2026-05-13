import { FastifyInstance } from 'fastify'
import { verifyJWT } from '../../middlewares/verify-jwt'
import { list } from './list.controller'
import { getBySlug } from './get-by-slug.controller'
import { enroll } from './enroll.controller'
import { getProgress } from './get-progress.controller'
import { submitExamAttempt } from './submit-exam-attempt.controller'
import { getExam } from './get-exam.controller'
import { listExamAttempts } from './list-exam-attempts.controller'

export async function careerRoutes(app: FastifyInstance) {
  app.get('/careers', list)
  app.get('/careers/:slug', { onRequest: [verifyJWT] }, getBySlug)
  app.post('/careers/:id/enroll', { onRequest: [verifyJWT] }, enroll)
  app.get('/careers/:id/progress', { onRequest: [verifyJWT] }, getProgress)
  app.get(
    '/careers/:careerIdentifier/me/exam-attempts',
    { onRequest: [verifyJWT] },
    listExamAttempts,
  )
  app.get(
    '/careers/:careerIdentifier/exams/:examId',
    { onRequest: [verifyJWT] },
    getExam,
  )
  app.post(
    '/careers/:careerIdentifier/exams/:examId/attempts',
    { onRequest: [verifyJWT] },
    submitExamAttempt,
  )
}

