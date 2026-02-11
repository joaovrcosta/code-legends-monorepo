import { User } from "@prisma/client";
import { IUsersRepository } from "../../../repositories/users-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { prisma } from "../../../lib/prisma";

interface GetAccountOverviewRequest {
  userId: string;
  completedLessonsLimit?: number;
}

interface AccountOverviewResponse {
  user: User & { Address?: any };
  activeCourse: {
    id: string;
    title: string;
    slug: string;
    progress: number;
    isCompleted: boolean;
    currentModuleId: string | null;
    currentTaskId: number | null;
  } | null;
  enrolledCourses: {
    id: string;
    courseId: string;
    courseTitle: string;
    courseSlug: string;
    progress: number;
    isCompleted: boolean;
    enrolledAt: Date;
    lastAccessedAt: Date;
    currentModuleId: string | null;
    currentTaskId: number | null;
  }[];
  completedLessons: {
    id: string;
    lessonId: number;
    lessonTitle: string;
    lessonSlug: string;
    courseId: string;
    courseTitle: string;
    completedAt: Date;
    timeSpent: number;
    score: number | null;
  }[];
  completedLessonsTotal: number;
  completedLessonsLimit: number;
  statistics: {
    totalCourses: number;
    completedCourses: number;
    inProgressCourses: number;
    totalLessonsCompleted: number;
    totalXp: number;
    level: number;
    xpToNextLevel: number;
  };
}

export class GetAccountOverviewUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private userCourseRepository: IUserCourseRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({ userId, completedLessonsLimit = 50 }: GetAccountOverviewRequest): Promise<AccountOverviewResponse> {
    // Buscar usuário com Address
    const user = await this.usersRepository.findByIdWithAddress(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Buscar curso ativo
    let activeCourse = null;
    if (user.activeCourseId) {
      const userCourse = await this.userCourseRepository.findByUserAndCourse(
        userId,
        user.activeCourseId
      );
      
      if (userCourse) {
        const course = await prisma.course.findUnique({
          where: { id: user.activeCourseId },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });

        if (course) {
          activeCourse = {
            id: course.id,
            title: course.title,
            slug: course.slug,
            progress: userCourse.progress,
            isCompleted: userCourse.isCompleted,
            currentModuleId: userCourse.currentModuleId,
            currentTaskId: userCourse.currentTaskId,
          };
        }
      }
    }

    // Buscar todos os cursos inscritos
    const userCourses = await this.userCourseRepository.findByUserId(userId);
    const enrolledCourses = await Promise.all(
      userCourses.map(async (userCourse) => {
        const course = await prisma.course.findUnique({
          where: { id: userCourse.courseId },
          select: {
            id: true,
            title: true,
            slug: true,
          },
        });

        return {
          id: userCourse.id,
          courseId: userCourse.courseId,
          courseTitle: course?.title || "Curso não encontrado",
          courseSlug: course?.slug || "",
          progress: userCourse.progress,
          isCompleted: userCourse.isCompleted,
          enrolledAt: userCourse.enrolledAt,
          lastAccessedAt: userCourse.lastAccessedAt,
          currentModuleId: userCourse.currentModuleId,
          currentTaskId: userCourse.currentTaskId,
        };
      })
    );

    // Contar total de aulas completadas (query otimizada apenas para contar)
    const totalCompletedLessons = await prisma.userProgress.count({
      where: {
        userId,
        isCompleted: true,
      },
    });

    // Buscar aulas completadas com limite (usando take para otimizar)
    const limitedUserProgresses = await prisma.userProgress.findMany({
      where: {
        userId,
        isCompleted: true,
      },
      take: completedLessonsLimit,
      include: {
        task: {
          select: {
            id: true,
            title: true,
            slug: true,
            submodule: {
              select: {
                module: {
                  select: {
                    courseId: true,
                    course: {
                      select: {
                        id: true,
                        title: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "desc",
      },
    });

    const completedLessons = limitedUserProgresses.map((progress) => ({
      id: progress.id,
      lessonId: progress.task.id,
      lessonTitle: progress.task.title,
      lessonSlug: progress.task.slug,
      courseId: progress.task.submodule.module.courseId,
      courseTitle: progress.task.submodule.module.course.title,
      completedAt: progress.completedAt!,
      timeSpent: progress.timeSpent,
      score: progress.score,
    }));

    // Calcular estatísticas
    const completedCourses = enrolledCourses.filter((c) => c.isCompleted).length;
    const inProgressCourses = enrolledCourses.filter((c) => !c.isCompleted).length;

    return {
      user,
      activeCourse,
      enrolledCourses,
      completedLessons,
      completedLessonsTotal: totalCompletedLessons,
      completedLessonsLimit: completedLessons.length,
      statistics: {
        totalCourses: enrolledCourses.length,
        completedCourses,
        inProgressCourses,
        totalLessonsCompleted: totalCompletedLessons,
        totalXp: user.totalXp,
        level: user.level,
        xpToNextLevel: user.xpToNextLevel,
      },
    };
  }
}
