import { prisma } from "../../../lib/prisma";
import { IUsersRepository } from "../../../repositories/users-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface UnenrollFromCourseRequest {
  userId: string;
  courseId: string;
}

interface UnenrollFromCourseResponse {
  message: string;
}

export class UnenrollFromCourseUseCase {
  constructor(
    private usersRepository: IUsersRepository,
    private courseRepository: ICourseRepository,
    private userCourseRepository: IUserCourseRepository
  ) {}

  async execute({
    userId,
    courseId,
  }: UnenrollFromCourseRequest): Promise<UnenrollFromCourseResponse> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    const course = await this.courseRepository.findById(courseId);
    if (!course) {
      throw new CourseNotFoundError();
    }

    const userCourse = await this.userCourseRepository.findByUserAndCourse(
      userId,
      courseId
    );

    if (!userCourse) {
      throw new Error("User is not enrolled in this course");
    }

    await prisma.$transaction(async (tx) => {
      // 1) Coletar todas as lessons do curso
      const lessons = await tx.lesson.findMany({
        where: {
          submodule: {
            module: {
              courseId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const lessonIds = lessons.map((l) => l.id);

      if (lessonIds.length > 0) {
        // 2) Remover XP global relacionado a essas lessons
        const xpHistoryEntries = await tx.userXpHistory.findMany({
          where: {
            userId,
            source: "lesson_completed",
            sourceId: {
              in: lessonIds,
            },
          },
        });

        const xpToRemove = xpHistoryEntries.reduce(
          (sum, entry) => sum + entry.xpAmount,
          0
        );

        if (xpToRemove > 0) {
          const updatedTotalXp = Math.max(0, user.totalXp - xpToRemove);

          // Recalcular level e xpToNextLevel com base nas funções existentes
          const level = this.calculateLevel(updatedTotalXp);
          const xpToNextLevel = this.calculateXpToNextLevel(
            level,
            updatedTotalXp
          );

          await tx.user.update({
            where: { id: userId },
            data: {
              totalXp: updatedTotalXp,
              level,
              xpToNextLevel,
            },
          });
        }

        await tx.userXpHistory.deleteMany({
          where: {
            userId,
            source: "lesson_completed",
            sourceId: {
              in: lessonIds,
            },
          },
        });

        // 3) Remover XP de skills associado a essas lessons
        const skillXpHistoryEntries = await tx.userSkillXpHistory.findMany({
          where: {
            userId,
            source: "lesson_completed",
            sourceId: {
              in: lessonIds,
            },
          },
        });

        if (skillXpHistoryEntries.length > 0) {
          const xpBySkill = new Map<string, number>();
          for (const entry of skillXpHistoryEntries) {
            const current = xpBySkill.get(entry.skillId) ?? 0;
            xpBySkill.set(entry.skillId, current + entry.xpAmount);
          }

          for (const [skillId, xpToSub] of xpBySkill.entries()) {
            await tx.userSkillXp.updateMany({
              where: {
                userId,
                skillId,
              },
              data: {
                xp: {
                  decrement: xpToSub,
                },
              },
            });

            // Garantir que XP não fique negativo
            await tx.userSkillXp.updateMany({
              where: {
                userId,
                skillId,
                xp: {
                  lt: 0,
                },
              },
              data: {
                xp: 0,
              },
            });
          }

          await tx.userSkillXpHistory.deleteMany({
            where: {
              userId,
              source: "lesson_completed",
              sourceId: {
                in: lessonIds,
              },
            },
          });
        }
      }

      // 4) Apagar progressos e módulos desbloqueados desse curso
      await tx.userProgress.deleteMany({
        where: {
          userCourseId: userCourse.id,
        },
      });

      await tx.userModuleProgress.deleteMany({
        where: {
          userCourseId: userCourse.id,
        },
      });

      await tx.unlockedModule.deleteMany({
        where: {
          userCourseId: userCourse.id,
        },
      });

      // 5) Opcional: remover certificados do curso (mantido por enquanto)
      // await tx.certificate.deleteMany({
      //   where: {
      //     userId,
      //     courseId,
      //   },
      // });

      // 6) Remover a inscrição em si
      await tx.userCourse.delete({
        where: { id: userCourse.id },
      });
    });

    return {
      message: "User unenrolled from course and progress/xp cleared",
    };
  }

  private calculateXpForLevel(level: number): number {
    if (level <= 1) return 0;
    let total = 0;
    for (let lvl = 1; lvl < level; lvl++) {
      total += this.calculateXpRequiredForNextLevel(lvl);
    }
    return total;
  }

  private calculateXpRequiredForNextLevel(level: number): number {
    return 100 + (level - 1) * 50;
  }

  private calculateLevel(totalXp: number): number {
    if (totalXp < 100) return 1;

    let level = 1;
    while (this.calculateXpForLevel(level + 1) <= totalXp) {
      level++;
    }
    return level;
  }

  private calculateXpToNextLevel(level: number, totalXp: number): number {
    const xpForCurrentLevel = this.calculateXpForLevel(level);
    const xpForNextLevel = this.calculateXpForLevel(level + 1);
    const xpNeeded = xpForNextLevel - totalXp;
    return Math.max(0, xpNeeded);
  }
}

