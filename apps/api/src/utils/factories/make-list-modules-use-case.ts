import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { ListModulesUseCase } from "../../use-cases/entities/Module/list";

export function makeListModulesUseCase() {
  const moduleRepository = new PrismaModuleRepository();
  const listModulesUseCase = new ListModulesUseCase(moduleRepository);

  return listModulesUseCase;
}
