import { FastifyReply, FastifyRequest } from 'fastify'
import { z } from 'zod'
import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../../use-cases/errors/career-not-found'

export async function getExam(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    careerIdentifier: z.string(),
    examId: z.string(),
  })
  const { careerIdentifier, examId } = paramsSchema.parse(request.params)

  try {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        careerIdentifier,
      )

    const career = await prisma.career.findUnique({
      where: isUUID ? { id: careerIdentifier } : { slug: careerIdentifier },
      select: { id: true, active: true },
    })
    if (!career || !career.active) throw new CareerNotFoundError()

    const enrollment = await prisma.userCareer.findUnique({
      where: { userId_careerId: { userId: request.user.id, careerId: career.id } },
      select: { id: true },
    })
    if (!enrollment) {
      return reply.status(403).send({ message: 'User is not enrolled in this career' })
    }

    const exam = await prisma.careerExam.findUnique({
      where: { id: examId },
      select: {
        id: true,
        careerId: true,
        slug: true,
        title: true,
        description: true,
        content: true,
        passingScore: true,
        maxAttempts: true,
      },
    })
    if (!exam || exam.careerId !== career.id) {
      return reply.status(404).send({ message: 'Exam not found' })
    }

    return reply.status(200).send({ exam })
  } catch (error) {
    if (error instanceof CareerNotFoundError) {
      return reply.status(404).send({ message: error.message })
    }
    return reply.status(500).send({ message: 'Internal server error' })
  }
}

