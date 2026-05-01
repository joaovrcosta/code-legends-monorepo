import { PrismaCertificateRepository } from "../../repositories/prisma/prisma-certificate-repository";
import { PrismaCertificateTemplateRepository } from "../../repositories/prisma/prisma-certificate-template-repository";
import { PrismaUsersRepository } from "../../repositories/prisma/prisma-users-reposity";
import { PrismaUserCareerRepository } from "../../repositories/prisma/prisma-user-career-repository";
import { PrismaCareerRepository } from "../../repositories/prisma/prisma-career-repository";
import { CreateCareerCertificateUseCase } from "../../use-cases/entities/Certificate/create-career";

export function makeCreateCareerCertificateUseCase() {
  return new CreateCareerCertificateUseCase(
    new PrismaCertificateRepository(),
    new PrismaCertificateTemplateRepository(),
    new PrismaUsersRepository(),
    new PrismaUserCareerRepository(),
    new PrismaCareerRepository(),
  );
}
