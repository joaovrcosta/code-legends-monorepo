import { beforeEach, describe, expect, it, vi } from 'vitest'
import { GetRoadmapUseCase } from './get-roadmap'
import type { ICourseRepository } from '../../../repositories/course-repository'
import type { IUserCourseRepository } from '../../../repositories/user-course-repository'
import type { IUserProgressRepository } from '../../../repositories/user-progress-repository'

vi.mock('../../../lib/prisma', () => ({
  prisma: {
    module: {
      findMany: vi.fn(),
    },
  },
}))

vi.mock('../../../utils/gamification-settings-cache', () => ({
  getGamificationSettingsCached: vi.fn().mockResolvedValue({
    xpPerLesson: 15,
    xpPerProject: 50,
    xpQuizMultiplier: 1.5,
  }),
}))

vi.mock('../../../utils/path-unit-access', () => ({
  assertUserCanAccessPathUnitCourse: vi.fn().mockResolvedValue(undefined),
  ensureUserCourseForPathUnit: vi.fn().mockResolvedValue(undefined),
}))

import { prisma } from '../../../lib/prisma'

describe('GetRoadmapUseCase — light payload contract', () => {
  let courseRepository: ICourseRepository
  let userCourseRepository: IUserCourseRepository
  let userProgressRepository: IUserProgressRepository

  beforeEach(() => {
    vi.clearAllMocks()

    courseRepository = {
      findById: vi.fn().mockResolvedValue({
        id: 'course-1',
        title: 'Curso',
        slug: 'curso',
        status: 'PUBLISHED',
        isFree: true,
        instructor: { name: 'Instrutor' },
      }),
    } as unknown as ICourseRepository

    userCourseRepository = {
      findByUserAndCourse: vi.fn().mockResolvedValue({
        id: 'uc-1',
        currentTaskId: 1,
        currentModuleId: 'mod-1',
        isCompleted: false,
      }),
    } as unknown as IUserCourseRepository

    userProgressRepository = {
      findByUserCourse: vi.fn().mockResolvedValue([]),
    } as unknown as IUserProgressRepository

    vi.mocked(prisma.module.findMany).mockResolvedValue([
      {
        id: 'mod-1',
        title: 'Módulo 1',
        slug: 'modulo-1',
        submodules: [
          {
            id: 10,
            title: 'Grupo 1',
            lessons: [
              {
                id: 1,
                title: 'Aula 1',
                slug: 'aula-1',
                description: 'Desc',
                type: 'VIDEO',
                order: 1,
                locked: false,
                isFree: true,
                video: { duration: '10m 0s' },
              },
              {
                id: 2,
                title: 'Quiz',
                slug: 'quiz-1',
                description: 'Quiz desc',
                type: 'QUIZ',
                order: 2,
                locked: false,
                isFree: false,
                video: null,
              },
            ],
          },
        ],
      },
    ] as never)
  })

  it('does not load or return heavy content fields on lessons', async () => {
    const useCase = new GetRoadmapUseCase(
      courseRepository,
      userCourseRepository,
      userProgressRepository,
    )

    const result = await useCase.execute({
      userId: 'user-1',
      courseId: 'course-1',
    })

    expect(prisma.module.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          submodules: expect.objectContaining({
            include: expect.objectContaining({
              lessons: expect.objectContaining({
                include: {
                  video: { select: { duration: true } },
                },
              }),
            }),
          }),
        }),
      }),
    )

    const lesson = result.modules[0]?.groups[0]?.lessons[0]
    expect(lesson).toBeDefined()
    expect(lesson).not.toHaveProperty('article')
    expect(lesson).not.toHaveProperty('quiz')
    expect(lesson).not.toHaveProperty('project')
    expect(lesson).not.toHaveProperty('video_url')
    expect(lesson?.video).not.toHaveProperty('url')
    expect(lesson).toMatchObject({
      id: expect.any(Number),
      title: expect.any(String),
      slug: expect.any(String),
      type: expect.any(String),
      status: expect.any(String),
      video_duration: expect.anything(),
    })

    const quizLesson = result.modules[0]?.groups[0]?.lessons[1]
    expect(quizLesson).not.toHaveProperty('quiz')
    expect(quizLesson).not.toHaveProperty('article')
    expect(quizLesson).not.toHaveProperty('project')
  })
})
