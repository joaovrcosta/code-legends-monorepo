import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { GetRequestByIdUseCase } from "../../use-cases/entities/Request/get-by-id";

export function makeGetRequestByIdUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const getRequestByIdUseCase = new GetRequestByIdUseCase(requestRepository);

  return getRequestByIdUseCase;
}
