import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'

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
          select: { courseId: true, progress: true },
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
    const latestAttempts = userId
      ? await prisma.userCareerExamAttempt.findMany({
          where: {
            userId,
            careerExamId: { in: uniqueExamIds },
            userCareerId: userCareer?.id ?? undefined,
          },
          orderBy: { createdAt: 'desc' },
          select: { careerExamId: true, passed: true },
        })
      : []

    const examPassedMap = new Map<string, boolean>()
    for (const a of latestAttempts) {
      if (!examPassedMap.has(a.careerExamId)) {
        examPassedMap.set(a.careerExamId, a.passed)
      }
    }

    const modules = career.modules.map((m) => {
      const statusRow = statusMap.get(m.id)
      const exams = m.exams.map((e) => e.exam)
      const examsPassedCount = m.exams.reduce((acc, e) => {
        return acc + (examPassedMap.get(e.careerExamId) ? 1 : 0)
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
        exams: m.exams.map((row) => ({
          id: row.exam.id,
          title: row.exam.title,
          slug: row.exam.slug,
          passingScore: row.exam.passingScore,
          passed: examPassedMap.get(row.careerExamId) === true,
        })),
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
      },
    }
  }
}

