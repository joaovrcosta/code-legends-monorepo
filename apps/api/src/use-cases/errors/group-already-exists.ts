export class GroupAlreadyExistsError extends Error {
  constructor() {
    super("Group with this title already exists in this module");
  }
}
