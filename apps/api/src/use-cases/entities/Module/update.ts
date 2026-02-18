import { Module } from "@prisma/client";
import { IModuleRepository } from "../../../repositories/module-repository";
import { ModuleNotFoundError } from "../../errors/module-not-found";
import { ModuleAlreadyExistsError } from "../../errors/module-already-exists";

interface UpdateModuleRequest {
  id: string;
  title?: string;
  slug?: string;
}

interface UpdateModuleResponse {
  module: Module;
}

export class UpdateModuleUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(data: UpdateModuleRequest): Promise<UpdateModuleResponse> {
    // Verificar se o módulo existe
    const module = await this.moduleRepository.findById(data.id);

    if (!module) {
      throw new ModuleNotFoundError();
    }

    // Se está alterando o slug, verificar se não existe outro módulo com o mesmo slug neste curso
    if (data.slug && data.slug !== module.slug) {
      const moduleWithSameSlug = await this.moduleRepository.findBySlugAndCourseId(
        data.slug,
        module.courseId
      );

      if (moduleWithSameSlug) {
        throw new ModuleAlreadyExistsError();
      }
    }

    const updatedModule = await this.moduleRepository.update(data.id, {
      title: data.title,
      slug: data.slug,
    });

    return {
      module: updatedModule,
    };
  }
}
