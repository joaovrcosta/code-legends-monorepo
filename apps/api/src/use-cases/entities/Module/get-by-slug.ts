import { Module } from "@prisma/client";
import { IModuleRepository } from "../../../repositories/module-repository";
import { ModuleNotFoundError } from "../../errors/module-not-found";

interface GetModuleBySlugRequest {
  slug: string;
}

interface GetModuleBySlugResponse {
  module: Module;
}

export class GetModuleBySlugUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute({
    slug,
  }: GetModuleBySlugRequest): Promise<GetModuleBySlugResponse> {
    const module = await this.moduleRepository.findBySlug(slug);

    if (!module) {
      throw new ModuleNotFoundError();
    }

    return {
      module,
    };
  }
}
