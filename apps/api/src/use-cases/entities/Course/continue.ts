import { ICourseRepository } from '../../../repositories/course-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { ILessonRepository } from '../../../repositories/lesson-repository'
import { IUsersRepository } from '../../../repositories/users-repository'
import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'
import { LessonWithContentDTO } from '../../../domain/lesson'
import { resolveDisplayCurrentTaskId } from '../../../utils/resolve-current-task-id'

interface ContinueCourseRequest {
  userId: string
  courseId?: string
}

interface ContinueCourseResponse {
  lesson:
  | (LessonWithContentDTO & {
    video_url: string | null
    video_duration: string | null
  })
  | null
  module: {
    id: string
    title: string
    slug: string
  } | null
  course: {
    id: string
    title: string
    slug: string
    progress: number
    isCompleted: boolean
  }
}

export class ContinueCourseUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private lessonRepository: ILessonRepository,
    private usersRepository: IUsersRepository,
    private userProgressRepository: IUserProgressRepository,
  ) { }

  async execute({
    userId,
    courseId,
  }: ContinueCourseRequest): Promise<ContinueCourseResponse> {
    // Se courseId não for fornecido, buscar o curso ativo do usuário
    let activeCourseId: string | undefined = courseId

    if (!activeCourseId) {
      const user = await this.usersRepository.findById(userId)
      activeCourseId = user?.activeCourseId ?? undefined

      if (!activeCourseId) {
        // Se não tem curso ativo e não foi fornecido courseId, retornar null
        return {
          lesson: null,
          module: null,
          course: {
            id: '',
            title: '',
            slug: '',
            progress: 0,
            isCompleted: false,
          },
        }
      }
    }

    const course = await this.courseRepository.findById(activeCourseId)
    if (!course) {
      throw new CourseNotFoundError()
    }

    if (course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      activeCourseId,
    )

    if (!userCourse) {
      return {
        lesson: null,
        module: null,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          progress: 0,
          isCompleted: false,
        },
      }
    }

    // Se o curso está concluído, retornar null
    if (userCourse.isCompleted) {
      return {
        lesson: null,
        module: null,
        course: {
          id: course.id,
          title: course.title,
          slug: course.slug,
          progress: userCourse.progress,
          isCompleted: true,
        },
      }
    }

    // Buscar progressos do usuário
    const userProgresses = await this.userProgressRepository.findByUserCourse(
      userCourse.id,
    )

    // Verificar se há progresso (lições completadas)
    const progressMap = new Map<number, boolean>()
    userProgresses.forEach((progress) => {
      progressMap.set(progress.taskId, progress.isCompleted)
    })

    // Buscar todos os módulos com submodules e aulas para determinar a primeira lição
    const modules = await prisma.module.findMany({
      where: { courseId: activeCourseId },
      include: {
        submodules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
            },
          },
          orderBy: {
            id: 'asc',
          },
        },
      },
      orderBy: {
        id: 'asc',
      },
    })

    // Construir todas as aulas em ordem (módulo -> grupo -> order)
    const allLessons: Array<{
      id: number
      order: number
      moduleIndex: number
      groupIndex: number
    }> = []
    modules.forEach((module, moduleIndex) => {
      module.submodules.forEach((group, groupIndex) => {
        group.lessons.forEach((lesson) => {
          allLessons.push({
            id: lesson.id,
            order: lesson.order,
            moduleIndex,
            groupIndex,
          })
        })
      })
    })

    // Ordenar todas as lições por: módulo -> grupo -> order
    allLessons.sort((a, b) => {
      if (a.moduleIndex !== b.moduleIndex) {
        return a.moduleIndex - b.moduleIndex
      }
      if (a.groupIndex !== b.groupIndex) {
        return a.groupIndex - b.groupIndex
      }
      return a.order - b.order
    })

    const validCurrentTaskId = resolveDisplayCurrentTaskId(
      allLessons,
      (taskId) => progressMap.get(taskId) ?? false,
      userCourse.currentTaskId,
    )

    // Buscar a aula atual
    let lesson = null
    let moduleData = null

    if (validCurrentTaskId) {
      const foundLesson =
        await this.lessonRepository.findById(validCurrentTaskId)

      if (foundLesson) {
        const lessonWithContent = foundLesson as typeof foundLesson & {
          video?: { url: string | null; duration: string | null } | null
          article?: { body: string } | null
        }
        lesson = {
          id: foundLesson.id,
          title: foundLesson.title,
          slug: foundLesson.slug,
          description: foundLesson.description,
          type: foundLesson.type.toString().toLowerCase(),
          isFree: foundLesson.isFree,
          order: foundLesson.order,
          video: lessonWithContent.video ?? null,
          article: lessonWithContent.article ?? null,
          video_url: lessonWithContent.video?.url ?? null,
          video_duration: lessonWithContent.video?.duration ?? null,
        }

        // Buscar o módulo da lição atual
        const lessonGroup = await prisma.submodule.findFirst({
          where: {
            lessons: {
              some: {
                id: validCurrentTaskId,
              },
            },
          },
          include: {
            module: {
              select: {
                id: true,
                title: true,
                slug: true,
              },
            },
          },
        })

        if (lessonGroup?.module) {
          moduleData = lessonGroup.module
        }
      }
    }

    return {
      lesson,
      module: moduleData,
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        progress: userCourse.progress,
        isCompleted: userCourse.isCompleted,
      },
    }
  }
}
