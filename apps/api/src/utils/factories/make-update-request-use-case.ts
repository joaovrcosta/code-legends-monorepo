import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { UpdateRequestUseCase } from "../../use-cases/entities/Request/update";

export function makeUpdateRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const updateRequestUseCase = new UpdateRequestUseCase(requestRepository);

  return updateRequestUseCase;
}
