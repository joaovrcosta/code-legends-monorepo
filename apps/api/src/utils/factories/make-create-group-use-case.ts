import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { PrismaModuleRepository } from "../../repositories/prisma/prisma-module-repository";
import { CreateGroupUseCase } from "../../use-cases/entities/Group/create";

export function makeCreateGroupUseCase() {
  const groupRepository = new PrismaGroupRepository();
  const moduleRepository = new PrismaModuleRepository();
  const createGroupUseCase = new CreateGroupUseCase(
    groupRepository,
    moduleRepository
  );

  return createGroupUseCase;
}
