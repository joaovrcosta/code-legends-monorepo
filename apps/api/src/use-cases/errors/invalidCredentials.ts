export class InvalidCredentialsError extends Error {
  constructor(message?: string) {
    super(message || "Invalid credentials");
    this.name = "InvalidCredentialsError";
  }
}
