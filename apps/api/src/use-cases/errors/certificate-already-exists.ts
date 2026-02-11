export class CertificateAlreadyExistsError extends Error {
  constructor() {
    super("Certificate already exists for this course.");
  }
}

