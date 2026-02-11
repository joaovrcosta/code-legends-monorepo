export class ModuleAlreadyExistsError extends Error {
  constructor() {
    super("Module with this slug already exists");
  }
}
