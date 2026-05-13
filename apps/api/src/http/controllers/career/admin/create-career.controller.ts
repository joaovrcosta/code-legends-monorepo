import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../../lib/prisma'

export async function adminCreateCareer(request: FastifyRequest, reply: FastifyReply) {
  const bodySchema = z.object({
    slug: z.string().min(2),
    title: z.string().min(2),
    description: z.string().optional(),
    thumbnail: z.string().optional(),
    icon: z.string().optional(),
    colorHex: z.string().optional(),
    active: z.boolean().optional(),
  })

  const body = bodySchema.parse(request.body || {})

  const career = await prisma.career.create({
    data: {
      slug: body.slug,
      title: body.title,
      description: body.description ?? null,
      thumbnail: body.thumbnail ?? null,
      icon: body.icon ?? null,
      colorHex: body.colorHex ?? null,
      active: body.active ?? true,
    },
  })

  return reply.status(201).send({ career })
}

