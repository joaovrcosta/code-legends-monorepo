export class CourseNotCompletedError extends Error {
  constructor() {
    super("Course must be completed before generating a certificate.");
  }
}

