export class RequestNotFoundError extends Error {
  constructor() {
    super("Solicitação não encontrada.");
  }
}
