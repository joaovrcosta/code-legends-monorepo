import { FastifyInstance } from 'fastify'
import { verifyAdmin } from '../../middlewares/verify-admin'
import { adminListCareers } from './admin/list-careers.controller'
import { adminCreateCareer } from './admin/create-career.controller'
import { adminUpdateCareer } from './admin/update-career.controller'
import { adminDeleteCareer } from './admin/delete-career.controller'
import { adminCreateCareerModule } from './admin/create-module.controller'
import { adminUpdateCareerModule } from './admin/update-module.controller'
import { adminDeleteCareerModule } from './admin/delete-module.controller'
import { adminSetCareerModuleCourses } from './admin/set-module-courses.controller'
import { adminCreateCareerExam } from './admin/create-exam.controller'
import { adminUpdateCareerExam } from './admin/update-exam.controller'
import { adminDeleteCareerExam } from './admin/delete-exam.controller'
import { adminSetCareerModuleExams } from './admin/set-module-exams.controller'

export async function careerAdminRoutes(app: FastifyInstance) {
  // Careers
  app.get('/admin/careers', { onRequest: [verifyAdmin] }, adminListCareers)
  app.post('/admin/careers', { onRequest: [verifyAdmin] }, adminCreateCareer)
  app.put('/admin/careers/:id', { onRequest: [verifyAdmin] }, adminUpdateCareer)
  app.delete(
    '/admin/careers/:id',
    { onRequest: [verifyAdmin] },
    adminDeleteCareer,
  )

  // Modules
  app.post(
    '/admin/careers/:careerId/modules',
    { onRequest: [verifyAdmin] },
    adminCreateCareerModule,
  )
  app.put(
    '/admin/careers/:careerId/modules/:moduleId',
    { onRequest: [verifyAdmin] },
    adminUpdateCareerModule,
  )
  app.delete(
    '/admin/careers/:careerId/modules/:moduleId',
    { onRequest: [verifyAdmin] },
    adminDeleteCareerModule,
  )
  app.put(
    '/admin/career-modules/:moduleId/courses',
    { onRequest: [verifyAdmin] },
    adminSetCareerModuleCourses,
  )
  app.put(
    '/admin/career-modules/:moduleId/exams',
    { onRequest: [verifyAdmin] },
    adminSetCareerModuleExams,
  )

  // Exams
  app.post(
    '/admin/careers/:careerId/exams',
    { onRequest: [verifyAdmin] },
    adminCreateCareerExam,
  )
  app.put(
    '/admin/careers/:careerId/exams/:examId',
    { onRequest: [verifyAdmin] },
    adminUpdateCareerExam,
  )
  app.delete(
    '/admin/careers/:careerId/exams/:examId',
    { onRequest: [verifyAdmin] },
    adminDeleteCareerExam,
  )
}

