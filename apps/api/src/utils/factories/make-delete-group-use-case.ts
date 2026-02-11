import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { DeleteGroupUseCase } from "../../use-cases/entities/Group/delete";

export function makeDeleteGroupUseCase() {
  const groupRepository = new PrismaGroupRepository();
  const deleteGroupUseCase = new DeleteGroupUseCase(groupRepository);

  return deleteGroupUseCase;
}
