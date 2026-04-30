import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminUpdateCareer(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({ id: z.string() })
  const bodySchema = z.object({
    slug: z.string().min(2).optional(),
    title: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    thumbnail: z.string().nullable().optional(),
    colorHex: z.string().nullable().optional(),
    active: z.boolean().optional(),
  })

  const { id } = paramsSchema.parse(request.params)
  const body = bodySchema.parse(request.body || {})

  const career = await prisma.career.update({
    where: { id },
    data: {
      ...(body.slug !== undefined ? { slug: body.slug } : {}),
      ...(body.title !== undefined ? { title: body.title } : {}),
      ...(body.description !== undefined ? { description: body.description } : {}),
      ...(body.thumbnail !== undefined ? { thumbnail: body.thumbnail } : {}),
      ...(body.colorHex !== undefined ? { colorHex: body.colorHex } : {}),
      ...(body.active !== undefined ? { active: body.active } : {}),
    },
  })

  return reply.status(200).send({ career })
}

