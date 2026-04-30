import { prisma } from '../../../lib/prisma'
import { CareerNotFoundError } from '../../errors/career-not-found'

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
    const passed = normalizedScore >= exam.passingScore

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

    // Descobrir módulo ao qual o exame pertence
    const moduleLink = await prisma.careerModuleExam.findFirst({
      where: { careerExamId: examId },
      select: { careerModuleId: true },
    })

    let moduleCompleted = false
    let moduleId: string | undefined

    if (moduleLink) {
      moduleId = moduleLink.careerModuleId
      const moduleExams = await prisma.careerModuleExam.findMany({
        where: { careerModuleId: moduleLink.careerModuleId },
        select: { careerExamId: true },
      })
      const moduleExamIds = moduleExams.map((e) => e.careerExamId)

      // Pega o status "passou?" pelo último attempt de cada exame do módulo
      const attempts = await prisma.userCareerExamAttempt.findMany({
        where: {
          userCareerId: userCareer.id,
          careerExamId: { in: moduleExamIds },
        },
        orderBy: { createdAt: 'desc' },
        select: { careerExamId: true, passed: true },
      })

      const latestPassed = new Map<string, boolean>()
      for (const a of attempts) {
        if (!latestPassed.has(a.careerExamId)) {
          latestPassed.set(a.careerExamId, a.passed)
        }
      }

      moduleCompleted =
        moduleExamIds.length > 0 &&
        moduleExamIds.every((id) => latestPassed.get(id) === true)

      await prisma.userCareerModuleStatus.upsert({
        where: {
          userCareerId_careerModuleId: {
            userCareerId: userCareer.id,
            careerModuleId: moduleLink.careerModuleId,
          },
        },
        update: {
          isCompleted: moduleCompleted,
          completedAt: moduleCompleted ? new Date() : null,
        },
        create: {
          userId,
          userCareerId: userCareer.id,
          careerModuleId: moduleLink.careerModuleId,
          isCompleted: moduleCompleted,
          completedAt: moduleCompleted ? new Date() : null,
        },
      })
    }

    // Atualiza progresso da carreira: % módulos concluídos
    const modules = await prisma.careerModule.findMany({
      where: { careerId },
      select: { id: true },
    })
    const moduleStatuses = await prisma.userCareerModuleStatus.findMany({
      where: { userCareerId: userCareer.id, isCompleted: true },
      select: { careerModuleId: true },
    })
    const completedSet = new Set(moduleStatuses.map((s) => s.careerModuleId))
    const progress =
      modules.length > 0 ? Math.round((completedSet.size / modules.length) * 100) : 0
    const careerCompleted = modules.length > 0 && completedSet.size === modules.length

    await prisma.userCareer.update({
      where: { id: userCareer.id },
      data: {
        progress: progress / 100,
        isCompleted: careerCompleted,
        completedAt: careerCompleted ? new Date() : null,
      },
    })

    return {
      success: true,
      passed,
      score: normalizedScore,
      passingScore: exam.passingScore,
      moduleCompleted,
      ...(moduleId && { moduleId }),
      careerProgress: progress,
    }
  }
}

