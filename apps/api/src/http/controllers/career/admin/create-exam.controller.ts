import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminCreateCareerExam(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ careerId: z.string() })
  const bodySchema = z.object({
    slug: z.string().min(2),
    title: z.string().min(2),
    description: z.string().optional(),
    passingScore: z.number().int().min(0).max(100).optional(),
    maxAttempts: z.number().int().min(1).optional().nullable(),
    content: z.unknown().optional(),
  })

  const { careerId } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body || {})

  const exam = await prisma.careerExam.create({
    data: {
      careerId,
      slug: body.slug,
      title: body.title,
      description: body.description ?? null,
      passingScore: body.passingScore ?? 70,
      maxAttempts: body.maxAttempts ?? null,
      content: body.content as any,
    },
  })

  return reply.status(201).send({ exam })
}

