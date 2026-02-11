import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { DeleteModuleUseCase } from "../../use-cases/entities/Module/delete";

export function makeDeleteModuleUseCase() {
  const moduleRepository = new PrismaModuleRepository();
  const deleteModuleUseCase = new DeleteModuleUseCase(moduleRepository);

  return deleteModuleUseCase;
}
