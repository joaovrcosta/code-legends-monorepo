import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminSetCareerModuleExams(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const paramsSchema = z.object({ moduleId: z.string() })
  const bodySchema = z.object({
    exams: z
      .array(
        z.object({
          careerExamId: z.string(),
          examIndex: z.number().int(),
        }),
      )
      .max(2),
  })

  const { moduleId } = paramsSchema.parse(request.params)
  const { exams } = bodySchema.parse(request.body || {})

  // garante apenas indices 1 e 2
  for (const e of exams) {
    if (e.examIndex !== 1 && e.examIndex !== 2) {
      return reply.status(400).send({ message: 'examIndex must be 1 or 2' })
    }
  }

  await prisma.$transaction(async (tx) => {
    await tx.careerModuleExam.deleteMany({ where: { careerModuleId: moduleId } })
    if (exams.length > 0) {
      await tx.careerModuleExam.createMany({
        data: exams.map((e) => ({
          careerModuleId: moduleId,
          careerExamId: e.careerExamId,
          examIndex: e.examIndex,
        })),
      })
    }
  })

  return reply.status(200).send({ ok: true })
}

