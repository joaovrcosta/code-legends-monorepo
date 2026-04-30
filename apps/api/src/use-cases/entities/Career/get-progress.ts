import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'

interface GetCareerProgressRequest {
  userId: string
  careerId: string
}

export interface GetCareerProgressResponse {
  career: {
    id: string
    progress: number
    isCompleted: boolean
  }
  modules: Array<{
    id: string
    isCompleted: boolean
    completedAt: string | null
    examsPassedCount: number
    examsTotal: number
  }>
}

export class GetCareerProgressUseCase {
  async execute({
    userId,
    careerId,
  }: GetCareerProgressRequest): Promise<GetCareerProgressResponse> {
    const career = await prisma.career.findUnique({
      where: { id: careerId },
      select: {
        id: true,
        active: true,
        modules: {
          orderBy: { orderIndex: 'asc' },
          select: {
            id: true,
            exams: {
              select: { careerExamId: true },
            },
          },
        },
      },
    })
    if (!career || !career.active) throw new CareerNotFoundError()

    const userCareer = await prisma.userCareer.findUnique({
      where: { userId_careerId: { userId, careerId } },
      select: { id: true, progress: true, isCompleted: true },
    })
    if (!userCareer) {
      return {
        career: { id: careerId, progress: 0, isCompleted: false },
        modules: career.modules.map((m) => ({
          id: m.id,
          isCompleted: false,
          completedAt: null,
          examsPassedCount: 0,
          examsTotal: m.exams.length,
        })),
      }
    }

    const moduleIds = career.modules.map((m) => m.id)
    const statuses = await prisma.userCareerModuleStatus.findMany({
      where: {
        userCareerId: userCareer.id,
        careerModuleId: { in: moduleIds },
      },
      select: { careerModuleId: true, isCompleted: true, completedAt: true },
    })
    const statusMap = new Map(statuses.map((s) => [s.careerModuleId, s]))

    const examIds = career.modules.flatMap((m) => m.exams.map((e) => e.careerExamId))
    const uniqueExamIds = [...new Set(examIds)]
    const attempts = await prisma.userCareerExamAttempt.findMany({
      where: {
        userCareerId: userCareer.id,
        careerExamId: { in: uniqueExamIds },
      },
      orderBy: { createdAt: 'desc' },
      select: { careerExamId: true, passed: true },
    })
    const examPassedMap = new Map<string, boolean>()
    for (const a of attempts) {
      if (!examPassedMap.has(a.careerExamId)) examPassedMap.set(a.careerExamId, a.passed)
    }

    const modules = career.modules.map((m) => {
      const s = statusMap.get(m.id)
      const passedCount = m.exams.reduce(
        (acc, e) => acc + (examPassedMap.get(e.careerExamId) ? 1 : 0),
        0,
      )
      return {
        id: m.id,
        isCompleted: s?.isCompleted ?? false,
        completedAt: s?.completedAt ? s.completedAt.toISOString() : null,
        examsPassedCount: passedCount,
        examsTotal: m.exams.length,
      }
    })

    return {
      career: {
        id: careerId,
        progress: Math.max(
          0,
          Math.min(
            100,
            userCareer.progress <= 1
              ? Math.round(userCareer.progress * 100)
              : Math.round(userCareer.progress),
          ),
        ),
        isCompleted: userCareer.isCompleted,
      },
      modules,
    }
  }
}

