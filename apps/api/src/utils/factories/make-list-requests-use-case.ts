import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { ListRequestsUseCase } from "../../use-cases/entities/Request/list";

export function makeListRequestsUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const listRequestsUseCase = new ListRequestsUseCase(requestRepository);

  return listRequestsUseCase;
}
