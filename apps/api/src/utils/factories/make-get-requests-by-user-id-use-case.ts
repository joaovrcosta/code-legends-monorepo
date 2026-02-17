import { PrismaRequestRepository } from "../../repositories/prisma/prisma-request-repository";
import { GetRequestsByUserIdUseCase } from "../../use-cases/entities/Request/get-by-user-id";

export function makeGetRequestsByUserIdUseCase() {
  const requestRepository = new PrismaRequestRepository();
  const getRequestsByUserIdUseCase = new GetRequestsByUserIdUseCase(
    requestRepository
  );

  return getRequestsByUserIdUseCase;
}
