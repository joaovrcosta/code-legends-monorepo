import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'
import { examScoreMeetsCertification } from './career-certification-readiness'

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
              select: {
                careerExamId: true,
                exam: { select: { passingScore: true } },
              },
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
      select: { careerExamId: true, score: true },
    })
    const latestScoreByExam = new Map<string, number>()
    for (const a of attempts) {
      if (!latestScoreByExam.has(a.careerExamId)) {
        latestScoreByExam.set(a.careerExamId, a.score)
      }
    }

    const passingByExamId = new Map<string, number>()
    for (const m of career.modules) {
      for (const e of m.exams) {
        passingByExamId.set(e.careerExamId, e.exam.passingScore)
      }
    }

    const modules = career.modules.map((m) => {
      const s = statusMap.get(m.id)
      const passedCount = m.exams.reduce((acc, e) => {
        const score = latestScoreByExam.get(e.careerExamId)
        const passing = passingByExamId.get(e.careerExamId) ?? 70
        const ok = score != null && examScoreMeetsCertification(score, passing)
        return acc + (ok ? 1 : 0)
      }, 0)
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

