import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { UpdateModuleUseCase } from "../../use-cases/entities/Module/update";

export function makeUpdateModuleUseCase() {
  const moduleRepository = new PrismaModuleRepository();
  const updateModuleUseCase = new UpdateModuleUseCase(moduleRepository);

  return updateModuleUseCase;
}
