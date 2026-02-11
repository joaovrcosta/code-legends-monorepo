export class CertificateNotFoundError extends Error {
  constructor() {
    super("Certificate not found.");
  }
}
