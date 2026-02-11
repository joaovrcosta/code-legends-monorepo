export class CategoryAlreadyExistsError extends Error {
  constructor() {
    super("Category with this slug already exists");
  }
}
