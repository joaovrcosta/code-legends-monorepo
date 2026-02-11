import { IUserCourseRepository } from "../../../repositories/user-course-repository";
import { IUsersRepository } from "../../../repositories/users-repository";
import { IUserProgressRepository } from "../../../repositories/user-progress-repository";
import { UserNotFoundError } from "../../errors/user-not-found";
import { prisma } from "../../../lib/prisma";

interface MyLearningRequest {
  userId: string;
}

interface CourseItem {
  id: string;
  title: string;
  icon: string | null;
  progress: number;
}

interface MyLearningResponse {
  inProgress: CourseItem[];
  completed: CourseItem[];
}

export class MyLearningUseCase {
  constructor(
    private userCourseRepository: IUserCourseRepository,
    private usersRepository: IUsersRepository,
    private userProgressRepository: IUserProgressRepository
  ) {}

  async execute({ userId }: MyLearningRequest): Promise<MyLearningResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Buscar todos os cursos inscritos do usuário
    const userCourses = await this.userCourseRepository.findByUserId(userId);

    const inProgress: CourseItem[] = [];
    const completed: CourseItem[] = [];

    // Processar cada curso
    for (const userCourse of userCourses) {
      // Buscar progressos do usuário neste curso
      const userProgresses = await this.userProgressRepository.findByUserCourse(
        userCourse.id
      );

      // Buscar todos os módulos do curso com grupos e aulas para contar lições
      const modules = await prisma.module.findMany({
        where: { courseId: userCourse.courseId },
        include: {
          groups: {
            include: {
              lessons: {
                select: {
                  id: true,
                },
              },
            },
          },
        },
      });

      // Calcular progresso do curso
      const allLessons: Array<{ id: number }> = [];
      modules.forEach((module) => {
        module.groups.forEach((group) => {
          group.lessons.forEach((lesson) => {
            allLessons.push({ id: lesson.id });
          });
        });
      });

      const totalLessons = allLessons.length;
      const completedLessons = userProgresses.filter(
        (p) => p.isCompleted
      ).length;
      const courseProgress =
        totalLessons > 0 ? completedLessons / totalLessons : 0;
      const isCompleted = courseProgress === 1 || userCourse.isCompleted;

      // Buscar informações do curso
      const course = await prisma.course.findUnique({
        where: { id: userCourse.courseId },
        select: {
          id: true,
          title: true,
          icon: true,
        },
      });

      if (course) {
        const courseItem: CourseItem = {
          id: course.id,
          title: course.title,
          icon: course.icon,
          progress: courseProgress,
        };

        // Separar em progresso ou completo
        if (isCompleted) {
          completed.push(courseItem);
        } else {
          inProgress.push(courseItem);
        }
      }
    }

    return {
      inProgress,
      completed,
    };
  }
}
