import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'
import {
  examScoreMeetsCertification,
  evaluateCareerCertificationReadiness,
} from './career-certification-readiness'

interface GetCareerBySlugRequest {
  slug: string
  userId?: string
}

export interface GetCareerBySlugResponse {
  career: {
    id: string
    slug: string
    title: string
    description: string | null
    thumbnail: string | null
    icon: string | null
    colorHex: string | null
  }
  modules: Array<{
    id: string
    title: string
    description: string | null
    orderIndex: number
    courses: Array<{
      id: string
      title: string
      slug: string
      thumbnail: string | null
      icon: string | null
      level: string
      progress: number
      isEnrolled: boolean
    }>
    exams: Array<{
      id: string
      title: string
      slug: string
      passingScore: number
      passed: boolean
      attemptCount: number
      bestScore: number | null
      lastAttemptAt: string | null
    }>
    status: {
      isCompleted: boolean
      completedAt: string | null
      examsPassedCount: number
    }
  }>
  enrollment: {
    isEnrolled: boolean
    progress: number
    isCompleted: boolean
    finalExamClearedAt: string | null
    certificateIssued: boolean
    canScheduleFinalExam: boolean
    finalExamRequestPending: boolean
  }
}

export class GetCareerBySlugUseCase {
  async execute({
    slug,
    userId,
  }: GetCareerBySlugRequest): Promise<GetCareerBySlugResponse> {
    const career = await prisma.career.findUnique({
      where: { slug },
      include: {
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            courses: {
              orderBy: { orderIndex: 'asc' },
              include: {
                course: {
                  select: {
                    id: true,
                    title: true,
                    slug: true,
                    thumbnail: true,
                    icon: true,
                    level: true,
                  },
                },
              },
            },
            exams: {
              orderBy: { examIndex: 'asc' },
              include: {
                exam: {
                  select: { id: true, title: true, slug: true, passingScore: true },
                },
              },
            },
          },
        },
      },
    })

    if (!career || !career.active) {
      throw new CareerNotFoundError()
    }

    const userCareer = userId
      ? await prisma.userCareer.findUnique({
          where: { userId_careerId: { userId, careerId: career.id } },
        })
      : null

    const courseIds = career.modules.flatMap((m) => m.courses.map((c) => c.courseId))
    const uniqueCourseIds = [...new Set(courseIds)]

    const userCourses = userId
      ? await prisma.userCourse.findMany({
          where: { userId, courseId: { in: uniqueCourseIds } },
          select: { courseId: true, progress: true, isCompleted: true },
        })
      : []
    const userCourseMap = new Map(userCourses.map((uc) => [uc.courseId, uc]))

    const moduleIds = career.modules.map((m) => m.id)
    const moduleStatuses = userId
      ? await prisma.userCareerModuleStatus.findMany({
          where: {
            userId,
            careerModuleId: { in: moduleIds },
            userCareerId: userCareer?.id ?? undefined,
          },
          select: { careerModuleId: true, isCompleted: true, completedAt: true },
        })
      : []
    const statusMap = new Map(moduleStatuses.map((s) => [s.careerModuleId, s]))

    const examIds = career.modules.flatMap((m) => m.exams.map((e) => e.careerExamId))
    const uniqueExamIds = [...new Set(examIds)]

    type AttemptLite = {
      careerExamId: string
      score: number
      passed: boolean
      createdAt: Date
    }
    const allAttempts: AttemptLite[] =
      userId && userCareer
        ? await prisma.userCareerExamAttempt.findMany({
            where: {
              userId,
              careerExamId: { in: uniqueExamIds },
              userCareerId: userCareer.id,
            },
            select: { careerExamId: true, score: true, passed: true, createdAt: true },
          })
        : []

    const latestByExam = new Map<string, AttemptLite>()
    const orderedDesc = [...allAttempts].sort(
      (a, b) => b.createdAt.getTime() - a.createdAt.getTime(),
    )
    for (const a of orderedDesc) {
      if (!latestByExam.has(a.careerExamId)) {
        latestByExam.set(a.careerExamId, a)
      }
    }

    const statsByExam = new Map<
      string,
      { count: number; best: number; lastAt: Date | null }
    >()
    for (const a of allAttempts) {
      const cur = statsByExam.get(a.careerExamId) ?? {
        count: 0,
        best: 0,
        lastAt: null as Date | null,
      }
      cur.count += 1
      cur.best = Math.max(cur.best, a.score)
      if (!cur.lastAt || a.createdAt > cur.lastAt) cur.lastAt = a.createdAt
      statsByExam.set(a.careerExamId, cur)
    }

    const [certificate, readiness] = await Promise.all([
      userId
        ? prisma.certificate.findFirst({
            where: { userId, careerId: career.id },
            select: { id: true },
          })
        : Promise.resolve(null),
      userId
        ? evaluateCareerCertificationReadiness(userId, career.id)
        : Promise.resolve(null),
    ])

    const certificateIssued = certificate != null
    const finalExamEffective = readiness?.finalExamClearedAt ?? null
    const finalExamClearedAt = finalExamEffective
      ? new Date(finalExamEffective).toISOString()
      : null
    const finalExamRequestPending = readiness?.pendingFinalExamRequest ?? false
    const canScheduleFinalExam = Boolean(
      readiness &&
        readiness.onlineTrackComplete &&
        !certificateIssued &&
        finalExamEffective == null &&
        !readiness.pendingFinalExamRequest,
    )

    const modules = career.modules.map((m) => {
      const statusRow = statusMap.get(m.id)
      const examsPassedCount = m.exams.reduce((acc, e) => {
        const latest = latestByExam.get(e.careerExamId)
        const ok = latest
          ? examScoreMeetsCertification(latest.score, e.exam.passingScore)
          : false
        return acc + (ok ? 1 : 0)
      }, 0)

      return {
        id: m.id,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        courses: m.courses.map((row) => {
          const uc = userCourseMap.get(row.courseId)
          const progress = uc?.progress ?? 0
          const percent = progress <= 1 ? Math.round(progress * 100) : Math.round(progress)
          return {
            ...row.course,
            progress: Math.max(0, Math.min(100, percent)),
            isEnrolled: uc != null,
          }
        }),
        exams: m.exams.map((row) => {
          const latest = latestByExam.get(row.careerExamId)
          const stats = statsByExam.get(row.careerExamId)
          const passed = latest
            ? examScoreMeetsCertification(latest.score, row.exam.passingScore)
            : false
          return {
            id: row.exam.id,
            title: row.exam.title,
            slug: row.exam.slug,
            passingScore: row.exam.passingScore,
            passed,
            attemptCount: stats?.count ?? 0,
            bestScore: stats && stats.count > 0 ? stats.best : null,
            lastAttemptAt: stats?.lastAt ? stats.lastAt.toISOString() : null,
          }
        }),
        status: {
          isCompleted: statusRow?.isCompleted ?? false,
          completedAt: statusRow?.completedAt
            ? statusRow.completedAt.toISOString()
            : null,
          examsPassedCount,
        },
      }
    })

    return {
      career: {
        id: career.id,
        slug: career.slug,
        title: career.title,
        description: career.description,
        thumbnail: career.thumbnail,
        icon: career.icon,
        colorHex: career.colorHex,
      },
      modules,
      enrollment: {
        isEnrolled: userCareer != null,
        progress:
          userCareer != null
            ? Math.max(
                0,
                Math.min(
                  100,
                  userCareer.progress <= 1
                    ? Math.round(userCareer.progress * 100)
                    : Math.round(userCareer.progress),
                ),
              )
            : 0,
        isCompleted: userCareer?.isCompleted ?? false,
        finalExamClearedAt,
        certificateIssued,
        canScheduleFinalExam,
        finalExamRequestPending,
      },
    }
  }
}
