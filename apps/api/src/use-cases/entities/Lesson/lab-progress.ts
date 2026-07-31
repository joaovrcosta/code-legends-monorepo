import { Prisma } from '@prisma/client'
import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'
import {
  assertLabProgressMetaSize,
  sanitizeLabStudentFiles,
} from '../../../lib/lab-student-files'
import {
  assertLabThrottle,
  LAB_PROGRESS_PUT_MIN_INTERVAL_MS,
} from '../../../lib/lab-throttle'

export type LabProgressPayload = {
  completedStepIds: string[]
  currentStepId: string
  completedCount?: number
  currentStepIndex?: number
  files?: Record<string, string>
  filesUpdatedAt?: string
}

function parseFiles(raw: unknown): Record<string, string> | undefined {
  if (raw == null) return undefined
  try {
    const files = sanitizeLabStudentFiles(raw)
    return Object.keys(files).length > 0 ? files : undefined
  } catch {
    return undefined
  }
}

export function parseLabProgress(value: unknown): LabProgressPayload | null {
  if (!value || typeof value !== 'object') return null
  const raw = value as Record<string, unknown>
  if (
    typeof raw.currentStepId !== 'string' ||
    !Array.isArray(raw.completedStepIds)
  ) {
    return null
  }
  const files = parseFiles(raw.files)
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
    ...(files ? { files } : {}),
    filesUpdatedAt:
      typeof raw.filesUpdatedAt === 'string' ? raw.filesUpdatedAt : undefined,
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
    const hasFilesUpdate = input.labProgress.files !== undefined
    if (hasFilesUpdate) {
      assertLabThrottle(
        `lab-progress:${input.userId}:${input.lessonId}`,
        LAB_PROGRESS_PUT_MIN_INTERVAL_MS,
      )
    }

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

    const files =
      input.labProgress.files !== undefined
        ? sanitizeLabStudentFiles(input.labProgress.files)
        : undefined

    const meta = {
      completedStepIds: input.labProgress.completedStepIds,
      currentStepId: input.labProgress.currentStepId,
      completedCount:
        input.labProgress.completedCount ??
        input.labProgress.completedStepIds.length,
      currentStepIndex: input.labProgress.currentStepIndex,
    }
    assertLabProgressMetaSize(meta)

    const labProgress: LabProgressPayload = {
      ...meta,
      ...(files && Object.keys(files).length > 0
        ? {
            files,
            filesUpdatedAt:
              input.labProgress.filesUpdatedAt ?? new Date().toISOString(),
          }
        : input.labProgress.files !== undefined
          ? { files: {}, filesUpdatedAt: new Date().toISOString() }
          : {}),
    }

    // Se o client omitiu files, preservar workspace já salvo.
    if (input.labProgress.files === undefined) {
      const existing = await this.userProgressRepository.findByUserAndTask(
        input.userId,
        input.lessonId,
      )
      const prev = parseLabProgress(
        (existing as { labProgress?: unknown } | null)?.labProgress ?? null,
      )
      if (prev?.files && Object.keys(prev.files).length > 0) {
        labProgress.files = prev.files
        labProgress.filesUpdatedAt = prev.filesUpdatedAt
      }
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

export type LabProgressJson = Prisma.InputJsonValue
