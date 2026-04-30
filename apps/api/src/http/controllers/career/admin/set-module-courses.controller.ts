import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminSetCareerModuleCourses(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ moduleId: z.string() })
  const bodySchema = z.object({
    courses: z.array(
      z.object({
        courseId: z.string(),
        orderIndex: z.number().int().optional(),
      }),
    ),
  })

  const { moduleId } = paramsSchema.parse(request.params)
  const { courses } = bodySchema.parse(request.body || {})

  await prisma.$transaction(async (tx) => {
    await tx.careerModuleCourse.deleteMany({ where: { careerModuleId: moduleId } })
    if (courses.length > 0) {
      await tx.careerModuleCourse.createMany({
        data: courses.map((c, idx) => ({
          careerModuleId: moduleId,
          courseId: c.courseId,
          orderIndex: c.orderIndex ?? idx,
        })),
      })
    }
  })

  return reply.status(200).send({ ok: true })
}

