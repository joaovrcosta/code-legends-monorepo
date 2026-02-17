import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { DeleteRequestUseCase } from "../../use-cases/entities/Request/delete";

export function makeDeleteRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const deleteRequestUseCase = new DeleteRequestUseCase(requestRepository);

  return deleteRequestUseCase;
}
