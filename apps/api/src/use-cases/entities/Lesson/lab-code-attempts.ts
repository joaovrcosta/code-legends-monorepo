import { LabCodeAttempt } from '@prisma/client'
import { ILabCodeAttemptRepository } from '../../../repositories/lab-code-attempt-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'
import { sanitizeLabStudentFiles } from '../../../lib/lab-student-files'
import {
  assertLabThrottle,
  LAB_ATTEMPT_POST_MIN_INTERVAL_MS,
} from '../../../lib/lab-throttle'
import type { LabAttemptResult } from '../../../repositories/lab-code-attempt-repository'

const ALLOWED_RESULTS = new Set<LabAttemptResult>([
  'pass',
  'fail',
  'timeout',
  'error',
])

/**
 * Cria snapshot de tentativa no Verificar.
 * `result` é AUTO-RELATADO pelo client (Jest no iframe).
 * NÃO usar para certificado, XP, desbloqueio ou gates de integridade.
 */
export class CreateLabCodeAttemptUseCase {
  constructor(
    private attempts: ILabCodeAttemptRepository,
    private userCourseRepository: IUserCourseRepository,
  ) {}

  async execute(input: {
    userId: string
    lessonId: number
    stepId: string
    files: unknown
    result: string
  }): Promise<{ attempt: LabCodeAttempt }> {
    assertLabThrottle(
      `lab-attempt:${input.userId}:${input.lessonId}`,
      LAB_ATTEMPT_POST_MIN_INTERVAL_MS,
    )

    if (!ALLOWED_RESULTS.has(input.result as LabAttemptResult)) {
      throw new Error('result inválido')
    }
    if (!input.stepId || input.stepId.length > 128) {
      throw new Error('stepId inválido')
    }

    const lesson = await prisma.lesson.findUnique({
      where: { id: input.lessonId },
      select: {
        id: true,
        type: true,
        submodule: {
          select: {
            module: {
              select: {
                courseId: true,
                course: { select: { status: true } },
              },
            },
          },
        },
      },
    })

    if (!lesson?.submodule?.module?.course) {
      throw new LessonNotFoundError()
    }
    if (lesson.submodule.module.course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const courseId = lesson.submodule.module.courseId
    const existingUserCourse =
      await this.userCourseRepository.findByUserAndCourse(
        input.userId,
        courseId,
      )
    if (!existingUserCourse) {
      await this.userCourseRepository.enroll(input.userId, courseId)
    }

    const files = sanitizeLabStudentFiles(input.files)
    const attempt = await this.attempts.create({
      userId: input.userId,
      lessonId: input.lessonId,
      stepId: input.stepId,
      files,
      result: input.result as LabAttemptResult,
    })

    return { attempt }
  }
}

export class ListLabCodeAttemptsUseCase {
  constructor(private attempts: ILabCodeAttemptRepository) {}

  async execute(input: {
    userId: string
    lessonId: number
    stepId?: string
    take?: number
    cursor?: string
  }): Promise<{
    attempts: Array<{
      id: string
      stepId: string
      result: string
      createdAt: string
      files: Record<string, string>
    }>
  }> {
    const take = Math.min(Math.max(input.take ?? 20, 1), 50)
    const rows = await this.attempts.listByUserLesson({
      userId: input.userId,
      lessonId: input.lessonId,
      stepId: input.stepId,
      take,
      cursor: input.cursor,
    })

    return {
      attempts: rows.map((row) => ({
        id: row.id,
        stepId: row.stepId,
        result: row.result,
        createdAt: row.createdAt.toISOString(),
        files:
          row.files && typeof row.files === 'object' && !Array.isArray(row.files)
            ? (row.files as Record<string, string>)
            : {},
      })),
    }
  }
}

/** Retenção: 100/aula + soft cap 20/step. Só INSERT no POST; limpeza aqui. */
export class PruneLabCodeAttemptsUseCase {
  constructor(private attempts: ILabCodeAttemptRepository) {}

  async execute(): Promise<{ deletedCount: number }> {
    return this.attempts.pruneRetention({
      maxPerLesson: 100,
      maxPerStep: 20,
      batchUsers: 200,
    })
  }
}
