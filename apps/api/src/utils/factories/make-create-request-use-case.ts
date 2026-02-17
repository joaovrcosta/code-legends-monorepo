import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { CreateRequestUseCase } from "../../use-cases/entities/Request/create";

export function makeCreateRequestUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const createRequestUseCase = new CreateRequestUseCase(requestRepository);

  return createRequestUseCase;
}
