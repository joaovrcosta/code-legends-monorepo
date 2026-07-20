import { Prisma } from '@prisma/client'
import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'

export type LabProgressPayload = {
  completedStepIds: string[]
  currentStepId: string
  completedCount?: number
  currentStepIndex?: number
}

function parseLabProgress(value: unknown): LabProgressPayload | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (
    typeof raw.currentStepId !== 'string' ||
    !Array.isArray(raw.completedStepIds)
  ) {
    return null
  }
  return {
    completedStepIds: raw.completedStepIds.filter(
      (id): id is string => typeof id === 'string',
    ),
    currentStepId: raw.currentStepId,
    completedCount:
      typeof raw.completedCount === 'number' ? raw.completedCount : undefined,
    currentStepIndex:
      typeof raw.currentStepIndex === 'number'
        ? raw.currentStepIndex
        : undefined,
  }
}

export class GetLabProgressUseCase {
  constructor(private userProgressRepository: IUserProgressRepository) {}

  async execute(input: {
    userId: string
    lessonId: number
  }): Promise<{ labProgress: LabProgressPayload | null }> {
    const progress = await this.userProgressRepository.findByUserAndTask(
      input.userId,
      input.lessonId,
    )
    const raw = (progress as { labProgress?: unknown } | null)?.labProgress
    return {
      labProgress: parseLabProgress(raw ?? null),
    }
  }
}

export class UpsertLabProgressUseCase {
  constructor(
    private userProgressRepository: IUserProgressRepository,
    private userCourseRepository: IUserCourseRepository,
  ) {}

  async execute(input: {
    userId: string
    lessonId: number
    labProgress: LabProgressPayload
  }): Promise<{ labProgress: LabProgressPayload }> {
    const lesson = await prisma.lesson.findUnique({
      where: { id: input.lessonId },
      select: {
        id: true,
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

    const courseId = lesson.submodule.module.courseId
    if (lesson.submodule.module.course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const existingUserCourse =
      await this.userCourseRepository.findByUserAndCourse(
        input.userId,
        courseId,
      )
    const userCourse =
      existingUserCourse ??
      (await this.userCourseRepository.enroll(input.userId, courseId))

    const labProgress: LabProgressPayload = {
      completedStepIds: input.labProgress.completedStepIds,
      currentStepId: input.labProgress.currentStepId,
      completedCount:
        input.labProgress.completedCount ??
        input.labProgress.completedStepIds.length,
      currentStepIndex: input.labProgress.currentStepIndex,
    }

    await this.userProgressRepository.upsertLabProgress({
      userId: input.userId,
      taskId: input.lessonId,
      userCourseId: userCourse.id,
      labProgress,
    })

    return { labProgress }
  }
}

// Keep Prisma Json typing happy for callers that cast.
export type LabProgressJson = Prisma.InputJsonValue
