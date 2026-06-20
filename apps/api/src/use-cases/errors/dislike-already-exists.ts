export class DislikeAlreadyExistsError extends Error {
  constructor() {
    super("Dislike already exists");
  }
}
