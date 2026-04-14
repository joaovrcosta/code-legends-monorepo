import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaPaymentsRepository } from "../../repositories/prisma/prisma-payments-repository";
import { PrismaPlansRepository } from "../../repositories/prisma/prisma-plans-repository";
import { PrismaSubscriptionsRepository } from "../../repositories/prisma/prisma-subscriptions-repository";
import { GetPostPurchaseWelcomeUseCase } from "../../use-cases/entities/Account/get-post-purchase-welcome";

export function makeGetPostPurchaseWelcomeUseCase() {
  const usersRepository = new PrismaUsersRepository();
  const paymentsRepository = new PrismaPaymentsRepository();
  const plansRepository = new PrismaPlansRepository();
  const subscriptionsRepository = new PrismaSubscriptionsRepository();

  return new GetPostPurchaseWelcomeUseCase(
    usersRepository,
    paymentsRepository,
    plansRepository,
    subscriptionsRepository
  );
}
