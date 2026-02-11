export class LessonAlreadyExistsError extends Error {
  constructor() {
    super("Lesson with this slug already exists");
  }
}
