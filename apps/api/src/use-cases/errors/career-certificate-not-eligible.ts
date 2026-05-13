export class CareerCertificateNotEligibleError extends Error {
  constructor(message = 'Requisitos para certificado de carreira não atendidos') {
    super(message)
    this.name = 'CareerCertificateNotEligibleError'
  }
}
