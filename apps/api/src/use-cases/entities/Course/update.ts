import { Course } from '@prisma/client'
import { ICourseRepository } from '../../../repositories/course-repository'
import { ICategoryRepository } from '../../../repositories/category-repository'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { CourseAlreadyExistsError } from '../../errors/course-already-exists'
import { CategoryNotFoundError } from '../../errors/category-not-found'
import { NotificationBuilder } from '../../../utils/notification-builder'
import { createNotificationsBatch } from '../../../utils/create-notification'
import { prisma } from '../../../lib/prisma'
import {
  type LessonFreeSync,
  resolveLessonFreeSyncAction,
  syncCourseLessonsIsFree,
} from './sync-course-lessons-is-free'

interface UpdateCourseRequest {
  id: string
  title?: string
  slug?: string
  description?: string
  level?: string
  categoryId?: string | null
  thumbnail?: string | null
  icon?: string | null
  colorHex?: string | null
  tags?: string[]
  isFree?: boolean
  active?: boolean
  releaseAt?: Date | null
  lessonFreeSync?: LessonFreeSync
}

interface UpdateCourseResponse {
  course: Course
  lessonsSynced: number
}

export class UpdateCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(data: UpdateCourseRequest): Promise<UpdateCourseResponse> {
    const course = await this.courseRepository.findById(data.id)

    if (!course) {
      throw new CourseNotFoundError()
    }

    if (data.slug && data.slug !== course.slug) {
      const courseWithSameSlug = await this.courseRepository.findBySlug(
        data.slug,
      )

      if (courseWithSameSlug) {
        throw new CourseAlreadyExistsError()
      }
    }

    if (data.categoryId) {
      const category = await this.categoryRepository.findById(data.categoryId)

      if (!category) {
        throw new CategoryNotFoundError()
      }
    }

    const wasActive = course.active
    const wasFree = course.isFree

    const updatedCourse = await this.courseRepository.update(data.id, {
      title: data.title,
      slug: data.slug,
      description: data.description,
      level: data.level,
      categoryId: data.categoryId,
      thumbnail: data.thumbnail,
      icon: data.icon,
      colorHex: data.colorHex,
      tags: data.tags,
      isFree: data.isFree,
      active: data.active,
      releaseAt: data.releaseAt,
    })

    const syncAction = resolveLessonFreeSyncAction({
      wasFree,
      isFreeNow: updatedCourse.isFree,
      explicit: data.lessonFreeSync,
    })

    let lessonsSynced = 0
    if (syncAction === 'all_free') {
      lessonsSynced = await syncCourseLessonsIsFree(updatedCourse.id, true)
    } else if (syncAction === 'all_paid') {
      lessonsSynced = await syncCourseLessonsIsFree(updatedCourse.id, false)
    }

    if (!wasActive && updatedCourse.active) {
      setImmediate(async () => {
        try {
          const instructor = await prisma.user.findUnique({
            where: { id: course.instructorId },
            select: { name: true },
          })

          const thirtyDaysAgo = new Date()
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

          const users = await prisma.user.findMany({
            where: {
              lastLogin: {
                gte: thirtyDaysAgo,
              },
            },
            select: { id: true },
          })

          if (users.length > 0) {
            const notifications = users.map((user) =>
              NotificationBuilder.createNewCourseNotification(user.id, {
                courseId: updatedCourse.id,
                courseTitle: updatedCourse.title,
                courseSlug: updatedCourse.slug,
                instructorName: instructor?.name,
              }),
            )

            await createNotificationsBatch(notifications)
          }
        } catch (error) {
          console.error('Erro ao criar notificações de novo curso:', {
            courseId: updatedCourse.id,
            error: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
          })
        }
      })
    }

    return {
      course: updatedCourse,
      lessonsSynced,
    }
  }
}
