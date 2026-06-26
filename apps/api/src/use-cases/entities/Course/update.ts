import { Course } from '@prisma/client'
import { ICourseRepository } from '../../../repositories/course-repository'
import { ICategoryRepository } from '../../../repositories/category-repository'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { CourseAlreadyExistsError } from '../../errors/course-already-exists'
import { CategoryNotFoundError } from '../../errors/category-not-found'
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

    return {
      course: updatedCourse,
      lessonsSynced,
    }
  }
}
