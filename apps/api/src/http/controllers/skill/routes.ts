import { FastifyInstance } from 'fastify'
import { listSkills } from './list.controller'
import { createSkill } from './create.controller'
import { updateSkill } from './update.controller'
import { verifyAdmin } from '../../middlewares/verify-admin'

export async function skillRoutes(app: FastifyInstance) {
  app.get('/skills', listSkills)
  app.post('/skills', { onRequest: [verifyAdmin] }, createSkill)
  app.put('/skills/:id', { onRequest: [verifyAdmin] }, updateSkill)
}

