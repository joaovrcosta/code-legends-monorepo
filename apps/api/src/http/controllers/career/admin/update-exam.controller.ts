import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminUpdateCareerExam(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ careerId: z.string(), examId: z.string() })
  const bodySchema = z.object({
    slug: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    maxAttempts: z.number().int().min(1).optional().nullable(),
    content: z.unknown().optional(),
  })

  const { careerId, examId } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body || {})

  const exam = await prisma.careerExam.update({
    where: { id: examId, careerId },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.passingScore !== undefined ? { passingScore: body.passingScore } : {}),
      ...(body.maxAttempts !== undefined ? { maxAttempts: body.maxAttempts } : {}),
      ...(body.content !== undefined ? { content: body.content as any } : {}),
    },
  })

  return reply.status(200).send({ exam })
}

