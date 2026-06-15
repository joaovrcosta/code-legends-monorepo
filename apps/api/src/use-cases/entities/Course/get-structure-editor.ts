import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'

interface GetCourseStructureEditorRequest {
  courseId: string
  includeContent?: boolean
}

function normalizeLessonType(type: string): string {
  return type.toString().trim().toLowerCase()
}

function mapLessonForEditor(
  lesson: {
    id: number
    title: string
    description: string
    type: string
    slug: string
    url: string | null
    isFree: boolean
    video_url: string | null
    video_duration: string | null
    locked: boolean
    submoduleId: number
    order: number
    createdAt: Date
    updatedAt: Date
    authorId: string
    video?: {
      url: string | null
      duration: string | null
      providerId: string | null
      provider?: {
        id: string
        slug: string
        name: string
        handlerKey: string
      } | null
    } | null
    article?: { body: string } | null
    quiz?: { content: unknown } | null
    project?: {
      description: string
      specs?: unknown
    } | null
  },
  includeContent: boolean,
) {
  const mapped: Record<string, unknown> = {
    id: lesson.id,
    title: lesson.title,
    description: lesson.description,
    type: normalizeLessonType(lesson.type),
    slug: lesson.slug,
    url: lesson.url,
    isFree: lesson.isFree,
    video_url: lesson.video?.url ?? lesson.video_url ?? null,
    video_duration: lesson.video?.duration ?? lesson.video_duration ?? null,
    video: lesson.video
      ? {
          url: lesson.video.url,
          duration: lesson.video.duration,
          providerId: lesson.video.providerId,
          provider: lesson.video.provider
            ? {
                id: lesson.video.provider.id,
                slug: lesson.video.provider.slug,
                name: lesson.video.provider.name,
                handlerKey: lesson.video.provider.handlerKey,
              }
            : null,
        }
      : null,
    locked: lesson.locked,
    submoduleId: lesson.submoduleId,
    order: lesson.order,
    createdAt: lesson.createdAt.toISOString(),
    updatedAt: lesson.updatedAt.toISOString(),
    authorId: lesson.authorId,
  }

  if (includeContent) {
    if (lesson.article) {
      mapped.article = { body: lesson.article.body }
    }
    if (lesson.quiz) {
      mapped.quiz = {
        content: Array.isArray(lesson.quiz.content) ? lesson.quiz.content : [],
      }
    }
    if (lesson.project) {
      mapped.project = {
        description: lesson.project.description,
        specs: lesson.project.specs ?? null,
      }
    }
  }

  return mapped
}

export class GetCourseStructureEditorUseCase {
  async execute({
    courseId,
    includeContent = false,
  }: GetCourseStructureEditorRequest) {
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        instructor: {
          select: {
            id: true,
            name: true,
            avatar: true,
            slug: true,
          },
        },
        category: {
          select: {
            id: true,
            name: true,
            slug: true,
            color: true,
            icon: true,
          },
        },
        tags: {
          select: {
            name: true,
          },
        },
        modules: {
          orderBy: { orderIndex: 'asc' },
          include: {
            submodules: {
              orderBy: { orderIndex: 'asc' },
              include: {
                lessons: {
                  orderBy: { order: 'asc' },
                  include: {
                    video: { include: { provider: true } },
                    ...(includeContent
                      ? { article: true, quiz: true, project: true }
                      : {}),
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!course) {
      throw new CourseNotFoundError()
    }

    const modules = course.modules.map((module) => ({
      id: module.id,
      title: module.title,
      slug: module.slug,
      courseId: module.courseId,
      orderIndex: module.orderIndex,
      groups: module.submodules.map((group) => ({
        id: group.id,
        title: group.title,
        moduleId: group.moduleId,
        orderIndex: group.orderIndex,
        lessons: group.lessons.map((lesson) =>
          mapLessonForEditor(lesson, includeContent),
        ),
      })),
    }))

    const { modules: _modules, ...courseWithoutModules } = course

    return {
      course: courseWithoutModules,
      modules,
    }
  }
}
