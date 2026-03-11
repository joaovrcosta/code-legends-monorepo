import { Certificate } from "@prisma/client";
import { CertificateRepository } from "../../../repositories/certificate-repository";

interface ListAllCertificatesUseCaseRequest {
  page: number;
  limit?: number;
}

interface ListAllCertificatesUseCaseResponse {
  certificates: Certificate[];
  total: number;
}

export class ListAllCertificatesUseCase {
  constructor(private certificateRepository: CertificateRepository) {}

  async execute({
    page,
    limit = 20,
  }: ListAllCertificatesUseCaseRequest): Promise<ListAllCertificatesUseCaseResponse> {
    const { certificates, total } = await this.certificateRepository.listAll(page, limit);

    return {
      certificates,
      total,
    };
  }
}
