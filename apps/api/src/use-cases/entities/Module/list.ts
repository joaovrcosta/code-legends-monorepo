import { Module } from "@prisma/client";
import { IModuleRepository } from "../../../repositories/module-repository";

interface ListModulesRequest {
  courseId?: string;
}

interface ListModulesResponse {
  modules: Module[];
}

export class ListModulesUseCase {
  constructor(private moduleRepository: IModuleRepository) {}

  async execute(filters?: ListModulesRequest): Promise<ListModulesResponse> {
    const modules = await this.moduleRepository.findAll(filters?.courseId);

    return {
      modules,
    };
  }
}
