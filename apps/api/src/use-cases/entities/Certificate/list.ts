import { Certificate } from "@prisma/client";
import { CertificateRepository } from "../../../repositories/certificate-repository";

interface ListCertificatesUseCaseRequest {
  userId: string;
}

interface ListCertificatesUseCaseResponse {
  certificates: Certificate[];
}

export class ListCertificatesUseCase {
  constructor(private certificateRepository: CertificateRepository) {}

  async execute({
    userId,
  }: ListCertificatesUseCaseRequest): Promise<ListCertificatesUseCaseResponse> {
    const certificates = await this.certificateRepository.findByUserId(userId);

    return {
      certificates,
    };
  }
}
