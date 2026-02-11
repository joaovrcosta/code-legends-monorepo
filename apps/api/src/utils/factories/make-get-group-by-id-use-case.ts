import { PrismaGroupRepository } from "../../repositories/prisma/prisma-group-repository";
import { GetGroupByIdUseCase } from "../../use-cases/entities/Group/get-by-id";

export function makeGetGroupByIdUseCase() {
  const groupRepository = new PrismaGroupRepository();
  const getGroupByIdUseCase = new GetGroupByIdUseCase(groupRepository);

  return getGroupByIdUseCase;
}
