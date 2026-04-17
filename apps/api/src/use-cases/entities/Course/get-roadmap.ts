import { ICourseRepository } from '../../../repositories/course-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { CourseNotFoundError } from '../../errors/course-not-found'
import { prisma } from '../../../lib/prisma'

// Função auxiliar para converter duração em segundos
function parseDurationToSeconds(duration: string | null): number {
  if (!duration) return 0

  const trimmed = duration.trim()

  // Formato "Xm Ys" (ex: "12m 30s")
  const minutesSecondsMatch = trimmed.match(/(\d+)m\s*(\d+)s/)
  if (minutesSecondsMatch) {
    const minutes = parseInt(minutesSecondsMatch[1], 10)
    const seconds = parseInt(minutesSecondsMatch[2], 10)
    return minutes * 60 + seconds
  }

  // Formato "HH:MM:SS" ou "MM:SS"
  const parts = trimmed.split(':').map(Number)
  if (parts.length === 3) {
    // HH:MM:SS
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  } else if (parts.length === 2) {
    // MM:SS
    return parts[0] * 60 + parts[1]
  }

  return 0
}

interface RoadmapLesson {
  id: number
  title: string
  slug: string
  description: string
  type: string
  video_url: string | null
  video_duration: string | null
  video?: { url: string | null; duration: string | null } | null
  article?: { body: string } | null
  order: number
  status: 'locked' | 'unlocked' | 'completed'
  isCurrent: boolean
  canReview: boolean
  isFree: boolean
}

interface RoadmapGroup {
  id: number
  title: string
  lessons: RoadmapLesson[]
}

interface RoadmapModule {
  id: string
  title: string
  slug: string
  groups: RoadmapGroup[]
  progress: number
  isCompleted: boolean
}

interface GetRoadmapRequest {
  userId: string
  courseId: string
}

interface GetRoadmapResponse {
  course: {
    id: string
    title: string
    slug: string
    progress: number
    isCompleted: boolean
    isFree: boolean
    author: {
      name: string
    }
    currentModule: number | null
    currentModuleId: string | null
    nextModule: number | null
    totalModules: number
    currentClass: number | null
    canUnlockNextModule?: boolean // Se pode desbloquear o próximo módulo
    isLastLessonCompleted?: boolean // Se a última lição do módulo atual está completa
  }
  currentLesson?: {
    id: number
    title: string
    description: string
    duration: string | null
    progress: number
  } | null
  modules: RoadmapModule[]
}

export class GetRoadmapUseCase {
  constructor(
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository,
    private userProgressRepository: IUserProgressRepository,
  ) { }

  async execute({
    userId,
    courseId,
  }: GetRoadmapRequest): Promise<GetRoadmapResponse> {
    const course = await this.courseRepository.findById(courseId)
    if (!course) {
      throw new CourseNotFoundError()
    }

    if (course.status !== 'PUBLISHED') {
      throw new CourseNotFoundError()
    }

    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId,
    )

    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        submodules: {
          include: {
            lessons: {
              orderBy: {
                order: 'asc',
              },
              include: {
                video: true,
                article: true,
                quiz: true,
                project: true,
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

    const userProgresses = userCourse?.id
      ? await this.userProgressRepository.findByUserCourse(userCourse.id)
      : []

    const progressMap = new Map<number, boolean>()
    userProgresses.forEach((progress) => {
      progressMap.set(progress.taskId, progress.isCompleted)
    })

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

    allLessons.sort((a, b) => {
      if (a.moduleIndex !== b.moduleIndex) {
        return a.moduleIndex - b.moduleIndex
      }
      if (a.groupIndex !== b.groupIndex) {
        return a.groupIndex - b.groupIndex
      }
      return a.order - b.order
    })

    const currentTaskId = userCourse?.currentTaskId ?? null

    const hasProgress = userProgresses.some((p) => p.isCompleted)

    let validCurrentTaskId: number | null = null

    if (!hasProgress) {
      validCurrentTaskId = allLessons[0]?.id ?? null
    } else {
      if (currentTaskId && allLessons.some((l) => l.id === currentTaskId)) {
        validCurrentTaskId = currentTaskId
      } else {
        const firstIncomplete = allLessons.find(
          (l) => !(progressMap.get(l.id) ?? false),
        )
        validCurrentTaskId =
          firstIncomplete?.id ?? allLessons[allLessons.length - 1]?.id ?? null
      }
    }

    // Identificar o módulo atual
    let currentModuleId: string | null = null

    // Primeiro, tentar usar o currentModuleId do userCourse
    if (userCourse?.currentModuleId) {
      const moduleExists = modules.some(
        (m) => m.id === userCourse.currentModuleId,
      )
      if (moduleExists) {
        currentModuleId = userCourse.currentModuleId
      }
    }

    // Se não encontrou pelo currentModuleId, tentar determinar pelo currentTaskId
    if (!currentModuleId && validCurrentTaskId) {
      // Encontrar em qual módulo está a aula atual
      for (const module of modules) {
        const hasLesson = module.submodules.some((group) =>
          group.lessons.some((lesson) => lesson.id === validCurrentTaskId),
        )
        if (hasLesson) {
          currentModuleId = module.id
          break
        }
      }
    }

    if (!currentModuleId && modules.length > 0) {
      currentModuleId = modules[0].id
    }

    // Identificar o módulo atual (para cálculos de currentModule, nextModule, etc)
    const currentModule = modules.find((m) => m.id === currentModuleId)

    // Função auxiliar para construir o roadmap de um módulo
    const buildModuleRoadmap = (
      module: (typeof modules)[number],
    ): RoadmapModule => {
      // Calcular progresso do módulo em tempo real
      const moduleLessons: Array<{ id: number }> = []
      module.submodules.forEach((group) => {
        group.lessons.forEach((lesson) => {
          moduleLessons.push({ id: lesson.id })
        })
      })

      const totalModuleLessons = moduleLessons.length
      const completedModuleLessons = userProgresses.filter((p) => {
        return p.isCompleted && moduleLessons.some((l) => l.id === p.taskId)
      }).length

      const moduleProgressValue =
        totalModuleLessons > 0 ? completedModuleLessons / totalModuleLessons : 0
      const moduleCompleted = completedModuleLessons === totalModuleLessons

      const roadmapGroups: RoadmapGroup[] = module.submodules.map((group) => {
        const roadmapLessons: RoadmapLesson[] = group.lessons.map((lesson) => {
          const isCompleted = progressMap.get(lesson.id) ?? false
          const manualLocked = lesson.locked

          let status: 'locked' | 'unlocked' | 'completed'
          if (isCompleted) {
            status = 'completed'
          } else if (manualLocked) {
            status = 'locked'
          } else {
            status = 'unlocked'
          }

          const isCurrent = lesson.id === validCurrentTaskId
          const canReview = isCompleted

          const lessonWithContent = lesson as typeof lesson & {
            video?: { url: string | null; duration: string | null } | null
            article?: { body: string } | null
            quiz?: { content: unknown } | null
            project?: { description: string; specs: unknown } | null
          }
          return {
            id: lesson.id,
            title: lesson.title,
            slug: lesson.slug,
            description: lesson.description,
            type: lesson.type.toLowerCase(),
            video_url: lessonWithContent.video?.url ?? null,
            video_duration: lessonWithContent.video?.duration ?? null,
            video: lessonWithContent.video ?? null,
            article: lessonWithContent.article ?? null,
            quiz: lessonWithContent.quiz ?? null,
            project: lessonWithContent.project ?? null,
            order: lesson.order,
            status,
            isCurrent,
            canReview,
            isFree: lesson.isFree,
          }
        })

        return {
          id: group.id,
          title: group.title,
          lessons: roadmapLessons,
        }
      })

      return {
        id: module.id,
        title: module.title,
        slug: module.slug,
        groups: roadmapGroups,
        progress: moduleProgressValue,
        isCompleted: moduleCompleted,
      }
    }

    // Construir o roadmap para TODOS os módulos
    const roadmapModules: RoadmapModule[] = modules.map(buildModuleRoadmap)

    // Calcular progresso geral do curso
    const totalLessons = allLessons.length
    const completedLessons = userProgresses.filter((p) => p.isCompleted).length
    const courseProgress =
      totalLessons > 0 ? completedLessons / totalLessons : 0

    // Calcular módulo atual (índice + 1, começando em 1)
    let currentModuleIndex: number | null = null

    if (currentModuleId) {
      const moduleIndex = modules.findIndex((m) => m.id === currentModuleId)
      if (moduleIndex >= 0) {
        currentModuleIndex = moduleIndex + 1
      }
    }

    // Calcular próximo módulo (se existir)
    let nextModuleIndex: number | null = null
    if (currentModuleIndex !== null) {
      const currentModuleArrayIndex = currentModuleIndex - 1 // Converter de número do módulo para índice do array
      if (
        currentModuleArrayIndex >= 0 &&
        currentModuleArrayIndex < modules.length - 1
      ) {
        // Se existe um próximo módulo no array
        nextModuleIndex = currentModuleArrayIndex + 2 // +2 porque: +1 para o próximo índice, +1 para converter para número do módulo
      }
    }

    // Calcular se a última lição do módulo atual está completa
    let isLastLessonCompleted = false
    let currentClass: number | null = null

    if (currentModule) {
      // Encontrar todas as lições do módulo atual
      const currentModuleLessons: Array<{
        id: number
        order: number
        groupIndex: number
      }> = []
      currentModule.submodules.forEach((group, groupIndex) => {
        group.lessons.forEach((lesson) => {
          currentModuleLessons.push({
            id: lesson.id,
            order: lesson.order,
            groupIndex,
          })
        })
      })

      if (currentModuleLessons.length > 0) {
        // Ordenar por grupo e depois por order
        currentModuleLessons.sort((a, b) => {
          if (a.groupIndex !== b.groupIndex) {
            return a.groupIndex - b.groupIndex
          }
          return a.order - b.order
        })

        // Calcular currentClass dentro do módulo atual (não em relação a todas as lessons do curso)
        if (validCurrentTaskId) {
          const classIndexInModule = currentModuleLessons.findIndex(
            (l) => l.id === validCurrentTaskId,
          )
          currentClass = classIndexInModule >= 0 ? classIndexInModule + 1 : null
        }

        // Encontrar a última lição do módulo atual
        const lastLesson = currentModuleLessons[currentModuleLessons.length - 1]
        isLastLessonCompleted = progressMap.get(lastLesson.id) ?? false
      }
    }

    // Calcular se pode desbloquear o próximo módulo
    // Precisa: todas as lições do módulo atual completadas E existe próximo módulo
    let canUnlockNextModule = false
    if (currentModule && nextModuleIndex !== null) {
      // Verificar se todas as lições do módulo atual foram completadas
      const moduleLessons: Array<{ id: number }> = []
      currentModule.submodules.forEach((group) => {
        group.lessons.forEach((lesson) => {
          moduleLessons.push({ id: lesson.id })
        })
      })

      const totalModuleLessons = moduleLessons.length
      const completedModuleLessons = userProgresses.filter((p) => {
        return p.isCompleted && moduleLessons.some((l) => l.id === p.taskId)
      }).length

      canUnlockNextModule =
        completedModuleLessons === totalModuleLessons && totalModuleLessons > 0
    }

    // Type assertion necessário porque o Prisma retorna Course com includes
    const courseWithInstructor = course as typeof course & {
      instructor?: { name: string }
    }

    // Encontrar a lição atual para retornar informações detalhadas
    let currentLessonInfo: {
      id: number
      title: string
      description: string
      duration: string | null
      progress: number
    } | null = null

    if (validCurrentTaskId) {
      // Buscar a lição atual nos módulos
      for (const module of modules) {
        for (const group of module.submodules) {
          const lesson = group.lessons.find((l) => l.id === validCurrentTaskId)
          if (lesson) {
            // Buscar progresso específico desta lição
            const userProgress = userProgresses.find(
              (p) => p.taskId === lesson.id,
            )
            const isCompleted = userProgress?.isCompleted ?? false

            // Calcular progresso (0% se não iniciada, 100% se completa, ou usar timeSpent se disponível)
            let progress = 0
            if (isCompleted) {
              progress = 100
            } else if (userProgress?.timeSpent) {
              const lessonWithContent = lesson as typeof lesson & {
                video?: { duration: string | null } | null
              }
              const duration = lessonWithContent.video?.duration
              if (duration) {
                const durationSeconds = parseDurationToSeconds(duration)
                if (durationSeconds > 0) {
                  progress = Math.min(
                    100,
                    Math.round(
                      (userProgress.timeSpent / durationSeconds) * 100,
                    ),
                  )
                }
              }
            }

            const lessonWithContent = lesson as typeof lesson & {
              video?: { duration: string | null } | null
            }
            currentLessonInfo = {
              id: lesson.id,
              title: lesson.title,
              description: lesson.description,
              duration: lessonWithContent.video?.duration ?? null,
              progress,
            }
            break
          }
        }
        if (currentLessonInfo) break
      }
    }

    return {
      course: {
        id: course.id,
        title: course.title,
        slug: course.slug,
        progress: courseProgress,
        isCompleted: userCourse?.isCompleted ?? false,
        isFree: course.isFree,
        author: {
          name: courseWithInstructor.instructor?.name ?? '',
        },
        currentModule: currentModuleIndex,
        currentModuleId: currentModuleId,
        nextModule: nextModuleIndex,
        totalModules: modules.length,
        currentClass,
        canUnlockNextModule,
        isLastLessonCompleted,
      },
      currentLesson: currentLessonInfo,
      modules: roadmapModules,
    }
  }
}
