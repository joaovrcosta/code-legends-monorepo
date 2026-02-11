import { CertificateRepository } from "../../../repositories/certificate-repository";
import { CertificateNotFoundError } from "../../errors/certificate-not-found";

interface DeleteCertificateUseCaseRequest {
  certificateId: string;
}

export class DeleteCertificateUseCase {
  constructor(private certificateRepository: CertificateRepository) {}

  async execute({
    certificateId,
  }: DeleteCertificateUseCaseRequest): Promise<void> {
    const certificate = await this.certificateRepository.findById(
      certificateId
    );

    if (!certificate) {
      throw new CertificateNotFoundError();
    }

    await this.certificateRepository.delete(certificateId);
  }
}
