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
  ) { }

  async execute({ userId }: MyLearningRequest): Promise<MyLearningResponse> {
    // Verificar se o usuário existe
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      throw new UserNotFoundError();
    }

    // Buscar todos os cursos inscritos do usuário (já inclui course com instructor e category)
    const userCourses = await this.userCourseRepository.findByUserId(userId);

    // Se não houver cursos, retornar arrays vazios
    if (userCourses.length === 0) {
      return {
        inProgress: [],
        completed: [],
      };
    }

    // Extrair IDs para queries em batch
    const userCourseIds = userCourses.map((uc) => uc.id);
    const courseIds = userCourses.map((uc) => uc.courseId);

    // Buscar TODOS os progressos de uma vez (fora do loop)
    const allUserProgresses = await prisma.userProgress.findMany({
      where: {
        userCourseId: { in: userCourseIds },
      },
    });

    // Buscar TODOS os módulos de uma vez (fora do loop)
    const allModules = await prisma.module.findMany({
      where: {
        courseId: { in: courseIds },
      },
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

    // Criar Maps para indexação O(1) em memória
    // Map<userCourseId, UserProgress[]>
    const progressMap = new Map<string, (typeof allUserProgresses)[0][]>();
    for (const progress of allUserProgresses) {
      const existing = progressMap.get(progress.userCourseId) || [];
      existing.push(progress);
      progressMap.set(progress.userCourseId, existing);
    }

    // Map<courseId, Module[]>
    const modulesMap = new Map<string, (typeof allModules)[0][]>();
    for (const module of allModules) {
      const existing = modulesMap.get(module.courseId) || [];
      existing.push(module);
      modulesMap.set(module.courseId, existing);
    }

    const inProgress: CourseItem[] = [];
    const completed: CourseItem[] = [];

    // Processar cada curso (agora usando dados em memória)
    for (const userCourse of userCourses) {
      // Buscar progressos do usuário neste curso (do Map)
      const userProgresses = progressMap.get(userCourse.id) || [];

      // Buscar todos os módulos do curso (do Map)
      const modules = modulesMap.get(userCourse.courseId) || [];

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

      // Usar o course que já vem no findByUserId (não precisa buscar novamente)
      // Type assertion: findByUserId retorna UserCourse com course incluído
      const course = (userCourse as any).course;

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
