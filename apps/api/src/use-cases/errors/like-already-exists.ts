export class LikeAlreadyExistsError extends Error {
  constructor() {
    super("Like already exists");
  }
}
