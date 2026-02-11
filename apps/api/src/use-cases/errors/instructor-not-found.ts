export class InstructorNotFoundError extends Error {
  constructor() {
    super("Instructor not found");
  }
}
