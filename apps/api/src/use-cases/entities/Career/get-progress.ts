import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'
import {
  examScoreMeetsCertification,
  isUserCourseFullyComplete,
} from './career-certification-readiness'
import {
  computeCareerProgressMetrics,
  normalizeProgressPercent,
} from './compute-career-progress-metrics'

interface GetCareerProgressRequest {
  userId: string
  careerId: string
}

export interface GetCareerProgressResponse {
  career: {
    id: string
    journeyProgress: number
    modulesCompleted: number
    modulesTotal: number
    modulesCompletionProgress: number
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
            courses: {
              select: { courseId: true },
            },
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

    const courseIds = [
      ...new Set(career.modules.flatMap((m) => m.courses.map((c) => c.courseId))),
    ]
    const userCourses = courseIds.length
      ? await prisma.userCourse.findMany({
          where: { userId, courseId: { in: courseIds } },
          select: { courseId: true, progress: true, isCompleted: true },
        })
      : []
    const userCourseMap = new Map(userCourses.map((uc) => [uc.courseId, uc]))

    if (!userCareer) {
      const progressMetrics = computeCareerProgressMetrics({
        courses: courseIds.map((courseId) => ({
          progress: normalizeProgressPercent(
            userCourseMap.get(courseId)?.progress ?? 0,
          ),
        })),
        exams: career.modules.flatMap((m) =>
          m.exams.map(() => ({ bestScore: null as number | null })),
        ),
        modules: career.modules.map(() => ({ isCompleted: false })),
      })

      return {
        career: {
          id: careerId,
          journeyProgress: progressMetrics.journeyProgress,
          modulesCompleted: progressMetrics.modulesCompleted,
          modulesTotal: progressMetrics.modulesTotal,
          modulesCompletionProgress: progressMetrics.modulesCompletionProgress,
          progress: progressMetrics.modulesCompletionProgress,
          isCompleted: false,
        },
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
    const attempts = uniqueExamIds.length
      ? await prisma.userCareerExamAttempt.findMany({
          where: {
            userCareerId: userCareer.id,
            careerExamId: { in: uniqueExamIds },
          },
          orderBy: { createdAt: 'desc' },
          select: { careerExamId: true, score: true },
        })
      : []

    const latestScoreByExam = new Map<string, number>()
    const bestScoreByExam = new Map<string, number>()
    for (const attempt of attempts) {
      if (!latestScoreByExam.has(attempt.careerExamId)) {
        latestScoreByExam.set(attempt.careerExamId, attempt.score)
      }
      const currentBest = bestScoreByExam.get(attempt.careerExamId) ?? 0
      bestScoreByExam.set(
        attempt.careerExamId,
        Math.max(currentBest, attempt.score),
      )
    }

    const modules = career.modules.map((m) => {
      const statusRow = statusMap.get(m.id)
      const examsPassedCount = m.exams.reduce((acc, e) => {
        const score = latestScoreByExam.get(e.careerExamId)
        const ok =
          score != null &&
          examScoreMeetsCertification(score, e.exam.passingScore)
        return acc + (ok ? 1 : 0)
      }, 0)

      const coursesCompleteForModule = m.courses.every((row) =>
        isUserCourseFullyComplete(userCourseMap.get(row.courseId)),
      )
      const examsAllPassed =
        m.exams.length === 0 || examsPassedCount === m.exams.length
      const moduleCompleteDerived = coursesCompleteForModule && examsAllPassed

      return {
        id: m.id,
        isCompleted: moduleCompleteDerived,
        completedAt: statusRow?.completedAt
          ? statusRow.completedAt.toISOString()
          : null,
        examsPassedCount,
        examsTotal: m.exams.length,
        courses: m.courses.map((row) => ({
          progress: normalizeProgressPercent(
            userCourseMap.get(row.courseId)?.progress ?? 0,
          ),
        })),
        exams: m.exams.map((row) => ({
          bestScore: bestScoreByExam.has(row.careerExamId)
            ? bestScoreByExam.get(row.careerExamId)!
            : null,
        })),
      }
    })

    const progressMetrics = computeCareerProgressMetrics({
      courses: modules.flatMap((m) => m.courses),
      exams: modules.flatMap((m) => m.exams),
      modules: modules.map((m) => ({ isCompleted: m.isCompleted })),
    })

    return {
      career: {
        id: careerId,
        journeyProgress: progressMetrics.journeyProgress,
        modulesCompleted: progressMetrics.modulesCompleted,
        modulesTotal: progressMetrics.modulesTotal,
        modulesCompletionProgress: progressMetrics.modulesCompletionProgress,
        progress: progressMetrics.modulesCompletionProgress,
        isCompleted: userCareer.isCompleted,
      },
      modules: modules.map(({ courses: _courses, exams: _exams, ...module }) => module),
    }
  }
}
