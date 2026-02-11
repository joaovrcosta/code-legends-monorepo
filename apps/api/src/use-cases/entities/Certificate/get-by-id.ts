import { Certificate } from "@prisma/client";
import { CertificateRepository } from "../../../repositories/certificate-repository";
import { CertificateNotFoundError } from "../../errors/certificate-not-found";

interface GetCertificateByIdUseCaseRequest {
  certificateId: string;
}

interface GetCertificateByIdUseCaseResponse {
  certificate: Certificate;
}

export class GetCertificateByIdUseCase {
  constructor(private certificateRepository: CertificateRepository) {}

  async execute({
    certificateId,
  }: GetCertificateByIdUseCaseRequest): Promise<GetCertificateByIdUseCaseResponse> {
    const certificate = await this.certificateRepository.findById(
      certificateId
    );

    if (!certificate) {
      throw new CertificateNotFoundError();
    }

    return {
      certificate,
    };
  }
}
