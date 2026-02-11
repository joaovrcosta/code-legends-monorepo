import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { GetModuleBySlugUseCase } from "../../use-cases/entities/Module/get-by-slug";

export function makeGetModuleBySlugUseCase() {
  const moduleRepository = new PrismaModuleRepository();
  const getModuleBySlugUseCase = new GetModuleBySlugUseCase(moduleRepository);

  return getModuleBySlugUseCase;
}
