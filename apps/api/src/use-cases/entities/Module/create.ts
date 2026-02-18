import { Module } from "@prisma/client";
import { IModuleRepository } from "../../../repositories/module-repository";
import { ICourseRepository } from "../../../repositories/course-repository";
import { ModuleAlreadyExistsError } from "../../errors/module-already-exists";
import { CourseNotFoundError } from "../../errors/course-not-found";

interface CreateModuleRequest {
  title: string;
  slug: string;
  courseId: string;
}

interface CreateModuleResponse {
  module: Module;
}

export class CreateModuleUseCase {
  constructor(
    private moduleRepository: IModuleRepository,
    private courseRepository: ICourseRepository
  ) {}

  async execute(data: CreateModuleRequest): Promise<CreateModuleResponse> {
    // Verificar se o curso existe
    const course = await this.courseRepository.findById(data.courseId);

    if (!course) {
      throw new CourseNotFoundError();
    }

    // Verificar se o módulo já existe neste curso
    const moduleWithSameSlug = await this.moduleRepository.findBySlugAndCourseId(
      data.slug,
      data.courseId
    );

    if (moduleWithSameSlug) {
      throw new ModuleAlreadyExistsError();
    }

    const module = await this.moduleRepository.create(data);

    return {
      module,
    };
  }
}
