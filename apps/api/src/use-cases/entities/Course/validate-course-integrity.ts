import { ICourseRepository } from "../../../repositories/course-repository";
import { prisma } from "../../../lib/prisma";

interface ValidateCourseIntegrityRequest {
  courseId: string;
}

interface ValidateCourseIntegrityResponse {
  isValid: boolean;
  errors: string[];
}

export class ValidateCourseIntegrityUseCase {
  constructor(private courseRepository: ICourseRepository) {}

  async execute({
    courseId,
  }: ValidateCourseIntegrityRequest): Promise<ValidateCourseIntegrityResponse> {
    const errors: string[] = [];

    // Buscar curso com estrutura completa
    const course = await this.courseRepository.findById(courseId);

    if (!course) {
      return {
        isValid: false,
        errors: ["Curso não encontrado"],
      };
    }

    // Validar título
    if (!course.title || course.title.trim().length === 0) {
      errors.push("O curso deve possuir um título");
    }

    // Validar descrição
    if (!course.description || course.description.trim().length === 0) {
      errors.push("O curso deve possuir uma descrição");
    }

    // Validar instrutor
    if (!course.instructorId) {
      errors.push("O curso deve possuir um instrutor");
    }

    // Validar se possui ao menos um módulo
    const modules = await prisma.module.findMany({
      where: { courseId },
      include: {
        groups: {
          include: {
            lessons: true,
          },
        },
      },
    });

    if (modules.length === 0) {
      errors.push("O curso deve possuir ao menos um módulo");
    }

    // Validar se existe ao menos uma aula
    let totalLessons = 0;
    for (const module of modules) {
      for (const group of module.groups) {
        totalLessons += group.lessons.length;
      }
    }

    if (totalLessons === 0) {
      errors.push("O curso deve possuir ao menos uma aula");
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }
}
