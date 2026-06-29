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

  const careerModule = await prisma.careerModule.findUnique({
    where: { id: moduleId },
    select: { careerId: true },
  })

  if (!careerModule) {
    return reply.status(404).send({ message: 'Módulo não encontrado' })
  }

  if (courses.length > 0) {
    const courseIds = courses.map((c) => c.courseId)
    const courseRows = await prisma.course.findMany({
      where: { id: { in: courseIds } },
      select: { id: true, kind: true, exclusiveCareerId: true, title: true },
    })

    if (courseRows.length !== courseIds.length) {
      return reply.status(400).send({ message: 'Um ou mais cursos não foram encontrados' })
    }

    for (const course of courseRows) {
      if (
        course.kind === 'PATH_UNIT' &&
        course.exclusiveCareerId !== careerModule.careerId
      ) {
        return reply.status(400).send({
          message: `O Path Unit "${course.title}" pertence a outra carreira e não pode ser vinculado a este módulo`,
        })
      }
    }
  }

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
