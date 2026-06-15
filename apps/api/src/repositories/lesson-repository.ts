import { Lesson } from '@prisma/client'

interface CreateLessonData {
  title: string
  description: string
  type: string
  slug: string
  url?: string
  isFree?: boolean
  locked?: boolean
  submoduleId: number
  order?: number
  authorId: string
}

interface UpdateLessonData {
  title?: string
  description?: string
  type?: string
  slug?: string
  url?: string
  isFree?: boolean
  locked?: boolean
  order?: number
}

export interface FindAllLessonsOptions {
  includeContent?: boolean
}

export interface ILessonRepository {
  create(data: CreateLessonData): Promise<Lesson>
  findAll(groupId?: number, options?: FindAllLessonsOptions): Promise<Lesson[]>
  findById(id: number): Promise<Lesson | null>
  findCourseIdByLessonId(id: number): Promise<string | null>
  findBySlug(slug: string): Promise<Lesson | null>
  findByCourseIdAndSlug(courseId: string, slug: string): Promise<Lesson | null>
  findByCourseIdAndSlugAndModuleSlug(
    courseId: string,
    slug: string,
    moduleSlug: string,
  ): Promise<Lesson | null>
  findBySlugAndSubmoduleId(
    slug: string,
    submoduleId: number,
  ): Promise<Lesson | null>
  update(id: number, data: UpdateLessonData): Promise<Lesson>
  delete(id: number): Promise<void>
}
