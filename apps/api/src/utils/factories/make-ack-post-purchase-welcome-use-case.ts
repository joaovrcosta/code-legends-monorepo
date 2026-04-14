import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaPaymentsRepository } from "../../repositories/prisma/prisma-payments-repository";
import { AckPostPurchaseWelcomeUseCase } from "../../use-cases/entities/Account/ack-post-purchase-welcome";

export function makeAckPostPurchaseWelcomeUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const paymentsRepository = new PrismaPaymentsRepository();

  return new AckPostPurchaseWelcomeUseCase(usersRepository, paymentsRepository);
}
