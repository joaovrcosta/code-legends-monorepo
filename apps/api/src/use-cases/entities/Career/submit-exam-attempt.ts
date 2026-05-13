import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'
import {
  CAREER_CERT_MIN_SCORE,
  isUserCourseFullyComplete,
} from './career-certification-readiness'

interface SubmitCareerExamAttemptRequest {
  userId: string
  careerId: string
  examId: string
  answers?: unknown
  score: number
}

export interface SubmitCareerExamAttemptResponse {
  success: boolean
  passed: boolean
  score: number
  passingScore: number
  moduleCompleted: boolean
  moduleId?: string
  careerProgress: number
}

async function recomputeCareerModuleStatuses(
  userId: string,
  careerId: string,
  userCareerId: string,
): Promise<{ progressPct: number; careerCompleted: boolean }> {
  const modules = await prisma.careerModule.findMany({
    where: { careerId },
    select: {
      id: true,
      courses: { select: { courseId: true } },
      exams: { select: { careerExamId: true } },
    },
    orderBy: { orderIndex: 'asc' },
  })

  const allCourseIds = [...new Set(modules.flatMap((m) => m.courses.map((c) => c.courseId)))]
  const allExamIds = [...new Set(modules.flatMap((m) => m.exams.map((e) => e.careerExamId)))]

  const [userCourses, attempts] = await Promise.all([
    allCourseIds.length
      ? prisma.userCourse.findMany({
          where: { userId, courseId: { in: allCourseIds } },
          select: { courseId: true, progress: true, isCompleted: true },
        })
      : [],
    allExamIds.length
      ? prisma.userCareerExamAttempt.findMany({
          where: { userCareerId, careerExamId: { in: allExamIds } },
          orderBy: { createdAt: 'desc' },
          select: { careerExamId: true, passed: true },
        })
      : [],
  ])

  const ucMap = new Map(userCourses.map((u) => [u.courseId, u]))
  const latestPassed = new Map<string, boolean>()
  for (const a of attempts) {
    if (!latestPassed.has(a.careerExamId)) {
      latestPassed.set(a.careerExamId, a.passed)
    }
  }

  let completedCount = 0
  for (const mod of modules) {
    const coursesOk =
      mod.courses.length === 0 ||
      mod.courses.every((c) => isUserCourseFullyComplete(ucMap.get(c.courseId)))
    const examIds = mod.exams.map((e) => e.careerExamId)
    const examsOk =
      examIds.length === 0 || examIds.every((eid) => latestPassed.get(eid) === true)
    const moduleDone = coursesOk && examsOk
    if (moduleDone) completedCount++

    await prisma.userCareerModuleStatus.upsert({
      where: {
        userCareerId_careerModuleId: {
          userCareerId,
          careerModuleId: mod.id,
        },
      },
      update: {
        isCompleted: moduleDone,
        completedAt: moduleDone ? new Date() : null,
      },
      create: {
        userId,
        userCareerId,
        careerModuleId: mod.id,
        isCompleted: moduleDone,
        completedAt: moduleDone ? new Date() : null,
      },
    })
  }

  const progressPct = modules.length ? Math.round((completedCount / modules.length) * 100) : 0
  const careerCompleted = modules.length > 0 && completedCount === modules.length

  await prisma.userCareer.update({
    where: { id: userCareerId },
    data: {
      progress: progressPct / 100,
      isCompleted: careerCompleted,
      completedAt: careerCompleted ? new Date() : null,
    },
  })

  return { progressPct, careerCompleted }
}

export class SubmitCareerExamAttemptUseCase {
  async execute({
    userId,
    careerId,
    examId,
    answers,
    score,
  }: SubmitCareerExamAttemptRequest): Promise<SubmitCareerExamAttemptResponse> {
    const career = await prisma.career.findUnique({
      where: { id: careerId },
      select: { id: true, active: true },
    })
    if (!career || !career.active) throw new CareerNotFoundError()

    const userCareer = await prisma.userCareer.findUnique({
      where: { userId_careerId: { userId, careerId } },
      select: { id: true },
    })
    if (!userCareer) {
      throw new Error('User is not enrolled in this career')
    }

    const exam = await prisma.careerExam.findUnique({
      where: { id: examId },
      select: { id: true, careerId: true, passingScore: true, maxAttempts: true },
    })
    if (!exam || exam.careerId !== careerId) {
      throw new Error('Exam not found')
    }

    if (exam.maxAttempts != null) {
      const attemptsCount = await prisma.userCareerExamAttempt.count({
        where: { userCareerId: userCareer.id, careerExamId: examId },
      })
      if (attemptsCount >= exam.maxAttempts) {
        throw new Error('Max attempts reached')
      }
    }

    const normalizedScore = Math.max(0, Math.min(100, score))
    const passed =
      normalizedScore >= exam.passingScore && normalizedScore >= CAREER_CERT_MIN_SCORE

    await prisma.userCareerExamAttempt.create({
      data: {
        userId,
        userCareerId: userCareer.id,
        careerExamId: examId,
        score: normalizedScore,
        passed,
        answers: answers as any,
      },
    })

    const moduleLink = await prisma.careerModuleExam.findFirst({
      where: { careerExamId: examId },
      select: { careerModuleId: true },
    })

    const { progressPct } = await recomputeCareerModuleStatuses(
      userId,
      careerId,
      userCareer.id,
    )

    let moduleCompleted = false
    let moduleId: string | undefined
    if (moduleLink) {
      moduleId = moduleLink.careerModuleId
      const row = await prisma.userCareerModuleStatus.findUnique({
        where: {
          userCareerId_careerModuleId: {
            userCareerId: userCareer.id,
            careerModuleId: moduleLink.careerModuleId,
          },
        },
        select: { isCompleted: true },
      })
      moduleCompleted = row?.isCompleted ?? false
    }

    return {
      success: true,
      passed,
      score: normalizedScore,
      passingScore: exam.passingScore,
      moduleCompleted,
      ...(moduleId && { moduleId }),
      careerProgress: progressPct,
    }
  }
}
