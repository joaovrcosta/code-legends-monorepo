import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { UpdateGroupUseCase } from "../../use-cases/entities/Group/update";

export function makeUpdateGroupUseCase() {
  const groupRepository = new PrismaGroupRepository();
  const updateGroupUseCase = new UpdateGroupUseCase(groupRepository);

  return updateGroupUseCase;
}
