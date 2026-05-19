import { ILessonRepository } from '../../../repositories/lesson-repository'
import { IUserProgressRepository } from '../../../repositories/user-progress-repository'
import { IUserCourseRepository } from '../../../repositories/user-course-repository'
import { LessonNotFoundError } from '../../errors/lesson-not-found'
import { prisma } from '../../../lib/prisma'
import { LessonWithContentDTO } from '../../../domain/lesson'
import { normalizeQuizContentToArray } from './challenge-first-correct-xp'
import { computeEstimatedLessonXpReward } from '../../../lib/lesson-xp-reward'
import { getGamificationSettingsCached } from '../../../utils/gamification-settings-cache'

interface GetLessonByCourseIdAndSlugRequest {
  courseId: string
  slug: string
  userId: string
  /** Quando há aulas com mesmo slug em módulos diferentes (ex: "Aula 1"), desambigua pelo módulo. */
  moduleSlug?: string
}

interface NavigationItem {
  slug: string
  title: string
  moduleSlug: string
  groupSlug: string // Usando o ID do grupo como string, já que Group não tem slug
}

interface GetLessonByCourseIdAndSlugResponse {
  lesson: LessonWithContentDTO
  moduleTitle?: string
  status?: 'locked' | 'unlocked' | 'completed'
  isCurrent?: boolean
  canReview?: boolean
  navigation?: {
    previous?: NavigationItem
    next?: NavigationItem
  }
}

export class GetLessonByCourseIdAndSlugUseCase {
  constructor(
    private lessonRepository: ILessonRepository,
    private userProgressRepository: IUserProgressRepository,
    private userCourseRepository: IUserCourseRepository,
  ) {}

  async execute({
    courseId,
    slug,
    userId,
    moduleSlug,
  }: GetLessonByCourseIdAndSlugRequest): Promise<GetLessonByCourseIdAndSlugResponse> {
    const courseRow = await prisma.course.findUnique({
      where: { id: courseId },
      select: { status: true },
    })
    if (!courseRow || courseRow.status !== 'PUBLISHED') {
      throw new LessonNotFoundError()
    }

    const lessonEntity = moduleSlug
      ? await this.lessonRepository.findByCourseIdAndSlugAndModuleSlug(
          courseId,
          slug,
          moduleSlug,
        )
      : await this.lessonRepository.findByCourseIdAndSlug(courseId, slug)

    if (!lessonEntity) {
      throw new LessonNotFoundError()
    }

    // Buscar UserCourse para obter currentTaskId
    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId,
    )

    // Buscar progresso do usuário para essa lesson
    const userProgress = userCourse
      ? await this.userProgressRepository.findByUserAndTask(
          userId,
          lessonEntity.id,
        )
      : null

    const isCompleted = userProgress?.isCompleted ?? false

    // Buscar todas as lessons do curso em ordem para construir o navigation e status
    const modules = await prisma.module.findMany({
      where: { courseId },
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

    // Construir lista de todas as lessons em ordem (para determinar status)
    const allLessons: Array<{ id: number }> = []
    modules.forEach((module) => {
      module.submodules.forEach((group) => {
        group.lessons.forEach((lesson) => {
          allLessons.push({ id: lesson.id })
        })
      })
    })

    // Buscar todos os progressos do usuário para construir o mapa
    const userProgresses = userCourse
      ? await this.userProgressRepository.findByUserCourse(userCourse.id)
      : []

    const progressMap = new Map<number, boolean>()
    userProgresses.forEach((progress) => {
      progressMap.set(progress.taskId, progress.isCompleted)
    })

    // Encontrar índice da lesson atual
    const lessonIndex = allLessons.findIndex((l) => l.id === lessonEntity.id)

    // Determinar status: segue a mesma regra do roadmap,
    // considerando apenas o flag manual "locked" e o progresso (sem dependência de aulas anteriores)
    const manualLocked = (lessonEntity as any).locked as boolean | undefined

    let status: 'locked' | 'unlocked' | 'completed'
    if (isCompleted) {
      status = 'completed'
    } else if (manualLocked) {
      status = 'locked'
    } else {
      status = 'unlocked'
    }

    // Verificar se é a lesson atual
    const hasProgress = userProgresses.some((p) => p.isCompleted)
    const validCurrentTaskId =
      hasProgress &&
      userCourse?.currentTaskId &&
      allLessons.some((l) => l.id === userCourse.currentTaskId)
        ? userCourse.currentTaskId
        : (allLessons[0]?.id ?? null)

    const isCurrent = lessonEntity.id === validCurrentTaskId

    // Pode revisar se a aula foi concluída
    const canReview = isCompleted

    // Obter título do módulo da lesson atual
    const moduleTitle = (lessonEntity as { submodule?: { module?: { title: string } } })
      .submodule?.module?.title

    // Construir lista de todas as lessons com contexto (módulo e grupo) para navigation
    const allLessonsWithContext: Array<{
      id: number
      slug: string
      title: string
      moduleSlug: string
      groupId: number
    }> = []

    modules.forEach((module) => {
      module.submodules.forEach((group) => {
        group.lessons.forEach((lesson) => {
          allLessonsWithContext.push({
            id: lesson.id,
            slug: lesson.slug,
            title: lesson.title,
            moduleSlug: module.slug,
            groupId: group.id,
          })
        })
      })
    })

    // Encontrar a lesson atual na lista
    const currentLessonIndex = allLessonsWithContext.findIndex(
      (l) => l.id === lessonEntity.id,
    )

    // Construir navigation
    const navigation: {
      previous?: NavigationItem
      next?: NavigationItem
    } = {}

    // Previous lesson
    if (currentLessonIndex > 0) {
      const previousLesson = allLessonsWithContext[currentLessonIndex - 1]
      navigation.previous = {
        slug: previousLesson.slug,
        title: previousLesson.title,
        moduleSlug: previousLesson.moduleSlug,
        groupSlug: previousLesson.groupId.toString(),
      }
    }

    // Next lesson
    if (currentLessonIndex < allLessonsWithContext.length - 1) {
      const nextLesson = allLessonsWithContext[currentLessonIndex + 1]
      navigation.next = {
        slug: nextLesson.slug,
        title: nextLesson.title,
        moduleSlug: nextLesson.moduleSlug,
        groupSlug: nextLesson.groupId.toString(),
      }
    }

    const rawQuiz = (lessonEntity as any).quiz ?? null;
    const rawProject = (lessonEntity as any).project ?? null;
    const quizContent = rawQuiz
      ? normalizeQuizContentToArray(rawQuiz.content)
      : [];
    const gamification = await getGamificationSettingsCached();
    const lessonType = lessonEntity.type.toString().toLowerCase();
    const xpReward = computeEstimatedLessonXpReward(lessonType, gamification, {
      challengeCount: quizContent.length,
    });

    const lesson: LessonWithContentDTO = {
      id: lessonEntity.id,
      title: lessonEntity.title,
      slug: lessonEntity.slug,
      description: lessonEntity.description,
      type: lessonType,
      xpReward,
      isFree: lessonEntity.isFree,
      order: lessonEntity.order,
      video: (lessonEntity as any).video ?? null,
      article: (lessonEntity as any).article ?? null,
      quiz: rawQuiz ? { content: quizContent } : null,
      project: rawProject
        ? {
            description: rawProject.description,
            specs: rawProject.specs ?? null,
          }
        : null,
    }

    return {
      lesson,
      moduleTitle,
      status,
      isCurrent,
      canReview,
      navigation: Object.keys(navigation).length > 0 ? navigation : undefined,
    }
  }
}
