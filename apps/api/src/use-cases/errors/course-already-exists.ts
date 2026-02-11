export class CourseAlreadyExistsError extends Error {
  constructor() {
    super("Course with this slug already exists");
  }
}
