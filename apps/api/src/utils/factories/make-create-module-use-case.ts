import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { PrismaCourseRepository } from "../../repositories/prisma/prisma-course-repository";
import { CreateModuleUseCase } from "../../use-cases/entities/Module/create";

export function makeCreateModuleUseCase() {
  const moduleRepository = new PrismaModuleRepository();
  const courseRepository = new PrismaCourseRepository();
  const createModuleUseCase = new CreateModuleUseCase(
    moduleRepository,
    courseRepository
  );

  return createModuleUseCase;
}
