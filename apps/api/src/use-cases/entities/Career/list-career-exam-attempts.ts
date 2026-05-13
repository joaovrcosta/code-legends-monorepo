import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'

export interface ListCareerExamAttemptsRequest {
  userId: string
  careerIdentifier: string
  examId?: string
}

export type CareerExamAttemptRow = {
  id: string
  careerExamId: string
  examTitle: string
  examSlug: string
  passingScore: number
  score: number
  passed: boolean
  createdAt: string
}

export interface ListCareerExamAttemptsResponse {
  attempts: CareerExamAttemptRow[]
}

export class ListCareerExamAttemptsUseCase {
  async execute({
    userId,
    careerIdentifier,
    examId,
  }: ListCareerExamAttemptsRequest): Promise<ListCareerExamAttemptsResponse> {
    const isUUID =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(careerIdentifier)

    const career = await prisma.career.findUnique({
      where: isUUID ? { id: careerIdentifier } : { slug: careerIdentifier },
      select: { id: true, active: true },
    })
    if (!career || !career.active) throw new CareerNotFoundError()

    const enrollment = await prisma.userCareer.findUnique({
      where: { userId_careerId: { userId, careerId: career.id } },
      select: { id: true },
    })
    if (!enrollment) {
      return { attempts: [] }
    }

    const rows = await prisma.userCareerExamAttempt.findMany({
      where: {
        userCareerId: enrollment.id,
        ...(examId ? { careerExamId: examId } : {}),
      },
      orderBy: { createdAt: 'desc' },
      include: {
        exam: { select: { title: true, slug: true, passingScore: true } },
      },
    })

    return {
      attempts: rows.map((r) => ({
        id: r.id,
        careerExamId: r.careerExamId,
        examTitle: r.exam.title,
        examSlug: r.exam.slug,
        passingScore: r.exam.passingScore,
        score: r.score,
        passed: r.passed,
        createdAt: r.createdAt.toISOString(),
      })),
    }
  }
}
