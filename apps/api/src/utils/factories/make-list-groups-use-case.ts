import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { ListGroupsUseCase } from "../../use-cases/entities/Group/list";

export function makeListGroupsUseCase() {
  const groupRepository = new PrismaGroupRepository();
  const listGroupsUseCase = new ListGroupsUseCase(groupRepository);

  return listGroupsUseCase;
}
